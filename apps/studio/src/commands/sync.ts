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
import { IC } from "../ui/icons.js";
import { elapsed } from "../ui/theme.js";

export interface SyncOptions {
  check?: boolean;   // CI mode — exit 1 on drift, no prompts
  force?: boolean;   // Overwrite everything without asking
  quiet?: boolean;   // Suppress output (for programmatic use)
  all?:   boolean;   // Monorepo mode — run sync across all apps/* and packages/*
  deep?:  boolean;   // Deep mode — root files, ghost tracking, profile drift, MCP hints
}

interface DriftEntry {
  category: "agents" | "skills" | "workflows" | "scripts" | "root";
  id: string;
  // "stale" = installed but no stored hash (pre-hash-tracking); treated as outdated
  status: "up-to-date" | "outdated" | "missing" | "unknown" | "stale";
  installedHash?: string;
  latestHash?: string;
}

/** Top-level .agent/ instruction files checked by --deep sync. */
const ROOT_FILES = [
  "AGENTS.md",
  "AGENT_FLOW.md",
  "AGENT_SYSTEM.md",
  "ARCHITECTURE.md",
] as const;

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
    logger.info(chalk.bold(`${IC.sync}  Nexus Sync \u2014 checking for drift...`));
    logger.blank();
  }

  // ── 1. Auto-track ghost files (--deep only) ─────────────────────────────
  if (opts.deep) {
    const ghostSpinner = new Spinner("Scanning for untracked files...").start();
    const ghostCount   = await autoTrackGhosts(cwd, config);
    if (ghostCount > 0) {
      await writeConfig(config, cwd);
      ghostSpinner.succeed(`Auto-tracked ${ghostCount} ghost file(s) — now included in drift check`);
    } else {
      ghostSpinner.stop();
    }
  }

  // ── 2. Compute drift ────────────────────────────────────────────
  const spinner = new Spinner("Analysing installed files...").start();
  const drift = await computeDrift(cwd, config, opts.deep);
  spinner.succeed(`Scanned ${drift.length} installed items`);

  const outdated = drift.filter((d) => d.status === "outdated" || d.status === "stale");
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

  // ── 3. Profile drift (--deep only) ──────────────────────────────────
  const profileDrift = opts.deep
    ? await computeProfileDrift(config)
    : { agents: [] as string[], skills: [] as string[] };

  // ── 4. Report ─────────────────────────────────────────────────────────────────────────
  if (!opts.quiet) {
    if (upToDate.length > 0) {
      logger.dim(`${IC.pass}  ${upToDate.length} item(s) up to date`);
    }
    if (outdated.length > 0) {
      logger.info(`${IC.warn}  ${chalk.yellow(outdated.length.toString())} item(s) have updates available:`);
      for (const d of outdated) {
        const hint    = getDriftAgentHint(d.category as "agents" | "skills" | "workflows" | "scripts", d.id);
        const marker  = d.status === "stale"  ? chalk.dim(" ✔ no stored hash — reinstall") : "";
        const rootTag = d.category === "root" ? chalk.dim(" (instruction file)") : "";
        logger.dim(`     ${d.category}/${chalk.yellow(d.id)}${rootTag}${marker}${hint}`);
      }
    }
    if (missing.length > 0) {
      logger.info(`${IC.fail}  ${chalk.red(missing.length.toString())} item(s) are missing from .agent/:`);
      for (const d of missing) {
        const hint    = getDriftAgentHint(d.category as "agents" | "skills" | "workflows" | "scripts", d.id);
        const rootTag = d.category === "root" ? chalk.dim(" (instruction file)") : "";
        logger.dim(`     ${d.category}/${chalk.red(d.id)}${rootTag}${hint}`);
      }
    }
    if (missingRequired.length > 0) {
      logger.blank();
      logger.info(chalk.bold(`${IC.enterprise}  Company policy violations:`));
      for (const req of missingRequired) {
        logger.warn(`  Required skill not installed: ${chalk.yellow(req)}`);
      }
    }
    if (opts.deep && (profileDrift.agents.length > 0 || profileDrift.skills.length > 0)) {
      logger.blank();
      logger.info(chalk.bold(`  💡  Profile drift (${chalk.cyan(config.profile ?? "unknown")}) — in profile but not installed:`));
      for (const a of profileDrift.agents) logger.dim(`     agents/${chalk.cyan(a)}`);
      for (const s of profileDrift.skills) logger.dim(`     skills/${chalk.cyan(s)}`);
    }
    logger.blank();
  }

  // ── 5. CI mode ────────────────────────────────────────────────────────
  if (opts.check) {
    const hasDrift =
      outdated.length > 0 ||
      missing.length > 0 ||
      missingRequired.length > 0 ||
      (opts.deep && (profileDrift.agents.length > 0 || profileDrift.skills.length > 0));
    if (hasDrift) {
      logger.error("Drift detected. Run `studio sync` to update.");
      process.exit(1);
    }
    logger.success("No drift detected. All configs are up to date.");
    return;
  }

  // ── 6. MCP hint (--deep only) ─────────────────────────────────────────
  if (opts.deep) await printMcpHint(cwd);

  // ── 7. Nothing to do ───────────────────────────────────────────────
  const hasAnything =
    outdated.length > 0 ||
    missing.length > 0 ||
    missingRequired.length > 0 ||
    (opts.deep && (profileDrift.agents.length > 0 || profileDrift.skills.length > 0));
  if (!hasAnything) {
    logger.success("Everything is up to date! 🎉");
    return;
  }

  // ── 8. Force mode ─────────────────────────────────────────────────
  if (opts.force) {
    const profileItems: DriftEntry[] = opts.deep ? [
      ...profileDrift.agents.map((a) => ({ category: "agents" as const, id: a, status: "missing" as const })),
      ...profileDrift.skills.map((s) => ({ category: "skills" as const, id: s, status: "missing" as const })),
    ] : [];
    await pullUpdates(cwd, config, [...outdated, ...missing, ...profileItems], missingRequired, true);
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

async function computeDrift(cwd: string, config: AgStudioConfig, deep = false): Promise<DriftEntry[]> {
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
        // Template no longer exists — cannot update
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
        // "stale" = installed but no stored hash (pre-hash-tracking or manually
        // added). Treated as outdated so it surfaces in the update prompt.
        status: storedRawHash === undefined ? "stale"
              : currentRawHash === storedRawHash ? "up-to-date"
              : "outdated",
        ...(storedRawHash !== undefined && { installedHash: storedRawHash }),
        latestHash: currentRawHash,
      });
    }
  }

  // ── Root files pass (--deep only) ───────────────────────────────────────────
  if (deep) {
    for (const filename of ROOT_FILES) {
      const installedPath = path.join(cwd, ".agent", filename);
      const templatePath  = path.join(TEMPLATES_DIR, ".agent", filename);
      if (!fs.existsSync(templatePath)) continue;

      if (!fs.existsSync(installedPath)) {
        entries.push({ category: "root", id: filename, status: "missing" });
        continue;
      }

      const currentRawHash = await hashFile(templatePath);
      const storedRawHash  = storedHashes[filename] ?? storedHashes[`root/${filename}`];

      entries.push({
        category: "root",
        id: filename,
        status: storedRawHash === undefined ? "stale"
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

// ── Deep-sync helpers ────────────────────────────────────────────────────────────

/**
 * Scans .agent/{agents,skills,workflows,scripts}/ on disk and adds any files
 * that exist but are absent from config.installed.* to the tracking manifest.
 * The current template hash is stored so subsequent drift checks are accurate.
 */
async function autoTrackGhosts(cwd: string, config: AgStudioConfig): Promise<number> {
  let tracked = 0;
  const scan: Array<{
    key: "agents" | "skills" | "workflows" | "scripts";
    ext: string;
    isDir: boolean;
  }> = [
    { key: "agents",    ext: ".md", isDir: false },
    { key: "skills",    ext: "",    isDir: true  },
    { key: "workflows", ext: ".md", isDir: false },
    { key: "scripts",   ext: "",    isDir: true  },
  ];

  if (!config.installed)       config.installed       = { agents: [], skills: [], workflows: [], scripts: [] };
  if (!config.installedHashes) config.installedHashes = {};

  for (const { key, ext, isDir } of scan) {
    const dir = path.join(cwd, ".agent", key);
    if (!fs.existsSync(dir)) continue;

    for (const entry of fs.readdirSync(dir)) {
      const entryPath = path.join(dir, entry);
      const stat      = fs.statSync(entryPath);
      if ( isDir && !stat.isDirectory()) continue;
      if (!isDir &&  stat.isDirectory()) continue;

      const id = isDir ? entry : path.basename(entry, ext);
      if ((config.installed[key] ?? []).includes(id)) continue;

      // Auto-track: add to the installed list
      if (!config.installed[key]) config.installed[key] = [];
      config.installed[key]!.push(id);

      // Store the current template hash so future drift checks are accurate
      const templatePath = findTemplateFile(key, id);
      if (templatePath && fs.existsSync(templatePath)) {
        const hash    = await hashFile(templatePath);
        const hashKey = isDir
          ? `${key}/${id}/${(CANONICAL_FILE[key] ?? ["SKILL.md"])[0]}`
          : `${key}/${id}${ext}`;
        config.installedHashes![hashKey] = hash;
      }
      tracked++;
    }
  }
  return tracked;
}

/**
 * Compares the active profile's recommended agents/skills against what is
 * installed and returns the sets that are in the profile but not yet installed.
 */
async function computeProfileDrift(
  config: AgStudioConfig,
): Promise<{ agents: string[]; skills: string[] }> {
  if (!config.profile) return { agents: [], skills: [] };
  const registry = loadRegistry();
  const profile  = (registry as any).profiles?.[config.profile];
  if (!profile)   return { agents: [], skills: [] };
  const installedAgents = new Set(config.installed.agents ?? []);
  const installedSkills = new Set(config.installed.skills ?? []);
  return {
    agents: ((profile.agents ?? []) as string[]).filter((a) => !installedAgents.has(a)),
    skills: ((profile.skills ?? []) as string[]).filter((s) => !installedSkills.has(s)),
  };
}

/**
 * Checks if the MCP servers.json template differs from the installed copy and
 * suggests `studio mcp apply`. MCP is excluded from automated sync because it
 * contains per-IDE path/key configuration that users must review manually.
 */
async function printMcpHint(cwd: string): Promise<void> {
  const tplServers   = path.join(TEMPLATES_DIR, ".agent", "mcp", "servers.json");
  const localMcpDir  = path.join(cwd, ".agent", "mcp");
  const localServers = path.join(localMcpDir, "servers.json");
  if (!fs.existsSync(tplServers)) return;
  if (!fs.existsSync(localMcpDir) || !fs.existsSync(localServers)) {
    logger.dim(`  💡 MCP configs not installed — run ${chalk.cyan("studio mcp apply")} to configure IDE integrations`);
    return;
  }
  const [tplHash, localHash] = await Promise.all([hashFile(tplServers), hashFile(localServers)]);
  if (tplHash !== localHash) {
    logger.dim(`  💡 MCP servers.json has updates — run ${chalk.cyan("studio mcp apply")} to refresh IDE configurations`);
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

  // ── Separate root instruction files from regular template items ──────────────
  const rootItems    = items.filter((d) => d.category === "root");
  const regularItems = items.filter((d) => d.category !== "root");

  // Build include options from selected regular drift items + required skills
  const include: { agents?: string[]; skills?: string[]; workflows?: string[]; scripts?: string[] } = {};
  for (const item of regularItems) {
    const cat = item.category as "agents" | "skills" | "workflows" | "scripts";
    if (!include[cat]) include[cat] = [];
    include[cat]!.push(item.id);
  }
  if (requiredSkills.length > 0) {
    include.skills = [...(include.skills ?? []), ...requiredSkills];
  }

  const spinner = new Spinner("Pulling updates...").start();
  let copiedCount = 0;
  let result = { copied: [] as string[], hashes: {} as Record<string, string> };

  // Copy regular template items via template engine (Handlebars-aware)
  if (regularItems.length > 0 || requiredSkills.length > 0) {
    const r = await copyTemplates(cwd, { include, force: true }, templateContext);
    result = { copied: r.copied, hashes: r.hashes };
    copiedCount += result.copied.length;
  }

  // Overwrite root instruction files directly (policy: always overwrite on confirm)
  if (rootItems.length > 0) {
    if (!config.installedHashes) config.installedHashes = {};
    for (const item of rootItems) {
      const templatePath  = path.join(TEMPLATES_DIR, ".agent", item.id);
      const installedPath = path.join(cwd, ".agent", item.id);
      await fs.copy(templatePath, installedPath, { overwrite: true });
      config.installedHashes[item.id] = await hashFile(templatePath);
      copiedCount++;
    }
  }

  spinner.succeed(`Updated ${copiedCount} file(s)`);

  // Ensure profile-recommended or manually-added items are tracked in config.installed
  for (const item of regularItems) {
    if (item.status === "missing") {
      const cat = item.category as "agents" | "skills" | "workflows" | "scripts";
      if (!config.installed[cat]) config.installed[cat] = [];
      if (!config.installed[cat]!.includes(item.id)) config.installed[cat]!.push(item.id);
    }
  }

  // Merge new raw template hashes into config so drift detection stays accurate
  const needsWrite = Object.keys(result.hashes).length > 0 || requiredSkills.length > 0 || rootItems.length > 0;
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