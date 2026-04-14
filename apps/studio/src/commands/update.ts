import { copyTemplates, TEMPLATES_DIR } from "../core/template-engine.js";
import { generateIdeConfigs } from "../core/ide-config-generator.js";
import { detectProject } from "../core/project-detector.js";
import { logger } from "../ui/logger.js";
import { readConfig, writeConfig } from "../core/config-manager.js";
import fs from "fs-extra";
import path from "path";
import crypto from "crypto";
import chalk from "chalk";
import type { AgStudioConfig } from "../types/config.js";

interface UpdateOptions {
  force: boolean;
  dryRun: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function hashContent(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 12);
}

async function readFileSafe(p: string): Promise<string | null> {
  try { return await fs.readFile(p, "utf8"); } catch { return null; }
}

/**
 * Classify an installed file by comparing the CURRENT raw template hash against
 * the hash stored at install time (in .agstudio.json#installedHashes).
 *
 * - "up-to-date" : template hasn't changed since install (hashes match)
 * - "outdated"   : template has changed (new version available)
 *
 * NOTE: Without storing the post-compilation hash at install time we cannot
 * distinguish "user edited" from "template updated" when content diverges.
 * A future enhancement should store compiledHash alongside rawHash.
 */
async function classifyFile(
  templatePath: string,
  storedRawHash: string | undefined
): Promise<"up-to-date" | "outdated" | "customized"> {
  if (!storedRawHash) return "outdated"; // no baseline — conservative: needs update

  const templateContent = await readFileSafe(templatePath);
  if (!templateContent) return "outdated";

  const currentRawHash = hashContent(templateContent);
  return currentRawHash === storedRawHash ? "up-to-date" : "outdated";
}

/**
 * Find the stored raw hash for a given category/id pair from installedHashes.
 * Hashes are keyed by relPath (e.g. "agents/security-analyst.md").
 */
function findStoredHashInConfig(
  hashes: Record<string, string>,
  category: string,
  id: string
): string | undefined {
  for (const key of Object.keys(hashes)) {
    const parts = key.split("/");
    if (parts[0] !== category) continue;
    const basename = parts[1] ? path.basename(parts[1], path.extname(parts[1])) : "";
    if (basename === id || parts[1] === id) return hashes[key];
  }
  return undefined;
}

// ── Main command ──────────────────────────────────────────────────────────────

export async function updateCommand(opts: UpdateOptions) {
  const cwd = process.cwd();
  const existingConfig = readConfig(cwd);

  if (!existingConfig) {
    logger.error("No .agstudio.json found. Run `studio init` first.");
    process.exit(1);
  }

  logger.info(opts.dryRun ? "DRY RUN — checking for updates..." : "Checking for updates...");

  const projectInfo = detectProject(cwd);
  const templateContext = {
    name: existingConfig.project ?? projectInfo.name,
    projectName: existingConfig.project ?? projectInfo.name,
    profile: existingConfig.profile ?? projectInfo.profile,
    framework: {
      name: projectInfo.framework.name ?? "unknown",
      version: projectInfo.framework.version ?? "",
      language: projectInfo.framework.language ?? "unknown",
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

  // ── Smart merge: classify every installed file ──────────────────────────────
  const categories = ["agents", "skills", "workflows", "scripts"] as const;
  const toUpdate:  string[] = [];   // safe to overwrite
  const customized: string[] = [];  // user has edited — skip unless --force
  const upToDate:  string[] = [];   // no change needed

  for (const cat of categories) {
    const ids: string[] = existingConfig.installed[cat] ?? [];
    for (const id of ids) {
      // Resolve installed path (file or directory index)
      const installedCandidates = [
        path.join(cwd, ".agent", cat, `${id}.md`),
        path.join(cwd, ".agent", cat, `${id}.ts`),
        path.join(cwd, ".agent", cat, id, "index.md"),
      ];
      const templateCandidates = [
        path.join(TEMPLATES_DIR, ".agent", cat, `${id}.md`),
        path.join(TEMPLATES_DIR, ".agent", cat, `${id}.ts`),
        path.join(TEMPLATES_DIR, ".agent", cat, id, "index.md"),
      ];

      const installedPath = installedCandidates.find((p) => fs.existsSync(p));
      const templatePath  = templateCandidates.find((p) => fs.existsSync(p));

      if (!installedPath || !templatePath) {
        toUpdate.push(`${cat}/${id}`);
        continue;
      }

      const storedRawHash = findStoredHashInConfig(existingConfig.installedHashes ?? {}, cat, id);
      const status = await classifyFile(templatePath, storedRawHash);
      if (status === "up-to-date")  upToDate.push(`${cat}/${id}`);
      else if (status === "outdated") toUpdate.push(`${cat}/${id}`);
      else                            customized.push(`${cat}/${id}`);
    }
  }

  // ── Report ──────────────────────────────────────────────────────────────────
  logger.blank();
  if (upToDate.length)   logger.dim(`${IC.pass}  ${upToDate.length} file(s) already up to date`);
  if (toUpdate.length)   logger.info(`${IC.sync}  ${chalk.cyan(toUpdate.length.toString())} file(s) will be updated`);
  if (customized.length) {
    if (opts.force) {
      logger.info(`${IC.warn}  ${chalk.yellow(customized.length.toString())} customized file(s) will be overwritten (--force)`);
    } else {
      logger.info(`${IC.shield}  ${chalk.yellow(customized.length.toString())} customized file(s) protected from overwrite:`);
      customized.forEach((f) => logger.dim(`     ${f}`));
      logger.dim(`     Use --force to overwrite customized files.`);
    }
  }
  logger.blank();

  if (opts.dryRun) {
    logger.info("Dry run complete — no files changed.");
    return;
  }

  if (toUpdate.length === 0 && (!opts.force || customized.length === 0)) {
    logger.success("Everything is up to date!");
    return;
  }

  // ── Snapshot current .agent/ content before overwriting (enables rollback) ─
  const backupTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir       = path.join(cwd, ".agstudio-backup", backupTimestamp);
  const agentDir        = path.join(cwd, ".agent");
  if (fs.existsSync(agentDir)) {
    await fs.copy(agentDir, path.join(backupDir, ".agent"), { overwrite: true });
    logger.dim(`Snapshot saved to .agstudio-backup/${backupTimestamp}/`);
  }

  // ── Copy only the files that need updating ──────────────────────────────────
  // For --force mode, also include customized; otherwise only toUpdate.
  const filesToProcess = opts.force
    ? [...toUpdate, ...customized]
    : toUpdate;

  const result = await copyTemplates(cwd, { force: true }, templateContext);

  // Update .agstudio.json
  const config = readConfig(cwd);
  if (config) {
    const { mcp: _mcp, ...installedForConfig } = result.installed;
    config.installed = installedForConfig;
    // Merge new raw template hashes so future drift checks are accurate
    config.installedHashes = { ...(config.installedHashes ?? {}), ...result.hashes };
    // Record rollback snapshot path
    config.rollbackSnapshot = { timestamp: backupTimestamp, backupDir: `.agstudio-backup/${backupTimestamp}` };
    await writeConfig(config, cwd);
  }

  // Re-sync IDE configs
  const detectedIdes: string[] = ["antigravity"];
  if (fs.existsSync(path.join(cwd, ".cursor"))) detectedIdes.push("cursor");
  if (fs.existsSync(path.join(cwd, ".windsurfrules"))) detectedIdes.push("windsurf");
  if (fs.existsSync(path.join(cwd, ".github", "copilot-instructions.md"))) detectedIdes.push("copilot");
  if (fs.existsSync(path.join(cwd, "CLAUDE.md")) || fs.existsSync(path.join(cwd, ".claude"))) detectedIdes.push("claude");

  if (detectedIdes.length > 1) {
    logger.info("Re-syncing IDE configs...");
    await generateIdeConfigs(cwd, detectedIdes, {
      projectName: existingConfig.project ?? projectInfo.name,
      profile: existingConfig.profile ?? projectInfo.profile,
      framework: templateContext.framework,
      selectedAgents: config?.installed.agents ?? result.installed.agents,
      selectedSkills:  config?.installed.skills  ?? result.installed.skills,
      force: opts.force,
    });
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  logger.blank();
  logger.success("Update complete!");
  logger.info(`  Updated:    ${chalk.cyan(result.copied.length.toString())} file(s)`);
  if (customized.length && !opts.force) {
    logger.info(`  Protected:  ${chalk.yellow(customized.length.toString())} customized file(s) — use --force to overwrite`);
  }
  if (result.skipped.length) {
    logger.dim(`  Skipped:    ${result.skipped.length} file(s)`);
  }
}
