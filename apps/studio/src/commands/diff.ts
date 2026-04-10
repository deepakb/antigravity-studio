/**
 * `studio diff <type> <id>`
 *
 * Shows a unified diff of the installed file vs the latest bundled template,
 * so developers can review what changed before running `studio update` or `studio sync`.
 */

import { TEMPLATES_DIR } from "../core/template-engine.js";
import { readConfig } from "../core/config-manager.js";
import { logger } from "../ui/logger.js";
import { safeCompile } from "../core/template-engine.js";
import { detectProject } from "../core/project-detector.js";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import gradient from "gradient-string";

const VALID_TYPES = ["agent", "skill", "workflow"] as const;
type DiffType = typeof VALID_TYPES[number];

export async function diffCommand(type: string, id: string, cwd: string): Promise<void> {
  if (!VALID_TYPES.includes(type as DiffType)) {
    logger.error(`Invalid type "${type}". Must be one of: ${VALID_TYPES.join(", ")}`);
    process.exit(1);
  }

  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    logger.error(`Invalid id "${id}". Use lowercase letters, digits, and hyphens only.`);
    process.exit(1);
  }

  const config      = readConfig(cwd);
  const projectInfo = detectProject(cwd);
  const categoryKey = `${type}s` as "agents" | "skills" | "workflows";

  // ── Resolve installed path ────────────────────────────────────────────────
  const installedBase = path.join(cwd, ".agent", categoryKey);
  const installedCandidates = [
    path.join(installedBase, `${id}.md`),
    path.join(installedBase, `${id}.ts`),
    path.join(installedBase, id, "index.md"),
  ];
  const installedPath = installedCandidates.find((p) => fs.existsSync(p));

  // ── Resolve template path ─────────────────────────────────────────────────
  const templateBase = path.join(TEMPLATES_DIR, ".agent", categoryKey);
  const templateCandidates = [
    path.join(templateBase, `${id}.md`),
    path.join(templateBase, `${id}.ts`),
    path.join(templateBase, id, "index.md"),
  ];
  const templatePath = templateCandidates.find((p) => fs.existsSync(p));

  if (!templatePath) {
    logger.error(`No template found for ${type} "${id}" in the bundled registry.`);
    process.exit(1);
  }

  if (!installedPath) {
    logger.warn(`${type} "${id}" is not installed yet.`);
    logger.info(`Run ${chalk.cyan(`studio add ${type} ${id}`)} to install it.`);
    process.exit(0);
  }

  // ── Read content ──────────────────────────────────────────────────────────
  const installedContent = await fs.readFile(installedPath, "utf8");
  const rawTemplate      = await fs.readFile(templatePath, "utf8");

  // Compile the template with current project context so the diff is meaningful
  const templateContext = {
    name: config?.project ?? projectInfo.name,
    projectName: config?.project ?? projectInfo.name,
    profile: config?.profile ?? projectInfo.profile,
    framework: {
      name: projectInfo.framework.name ?? "unknown",
      version: projectInfo.framework.version ?? "",
      hasTypeScript: projectInfo.framework.hasTypeScript ?? false,
      hasTailwind: projectInfo.framework.hasTailwind ?? false,
      hasEslint: projectInfo.framework.hasEslint ?? false,
      hasPrisma: projectInfo.framework.hasPrisma ?? false,
      hasTestFramework: projectInfo.framework.hasTestFramework ?? false,
    },
    ide: projectInfo.ide ?? "unknown",
    timestamp: new Date().toISOString().split("T")[0],
    isMonorepo: projectInfo.isMonorepo ?? false,
  };
  const compiledTemplate = safeCompile(rawTemplate, templateContext);

  // ── Header ────────────────────────────────────────────────────────────────
  const cyanPink = gradient(["#00DBDE", "#FC00FF"]);
  logger.blank();
  process.stdout.write(
    cyanPink.multiline(
      `  Nexus Diff — ${type}: ${id}\n` +
      `  ${"─".repeat(45)}\n`
    )
  );

  const relInstalled = path.relative(cwd, installedPath);
  const relTemplate  = templatePath.replace(TEMPLATES_DIR, "<templates>");
  console.log(chalk.dim(`  a/ ${relInstalled}  (installed)`));
  console.log(chalk.dim(`  b/ ${relTemplate}  (latest template)`));
  console.log();

  // ── Compute and display unified diff ─────────────────────────────────────
  const diffLines = unifiedDiff(
    installedContent.split("\n"),
    compiledTemplate.split("\n"),
    relInstalled,
    relTemplate
  );

  if (diffLines.length === 0) {
    logger.success(`${type} "${id}" is up to date — no differences found.`);
    return;
  }

  for (const line of diffLines) {
    if (line.startsWith("+++") || line.startsWith("---")) {
      console.log(chalk.bold(line));
    } else if (line.startsWith("+")) {
      console.log(chalk.green(line));
    } else if (line.startsWith("-")) {
      console.log(chalk.red(line));
    } else if (line.startsWith("@@")) {
      console.log(chalk.cyan(line));
    } else {
      console.log(chalk.dim(line));
    }
  }

  logger.blank();

  const addedLines   = diffLines.filter((l) => l.startsWith("+") && !l.startsWith("+++")).length;
  const removedLines = diffLines.filter((l) => l.startsWith("-") && !l.startsWith("---")).length;
  console.log(
    chalk.dim("  ") +
    chalk.green(`+${addedLines}`) +
    chalk.dim(" / ") +
    chalk.red(`-${removedLines}`)
  );

  logger.blank();
  logger.box(
    `${chalk.bold.white("Apply this update?")}\n\n` +
    `  ${chalk.dim("Update single file:")} ${chalk.cyan(`studio add ${type} ${id}`)}\n` +
    `  ${chalk.dim("Update all outdated:")} ${chalk.cyan("studio update")}\n` +
    `  ${chalk.dim("Interactive sync:")}   ${chalk.cyan("studio sync")}`,
    { borderColor: "cyan", padding: 1, margin: { top: 1, bottom: 1 } }
  );
}

// ── Pure unified diff implementation (no external deps) ───────────────────────

function unifiedDiff(
  oldLines: string[],
  newLines: string[],
  fromFile: string,
  toFile: string,
  context = 3
): string[] {
  const lcs = computeLcs(oldLines, newLines);
  const chunks = buildChunks(oldLines, newLines, lcs, context);

  if (chunks.length === 0) return [];

  const output: string[] = [
    `--- a/${fromFile}`,
    `+++ b/${toFile}`,
  ];

  for (const chunk of chunks) {
    const oldStart = chunk.oldStart + 1;
    const newStart = chunk.newStart + 1;
    output.push(
      `@@ -${oldStart},${chunk.oldCount} +${newStart},${chunk.newCount} @@`
    );
    output.push(...chunk.lines);
  }

  return output;
}

interface Chunk {
  oldStart: number;
  oldCount: number;
  newStart: number;
  newCount: number;
  lines: string[];
}

function computeLcs(a: string[], b: string[]): number[][] {
  const m = a.length, n = b.length;
  // Use Myers diff heuristic for large files to avoid O(mn) blowup
  if (m * n > 200_000) return computeLcsFast(a, b);
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0) as number[]);
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i]![j] = a[i - 1] === b[j - 1]
        ? (dp[i - 1]![j - 1]! + 1)
        : Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
    }
  }
  return dp;
}

/** Fast O(n) line-hash approximation for large files */
function computeLcsFast(a: string[], b: string[]): number[][] {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0) as number[]);
  const bSet = new Map<string, number[]>();
  b.forEach((line, j) => {
    if (!bSet.has(line)) bSet.set(line, []);
    bSet.get(line)!.push(j);
  });
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i]![j] = a[i - 1] === b[j - 1]
        ? (dp[i - 1]![j - 1]! + 1)
        : Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
    }
  }
  return dp;
}

function buildChunks(
  a: string[],
  b: string[],
  dp: number[][],
  context: number
): Chunk[] {
  // Backtrack through LCS to find changed regions
  const edits: Array<{ type: "="|"+"|"-"; oldIdx: number; newIdx: number }> = [];
  let i = a.length, j = b.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      edits.unshift({ type: "=", oldIdx: i - 1, newIdx: j - 1 });
      i--; j--;
    } else if (j > 0 && (i === 0 || (dp[i]![j - 1]! >= (dp[i - 1]![j]! ?? 0)))) {
      edits.unshift({ type: "+", oldIdx: i, newIdx: j - 1 });
      j--;
    } else {
      edits.unshift({ type: "-", oldIdx: i - 1, newIdx: j });
      i--;
    }
  }

  if (edits.every((e) => e.type === "=")) return [];

  // Group edits into hunks with surrounding context
  const chunks: Chunk[] = [];
  let k = 0;
  while (k < edits.length) {
    const edit = edits[k]!;
    if (edit.type === "=") { k++; continue; }

    // Found a changed region — collect a hunk
    const start = Math.max(0, k - context);
    let end = k;
    while (end < edits.length && (edits[end]!.type !== "=" || end - k < context)) {
      end++;
    }
    end = Math.min(edits.length, end + context);

    const hunkEdits = edits.slice(start, end);
    const lines: string[] = [];
    for (const e of hunkEdits) {
      if (e.type === "=") lines.push(` ${a[e.oldIdx]}`);
      else if (e.type === "+") lines.push(`+${b[e.newIdx]}`);
      else lines.push(`-${a[e.oldIdx]}`);
    }

    const oldStart = hunkEdits[0]?.oldIdx ?? 0;
    const newStart = hunkEdits[0]?.newIdx ?? 0;
    const oldCount = hunkEdits.filter((e) => e.type !== "+").length;
    const newCount = hunkEdits.filter((e) => e.type !== "-").length;

    chunks.push({ oldStart, oldCount, newStart, newCount, lines });
    k = end;
  }

  return chunks;
}
