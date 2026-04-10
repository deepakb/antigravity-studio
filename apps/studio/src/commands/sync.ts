/**
 * sync command
 *
 * Compares the files installed in .agent/ against the bundled templates
 * and reports drift. Users can then choose to pull specific updates.
 *
 * Usage:
 *   studio sync              → interactive: show drift, ask what to update
 *   studio sync --check      → CI mode: exit 1 if any drift detected
 *   studio sync --force      → overwrite everything (non-interactive)
 */

import * as p from "@clack/prompts";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import crypto from "crypto";
import { readConfig, writeConfig } from "../core/config-manager.js";
import { loadRegistry, TEMPLATES_DIR, copyTemplates } from "../core/template-engine.js";
import { generateIdeConfigs } from "../core/ide-config-generator.js";
import { detectProject } from "../core/project-detector.js";
import { loadCompanyConfig, applyCompanySkillPolicy } from "../core/enterprise-config.js";
import { logger } from "../ui/logger.js";
import { Spinner } from "../ui/spinner.js";
import type { AgStudioConfig } from "../types/config.js";
import { getDriftAgentHint } from "../core/agent-gate-map.js";

export interface SyncOptions {
  check?: boolean;   // CI mode — exit 1 on drift, no prompts
  force?: boolean;   // Overwrite everything without asking
  quiet?: boolean;   // Suppress output (for programmatic use)
  all?:   boolean;   // Monorepo mode — run sync across all apps/* and packages/*
}

interface DriftEntry {
  category: "agents" | "skills" | "workflows" | "scripts";
  id: string;
  status: "up-to-date" | "outdated" | "missing" | "unknown";
  installedHash?: string;
  latestHash?: string;
}

export async function syncCommand(
  cwd: string = process.cwd(),
  opts: SyncOptions = {}
): Promise<void> {
  // ── Monorepo --all mode ─────────────────────────────────────────────────────
  if (opts.all) {
    await syncMonorepo(cwd, opts);
    return;
  }

  const config = readConfig(cwd);

  if (!config) {
    logger.error("No .agstudio.json found. Run `studio init` first.");
    process.exit(1);
  }

  if (!opts.quiet) {
    logger.blank();
    logger.info(chalk.bold("🔄  Nexus Sync — checking for drift..."));
    logger.blank();
  }

  // ── 1. Compute drift ────────────────────────────────────────────────────────
  const spinner = new Spinner("Analysing installed files...").start();
  const drift = await computeDrift(cwd, config);
  spinner.succeed(`Scanned ${drift.length} installed items`);

  const outdated = drift.filter((d) => d.status === "outdated");
  const missing  = drift.filter((d) => d.status === "missing");
  const upToDate = drift.filter((d) => d.status === "up-to-date");

  // ── 2. Company policy check ─────────────────────────────────────────────────
  const companyConfig = loadCompanyConfig(cwd);
  const missingRequired: string[] = [];
  if (companyConfig) {
    for (const req of companyConfig.requiredSkills) {
      if (!config.installed.skills.includes(req)) {
        missingRequired.push(req);
      }
    }
  }

  // ── 3. Report ───────────────────────────────────────────────────────────────
  if (!opts.quiet) {
    if (upToDate.length > 0) {
      logger.dim(`✅  ${upToDate.length} item(s) up to date`);
    }
    if (outdated.length > 0) {
      logger.info(`⚠️   ${chalk.yellow(outdated.length.toString())} item(s) have updates available:`);
      for (const d of outdated) {
        const hint = getDriftAgentHint(d.category, d.id);
        logger.dim(`     ${d.category}/${chalk.yellow(d.id)}${hint}`);
      }
    }
    if (missing.length > 0) {
      logger.info(`❌  ${chalk.red(missing.length.toString())} item(s) are missing from .agent/:`);
      for (const d of missing) {
        const hint = getDriftAgentHint(d.category, d.id);
        logger.dim(`     ${d.category}/${chalk.red(d.id)}${hint}`);
      }
    }
    if (missingRequired.length > 0) {
      logger.blank();
      logger.info(chalk.bold("🏢 Company policy violations:"));
      for (const req of missingRequired) {
        logger.warn(`  Required skill not installed: ${chalk.yellow(req)}`);
      }
    }
    logger.blank();
  }

  // ── 4. CI mode ──────────────────────────────────────────────────────────────
  if (opts.check) {
    const hasDrift = outdated.length > 0 || missing.length > 0 || missingRequired.length > 0;
    if (hasDrift) {
      logger.error("Drift detected. Run `studio sync` to update.");
      process.exit(1);
    }
    logger.success("No drift detected. All configs are up to date.");
    return;
  }

  // ── 5. Nothing to do ────────────────────────────────────────────────────────
  if (outdated.length === 0 && missing.length === 0 && missingRequired.length === 0) {
    logger.success("Everything is up to date! 🎉");
    return;
  }

  // ── 6. Force mode ───────────────────────────────────────────────────────────
  if (opts.force) {
    await pullUpdates(cwd, config, [...outdated, ...missing], missingRequired, true);
    return;
  }

  // ── 7. Interactive mode ─────────────────────────────────────────────────────
  const choices: { value: string; label: string; hint: string }[] = [];

  for (const d of outdated) {
    choices.push({
      value: `${d.category}:${d.id}`,
      label: `${d.category}/${d.id}`,
      hint: "update available",
    });
  }
  for (const d of missing) {
    choices.push({
      value: `${d.category}:${d.id}`,
      label: `${d.category}/${d.id}`,
      hint: "file missing",
    });
  }
  for (const req of missingRequired) {
    choices.push({
      value: `skills:${req}`,
      label: `skills/${req}`,
      hint: "required by company policy",
    });
  }

  const selected = await p.multiselect({
    message: "Select items to pull from the latest templates:",
    options: choices,
    initialValues: choices.map((c) => c.value), // default: select all
    required: false,
  });

  if (p.isCancel(selected) || (selected as string[]).length === 0) {
    logger.info("Sync cancelled — no changes made.");
    return;
  }

  const selectedSet = new Set(selected as string[]);
  const toUpdate    = [...outdated, ...missing].filter((d) => selectedSet.has(`${d.category}:${d.id}`));
  const reqToAdd    = missingRequired.filter((r) => selectedSet.has(`skills:${r}`));

  await pullUpdates(cwd, config, toUpdate, reqToAdd, false);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function computeDrift(cwd: string, config: AgStudioConfig): Promise<DriftEntry[]> {
  const entries: DriftEntry[] = [];
  const storedHashes = config.installedHashes ?? {};
  const categories: Array<"agents" | "skills" | "workflows" | "scripts"> = [
    "agents", "skills", "workflows", "scripts",
  ];

  for (const category of categories) {
    const ids: string[] = config.installed[category] ?? [];
    for (const id of ids) {
      const installedPath = findInstalledFile(cwd, category, id);
      const templatePath  = findTemplateFile(category, id);

      if (!installedPath || !(await fs.pathExists(installedPath))) {
        entries.push({ category, id, status: "missing" });
        continue;
      }
      if (!templatePath || !(await fs.pathExists(templatePath))) {
        entries.push({ category, id, status: "unknown" });
        continue;
      }

      // Compare the CURRENT raw template hash against the hash that was stored
      // when this file was last installed. This avoids the false-positive caused
      // by comparing a Handlebars-compiled file against the raw template.
      const currentRawHash = await hashFile(templatePath);
      const storedRawHash  = findStoredHash(storedHashes, category, id);

      entries.push({
        category,
        id,
        status: storedRawHash === undefined ? "unknown"
              : currentRawHash === storedRawHash ? "up-to-date"
              : "outdated",
        ...(storedRawHash !== undefined && { installedHash: storedRawHash }),
        latestHash: currentRawHash,
      });
    }
  }

  return entries;
}

/**
 * Canonical file name used as the hash reference for directory-based templates.
 * Must match the priority used in findTemplateFile() so both sides of the
 * comparison always hash the same file.
 */
const CANONICAL_FILE: Record<string, string[]> = {
  skills:  ["SKILL.md", "index.md"],
  scripts: ["manifest.md", "node.sh"],
};

/**
 * Find the stored raw hash for a given category/id pair.
 * Hashes are keyed by relPath (e.g. "agents/security-analyst.md" or
 * "skills/clean-architecture/SKILL.md").
 *
 * For directory-based templates (skills, scripts) we try the canonical
 * file names first so the result is deterministic regardless of key-insertion
 * order in installedHashes.
 */
function findStoredHash(
  hashes: Record<string, string>,
  category: string,
  id: string
): string | undefined {
  // 1. Try canonical files first (directory-based templates)
  const canonicals = CANONICAL_FILE[category];
  if (canonicals) {
    for (const canonical of canonicals) {
      const key = `${category}/${id}/${canonical}`;
      if (hashes[key] !== undefined) return hashes[key];
    }
  }

  // 2. Fallback: iterate all keys for direct files and legacy layouts
  for (const key of Object.keys(hashes)) {
    const parts = key.split("/");
    if (parts[0] !== category) continue;
    // Direct file: "agents/security-analyst.md" → basename without ext
    const basename = parts[1] ? path.basename(parts[1], path.extname(parts[1])) : "";
    if (basename === id) return hashes[key];
    // Directory-indexed: "skills/clean-architecture/index.md" → parts[1] === id
    if (parts[1] === id) return hashes[key];
  }
  return undefined;
}

function findInstalledFile(cwd: string, category: string, id: string): string | null {
  const base = path.join(cwd, ".agent", category);
  // Direct files only (not directories)
  for (const ext of [".md", ".ts"]) {
    const p = path.join(base, `${id}${ext}`);
    if (fs.existsSync(p) && !fs.statSync(p).isDirectory()) return p;
  }
  // Directory-based templates (skills, scripts)
  const dir = path.join(base, id);
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    const canonicals = CANONICAL_FILE[category] ?? ["index.md", "manifest.md", "SKILL.md"];
    for (const candidate of canonicals) {
      const p = path.join(dir, candidate);
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

function findTemplateFile(category: string, id: string): string | null {
  const base = path.join(TEMPLATES_DIR, ".agent", category);
  // Direct files only — never match directories (avoid false positive from
  // the empty-extension check returning a directory path which hashFile
  // can't read, producing an empty hash that always differs from stored).
  for (const ext of [".md", ".ts"]) {
    const p = path.join(base, `${id}${ext}`);
    if (fs.existsSync(p) && !fs.statSync(p).isDirectory()) return p;
  }
  // Directory-based templates (skills, scripts) — use same canonical
  // priority as findStoredHash() so both sides hash the identical file.
  const dir = path.join(base, id);
  if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
    const canonicals = CANONICAL_FILE[category] ?? ["index.md", "manifest.md", "SKILL.md"];
    for (const candidate of canonicals) {
      const p = path.join(dir, candidate);
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

async function hashFile(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return crypto.createHash("sha256").update(content).digest("hex").slice(0, 12);
  } catch {
    return "";
  }
}

async function pullUpdates(
  cwd: string,
  config: AgStudioConfig,
  items: DriftEntry[],
  requiredSkills: string[],
  force: boolean
): Promise<void> {
  const projectInfo = detectProject(cwd);
  const templateContext = {
    name: config.project ?? projectInfo.name,
    projectName: config.project ?? projectInfo.name,
    profile: config.profile ?? projectInfo.profile,
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

  // Build include options from selected drift items + required skills
  const include: { agents?: string[]; skills?: string[]; workflows?: string[]; scripts?: string[] } = {};
  for (const item of items) {
    if (!include[item.category]) include[item.category] = [];
    include[item.category]!.push(item.id);
  }
  if (requiredSkills.length > 0) {
    include.skills = [...(include.skills ?? []), ...requiredSkills];
  }

  const spinner = new Spinner("Pulling updates...").start();
  const result = await copyTemplates(cwd, { include, force: true }, templateContext);
  spinner.succeed(`Updated ${result.copied.length} file(s)`);

  // Merge new raw template hashes into config so drift detection stays accurate
  const needsWrite = Object.keys(result.hashes).length > 0 || requiredSkills.length > 0;
  config.installedHashes = { ...(config.installedHashes ?? {}), ...result.hashes };

  // Update .agstudio.json with newly added required skills
  if (requiredSkills.length > 0) {
    for (const skill of requiredSkills) {
      if (!config.installed.skills.includes(skill)) {
        config.installed.skills.push(skill);
      }
    }
    logger.success(`Added ${requiredSkills.length} company-required skill(s) to .agstudio.json`);
  }

  if (needsWrite) {
    await writeConfig(config, cwd);
  }

  // Re-sync IDE configs if relevant files were updated
  const hasIdeFiles = fs.existsSync(path.join(cwd, ".github", "copilot-instructions.md")) ||
    fs.existsSync(path.join(cwd, ".cursor")) ||
    fs.existsSync(path.join(cwd, "CLAUDE.md"));

  if (hasIdeFiles) {
    const ides: string[] = ["antigravity"];
    if (fs.existsSync(path.join(cwd, ".github", "copilot-instructions.md"))) ides.push("copilot");
    if (fs.existsSync(path.join(cwd, ".cursor"))) ides.push("cursor");
    if (fs.existsSync(path.join(cwd, "CLAUDE.md"))) ides.push("claude");
    if (fs.existsSync(path.join(cwd, ".windsurfrules"))) ides.push("windsurf");

    await generateIdeConfigs(cwd, ides, {
      projectName: config.project ?? projectInfo.name,
      profile: config.profile ?? projectInfo.profile,
      framework: templateContext.framework,
      selectedAgents: config.installed.agents ?? [],
      selectedSkills: config.installed.skills ?? [],
      force: true,
    });
    logger.success("IDE configs re-synced");
  }

  logger.blank();
  logger.success("Sync complete! ✨");
}
// ── Monorepo --all helper ─────────────────────────────────────────────────────

/**
 * Walks `apps/` and `packages/` under cwd and runs syncCommand for each
 * sub-directory that contains a `.agstudio.json` config file.
 */
async function syncMonorepo(cwd: string, opts: Omit<SyncOptions, "all">): Promise<void> {
  const isMonorepo =
    fs.existsSync(path.join(cwd, "turbo.json")) ||
    fs.existsSync(path.join(cwd, "pnpm-workspace.yaml")) ||
    fs.existsSync(path.join(cwd, "nx.json")) ||
    fs.existsSync(path.join(cwd, "lerna.json"));

  if (!isMonorepo) {
    logger.warn("--all flag is for monorepos (requires turbo.json, pnpm-workspace.yaml, nx.json, or lerna.json at root).");
    logger.info(`Running single-project sync instead.`);
    await syncCommand(cwd, { ...opts, all: false });
    return;
  }

  const candidates: string[] = [];
  for (const bucket of ["apps", "packages"]) {
    const bucketDir = path.join(cwd, bucket);
    if (!fs.existsSync(bucketDir)) continue;
    for (const entry of fs.readdirSync(bucketDir)) {
      const subDir = path.join(bucketDir, entry);
      if (!fs.statSync(subDir).isDirectory()) continue;
      if (fs.existsSync(path.join(subDir, ".agstudio.json"))) {
        candidates.push(subDir);
      }
    }
  }

  if (candidates.length === 0) {
    logger.warn("No sub-packages with .agstudio.json found under apps/ or packages/.");
    logger.info("Run `studio init` inside each sub-package first.");
    return;
  }

  logger.blank();
  logger.info(`Monorepo sync — found ${chalk.cyan(String(candidates.length))} initialized package(s)`);
  logger.blank();

  let passed = 0, failed = 0;
  for (const subDir of candidates) {
    const rel = path.relative(cwd, subDir);
    logger.step(chalk.bold(rel));
    try {
      await syncCommand(subDir, { ...opts, all: false, quiet: true });
      logger.success(`${rel} — synced`);
      passed++;
    } catch (err: any) {
      logger.error(`${rel} — ${err?.message ?? String(err)}`);
      failed++;
    }
    logger.blank();
  }

  logger.blank();
  if (failed === 0) {
    logger.success(`Monorepo sync complete — ${passed}/${candidates.length} packages updated ✨`);
  } else {
    logger.warn(`Monorepo sync finished with errors — ${passed} passed, ${failed} failed.`);
    if (opts.check) process.exit(1);
  }
}