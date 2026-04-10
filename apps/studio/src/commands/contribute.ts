/**
 * `studio contribute [type] [id]`
 *
 * Guides a developer through contributing a locally-created template back
 * to the shared Nexus Studio registry via a GitHub Pull Request.
 *
 * Flow:
 *   1. Pick type + id (or prompt interactively from local templates)
 *   2. Validate template content (frontmatter, required fields)
 *   3. Show preview of the file that will be submitted
 *   4. Print the exact destination path inside the nexus-studio repo
 *   5. Print the registry.json snippet ready to paste
 *   6. Print step-by-step git instructions
 *   7. Offer to open GitHub in browser
 *
 * Usage:
 *   studio contribute                        ← interactive picker
 *   studio contribute skill my-skill-id
 *   studio contribute agent my-agent-id
 *   studio contribute workflow my-workflow-id
 */

import * as p from "@clack/prompts";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import gradient from "gradient-string";
import boxen from "boxen";
import { execSync } from "child_process";
import { logger } from "../ui/logger.js";
import { isWindows } from "../core/platform.js";

const VALID_TYPES = ["agent", "skill", "workflow"] as const;
type ContributeType = (typeof VALID_TYPES)[number];

const LOCAL_TEMPLATES_DIR = ".agstudio/templates";

const REPO_URL = "https://github.com/deepakbiswal/nexus-studio";
const REPO_TEMPLATES_BASE = "packages/templates/.agent";
const PR_URL = `${REPO_URL}/compare`;

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function contributeCommand(
  type: string | undefined,
  id: string | undefined,
  cwd: string
): Promise<void> {
  const cyanPink = gradient(["#00DBDE", "#FC00FF"]);

  logger.blank();
  process.stdout.write(
    cyanPink.multiline(
      `  Nexus Studio — Contribute\n` +
        `  ${"─".repeat(38)}\n`
    )
  );

  logger.blank();
  p.intro(chalk.bold.cyan("  Share your template with the EPAM community "));

  // ── Step 1: Resolve type ────────────────────────────────────────────────────
  let resolvedType: ContributeType;

  if (type && VALID_TYPES.includes(type as ContributeType)) {
    resolvedType = type as ContributeType;
  } else {
    const picked = await p.select({
      message: "What type of template do you want to contribute?",
      options: [
        { value: "skill",    label: "Skill",    hint: "Domain knowledge pack" },
        { value: "agent",    label: "Agent",    hint: "Specialised AI persona" },
        { value: "workflow", label: "Workflow", hint: "Multi-step process definition" },
      ],
    });
    if (p.isCancel(picked)) { p.cancel("Cancelled."); return; }
    resolvedType = picked as ContributeType;
  }

  // ── Step 2: Resolve id ──────────────────────────────────────────────────────
  let resolvedId: string;

  if (id && /^[a-z0-9][a-z0-9-]*$/.test(id)) {
    resolvedId = id;
  } else {
    // List available local templates of this type
    const localDir = path.join(cwd, LOCAL_TEMPLATES_DIR, `${resolvedType}s`);
    const available = _listLocalTemplates(localDir);

    if (available.length === 0) {
      p.cancel(
        `No local ${resolvedType} templates found in ${chalk.cyan(LOCAL_TEMPLATES_DIR + `/${resolvedType}s/`)}\n` +
          `  Run ${chalk.cyan(`studio create ${resolvedType} <id>`)} to create one first.`
      );
      return;
    }

    const picked = await p.select({
      message: `Which ${resolvedType} do you want to contribute?`,
      options: available.map((f) => ({ value: f, label: f })),
    });
    if (p.isCancel(picked)) { p.cancel("Cancelled."); return; }
    resolvedId = picked as string;
  }

  // ── Step 3: Read & validate the template file ───────────────────────────────
  const localPath = path.join(
    cwd,
    LOCAL_TEMPLATES_DIR,
    `${resolvedType}s`,
    `${resolvedId}.md`
  );

  if (!fs.existsSync(localPath)) {
    logger.error(
      `Template not found: ${chalk.cyan(localPath)}\n` +
        `  Create it first with: ${chalk.cyan(`studio create ${resolvedType} ${resolvedId}`)}`
    );
    process.exit(1);
  }

  const content = fs.readFileSync(localPath, "utf-8");
  const validation = _validateTemplate(content, resolvedType);

  if (validation.errors.length > 0) {
    logger.blank();
    logger.error("Template has validation issues — please fix before contributing:");
    validation.errors.forEach((e) => logger.warn(`  • ${e}`));
    logger.blank();
    logger.info(`Edit the file: ${chalk.cyan(path.relative(cwd, localPath))}`);
    process.exit(1);
  }

  if (validation.warnings.length > 0) {
    logger.blank();
    p.log.warn(chalk.yellow("Heads up — a few optional improvements:"));
    validation.warnings.forEach((w) => logger.dim(`  · ${w}`));
  }

  // ── Step 4: Show preview ────────────────────────────────────────────────────
  logger.blank();
  const preview = content.length > 1000 ? content.slice(0, 1000) + "\n…(truncated)" : content;
  console.log(
    boxen(chalk.dim(preview), {
      title: chalk.bold.cyan(`Preview: ${resolvedId}.md`),
      titleAlignment: "left",
      padding: 1,
      margin: { top: 0, bottom: 1 },
      borderStyle: "round",
      borderColor: "dim",
    })
  );

  const confirmed = await p.confirm({
    message: "Ready to submit this template?",
    initialValue: true,
  });
  if (p.isCancel(confirmed) || !confirmed) { p.cancel("No problem — come back when ready."); return; }

  // ── Step 5: Generate destination info ──────────────────────────────────────
  const destRelative = _destPath(resolvedType, resolvedId);
  const registryEntry = _registrySnippet(resolvedType, resolvedId, content);

  // ── Step 6: Print instructions ─────────────────────────────────────────────
  logger.blank();
  console.log(chalk.bold.white("  📋  Contribution Instructions"));
  logger.divider();

  console.log(chalk.bold.cyan("\n  Step 1 — Fork & clone the Nexus Studio repo\n"));
  console.log(chalk.dim(`    ${REPO_URL}`));

  console.log(chalk.bold.cyan("\n  Step 2 — Copy your template file\n"));
  if (isWindows()) {
    console.log(chalk.cyan(`    copy "${localPath}" "${destRelative}"`));
  } else {
    console.log(chalk.cyan(`    cp "${localPath}" "${destRelative}"`));
  }

  console.log(chalk.bold.cyan(`\n  Step 3 — Add this entry to ${chalk.white("packages/templates/registry.json")}\n`));
  console.log(
    boxen(chalk.greenBright(registryEntry), {
      padding: { top: 0, bottom: 0, left: 2, right: 2 },
      margin: { left: 4 },
      borderStyle: "single",
      borderColor: "green",
    })
  );

  console.log(chalk.bold.cyan("\n  Step 4 — Commit & push\n"));
  console.log(chalk.cyan(`    git checkout -b feat/contribute-${resolvedType}-${resolvedId}`));
  console.log(chalk.cyan(`    git add packages/templates/`));
  console.log(chalk.cyan(`    git commit -m "feat(${resolvedType}): add ${resolvedId}"`));
  console.log(chalk.cyan(`    git push origin feat/contribute-${resolvedType}-${resolvedId}`));

  console.log(chalk.bold.cyan("\n  Step 5 — Open a Pull Request\n"));
  console.log(chalk.dim(`    ${PR_URL}`));

  logger.divider();

  // ── Step 7: Offer to open browser ──────────────────────────────────────────
  logger.blank();
  const openBrowser = await p.confirm({
    message: "Open GitHub in your browser to start the PR now?",
    initialValue: true,
  });

  if (!p.isCancel(openBrowser) && openBrowser) {
    _openUrl(PR_URL);
    logger.success("Opened GitHub in your browser.");
  }

  logger.blank();
  p.outro(
    chalk.green("✓ Contribution guide complete!") +
      chalk.dim("\n  Thank you for making Nexus Studio better for the whole EPAM team. 🚀")
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** List .md files in a local templates directory (returns ids without extension) */
function _listLocalTemplates(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.basename(f, ".md"))
    .sort();
}

/** Validate template content for required frontmatter fields */
function _validateTemplate(
  content: string,
  type: ContributeType
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Must have frontmatter block
  if (!content.startsWith("---")) {
    errors.push('Template must start with a YAML frontmatter block (opening "---")');
    return { errors, warnings };
  }

  const fmEnd = content.indexOf("---", 3);
  if (fmEnd === -1) {
    errors.push('Frontmatter block is not closed (missing closing "---")');
    return { errors, warnings };
  }

  const fm = content.slice(3, fmEnd);

  if (!/name:\s*.+/.test(fm))        errors.push('Frontmatter must include "name:" field');
  if (!/description:\s*.+/.test(fm)) errors.push('Frontmatter must include "description:" field');

  if (type === "skill" && !/tokenBudget:\s*\d+/.test(fm)) {
    warnings.push(
      'Consider adding "tokenBudget: 400" to frontmatter (helps with context window planning)'
    );
  }

  if (type === "skill" && !/category:\s*.+/.test(fm)) {
    warnings.push('Consider adding "category:" to frontmatter (used in studio search grouping)');
  }

  // Minimum content length
  const bodyLength = content.slice(fmEnd + 3).trim().length;
  if (bodyLength < 100) {
    errors.push("Template body is too short (< 100 chars) — add meaningful content first");
  }

  if (bodyLength < 400) {
    warnings.push(
      "Template body is quite short — consider adding examples, patterns, and anti-patterns"
    );
  }

  return { errors, warnings };
}

/** Build the destination path relative to the nexus-studio repo root */
function _destPath(type: ContributeType, id: string): string {
  if (type === "skill" || type === "agent") {
    return `${REPO_TEMPLATES_BASE}/${type}s/${id}/${type === "skill" ? "SKILL" : id}.md`;
  }
  return `${REPO_TEMPLATES_BASE}/workflows/${id}.md`;
}

/** Generate the registry.json entry snippet */
function _registrySnippet(type: ContributeType, id: string, content: string): string {
  // Extract name and description from frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const fm = fmMatch?.[1] ?? "";

  const nameMatch = fm.match(/^name:\s*(.+)$/m);
  const descMatch = fm.match(/^description:\s*["']?(.+?)["']?\s*$/m);
  const budgetMatch = fm.match(/^tokenBudget:\s*(\d+)/m);
  const catMatch = fm.match(/^category:\s*(.+)$/m);

  const name = nameMatch?.[1]?.trim() ?? id;
  const desc = descMatch?.[1]?.trim() ?? `Community ${type}: ${id}`;
  const budget = budgetMatch?.[1] ? Number(budgetMatch[1]) : 400;
  const cat = catMatch?.[1]?.trim() ?? "Community";

  if (type === "skill") {
    return JSON.stringify(
      { id, name, category: cat, description: desc, tokenBudget: budget, contributed: true },
      null,
      2
    );
  }

  if (type === "agent") {
    return JSON.stringify(
      { id, name, category: cat, description: desc, contributed: true },
      null,
      2
    );
  }

  return JSON.stringify({ id, name, description: desc, contributed: true }, null, 2);
}

/** Open a URL in the system's default browser (cross-platform) */
function _openUrl(url: string): void {
  try {
    if (isWindows()) {
      execSync(`start "" "${url}"`, { stdio: "ignore" });
    } else if (process.platform === "darwin") {
      execSync(`open "${url}"`, { stdio: "ignore" });
    } else {
      execSync(`xdg-open "${url}"`, { stdio: "ignore" });
    }
  } catch {
    // Non-critical — user can open manually
  }
}
