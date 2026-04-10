/**
 * `studio mcp <subcommand>`
 *
 * Sub-commands:
 *   studio mcp list              → list all available MCP server definitions
 *   studio mcp add <id>          → enable a server in all detected IDE MCP configs
 *   studio mcp remove <id>       → disable a server from all detected IDE MCP configs
 *   studio mcp apply             → re-compose all IDE MCP configs from scratch
 *
 * MCP config files are updated in-place; `studio init` is not required again.
 */

import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import gradient from "gradient-string";
import boxen from "boxen";
import { TEMPLATES_DIR, loadRegistry } from "../core/template-engine.js";
import { composeMcp } from "../core/mcp-composer.js";
import { readConfig } from "../core/config-manager.js";
import { detectProject } from "../core/project-detector.js";
import { logger } from "../ui/logger.js";

const MCP_SERVERS_TEMPLATE_DIR = path.join(TEMPLATES_DIR, ".agent", "mcp", "servers");

// ── Helpers ───────────────────────────────────────────────────────────────────

interface ServerMeta {
  id: string;
  label: string;
  description: string;
  credentialTier: string;
  profiles: string[];
}

function loadAllServerMeta(): ServerMeta[] {
  if (!fs.existsSync(MCP_SERVERS_TEMPLATE_DIR)) return [];
  const metas: ServerMeta[] = [];
  for (const file of fs.readdirSync(MCP_SERVERS_TEMPLATE_DIR)) {
    if (!file.endsWith(".json")) continue;
    try {
      const raw = fs.readJsonSync(path.join(MCP_SERVERS_TEMPLATE_DIR, file));
      metas.push({
        id:             raw.id ?? file.replace(".json", ""),
        label:          raw.label ?? raw.id,
        description:    raw.description ?? "",
        credentialTier: raw.credentialTier ?? "none",
        profiles:       Array.isArray(raw.profiles) ? raw.profiles : [],
      });
    } catch { /* skip malformed */ }
  }
  return metas.sort((a, b) => a.credentialTier.localeCompare(b.credentialTier) || a.id.localeCompare(b.id));
}

/** Detect which IDE MCP config files are present and return their composeMcp arguments */
function detectIdeMcpTargets(
  cwd: string,
  profile: string,
  force: boolean
): Array<{ ide: string; destPath: string; label: string }> {
  const targets: Array<{ ide: string; destPath: string; label: string }> = [];

  if (fs.existsSync(path.join(cwd, ".vscode"))) {
    targets.push({ ide: "vscode", destPath: path.join(cwd, ".vscode", "mcp.json"), label: ".vscode/mcp.json" });
  }
  if (fs.existsSync(path.join(cwd, ".cursor"))) {
    targets.push({ ide: "cursor", destPath: path.join(cwd, ".cursor", "mcp.json"), label: ".cursor/mcp.json" });
  }
  if (fs.existsSync(path.join(cwd, "CLAUDE.md")) || fs.existsSync(path.join(cwd, ".claude"))) {
    targets.push({ ide: "claude", destPath: path.join(cwd, ".mcp.json"), label: ".mcp.json (Claude)" });
  }
  if (fs.existsSync(path.join(cwd, ".windsurfrules"))) {
    targets.push({ ide: "windsurf", destPath: path.join(cwd, ".codeium", "windsurf", "mcp.json"), label: ".codeium/windsurf/mcp.json" });
  }

  return targets;
}

/** Read a composed MCP file and return the servers object (inner key) */
function readComposedMcp(filePath: string): { outerKey: string; servers: Record<string, unknown> } | null {
  if (!fs.existsSync(filePath)) return null;
  try {
    const json = fs.readJsonSync(filePath) as Record<string, unknown>;
    const outerKey = Object.keys(json)[0];
    if (!outerKey) return null;
    return { outerKey, servers: (json[outerKey] as Record<string, unknown>) ?? {} };
  } catch {
    return null;
  }
}

// ── Sub-commands ──────────────────────────────────────────────────────────────

export async function mcpListCommand(cwd: string): Promise<void> {
  const servers  = loadAllServerMeta();
  const config   = readConfig(cwd);
  const profile  = config?.profile ?? "custom";
  const gold     = gradient(["#FDBB2D", "#22C1C3"]);
  const cyanPink = gradient(["#00DBDE", "#FC00FF"]);

  const tierLabel: Record<string, string> = {
    none:     chalk.green("TIER 1 · zero-config"),
    optional: chalk.yellow("TIER 2 · optional"),
    required: chalk.red("TIER 3 · requires credentials"),
  };

  logger.blank();
  process.stdout.write(cyanPink.multiline(`  MCP Server Registry\n  ${"─".repeat(35)}\n`));

  if (servers.length === 0) {
    logger.warn("No MCP server definitions found. Run `studio init` to populate templates.");
    return;
  }

  console.log(
    boxen(
      `${chalk.bold("Available MCP Servers")}\n` +
      `  Profile: ${chalk.cyan(profile)}\n` +
      `  Total:   ${chalk.cyan(String(servers.length))} servers`,
      { padding: 1, margin: { top: 0, bottom: 1 }, borderStyle: "round", borderColor: "dim" }
    )
  );

  const byTier: Record<string, ServerMeta[]> = {};
  for (const s of servers) {
    if (!byTier[s.credentialTier]) byTier[s.credentialTier] = [];
    byTier[s.credentialTier]!.push(s);
  }

  for (const tier of ["none", "optional", "required"]) {
    const group = byTier[tier] ?? [];
    if (group.length === 0) continue;
    console.log(gold(`\n  ◈ ${tierLabel[tier] ?? tier}`));
    for (const s of group) {
      const inProfile = s.profiles.includes(profile) ? chalk.green(" ✓ in profile") : "";
      console.log(`    ${chalk.cyan(s.id.padEnd(28))} ${s.label}${inProfile}`);
    }
  }

  logger.blank();
  logger.box(
    `${chalk.bold.white("MCP Commands")}\n\n` +
    `  ${chalk.dim("• Add server:")}    ${chalk.cyan("studio mcp add <id>")}\n` +
    `  ${chalk.dim("• Remove server:")} ${chalk.cyan("studio mcp remove <id>")}\n` +
    `  ${chalk.dim("• Re-apply all:")}  ${chalk.cyan("studio mcp apply")}`,
    { borderColor: "cyan", padding: 1, margin: { top: 1, bottom: 1 } }
  );
}

export async function mcpAddCommand(serverId: string, cwd: string): Promise<void> {
  const serverDefPath = path.join(MCP_SERVERS_TEMPLATE_DIR, `${serverId}.json`);
  if (!fs.existsSync(serverDefPath)) {
    logger.error(`MCP server "${serverId}" not found in the registry.`);
    logger.info(`Run ${chalk.cyan("studio mcp list")} to see available servers.`);
    process.exit(1);
  }

  const config   = readConfig(cwd);
  const profile  = config?.profile ?? "custom";
  const targets  = detectIdeMcpTargets(cwd, profile, true);

  if (targets.length === 0) {
    logger.warn("No IDE MCP config files detected. Run `studio init` first.");
    process.exit(0);
  }

  logger.info(`Adding MCP server "${chalk.cyan(serverId)}" to ${targets.length} IDE config(s)...`);

  const serverDef = fs.readJsonSync(serverDefPath) as Record<string, unknown>;
  const entry: Record<string, unknown> = {
    command: serverDef["command"],
    args:    serverDef["args"] ?? [],
  };
  if (serverDef["env"] && Object.keys(serverDef["env"] as object).length > 0) {
    entry["env"] = serverDef["env"];
  }

  let updated = 0;
  for (const target of targets) {
    try {
      const existing = readComposedMcp(target.destPath);
      if (existing) {
        existing.servers[serverId] = entry;
        const merged = { [existing.outerKey]: existing.servers };
        await fs.writeJson(target.destPath, merged, { spaces: 2 });
      } else {
        // Create a minimal config for that IDE
        const outerKey = target.ide === "cursor" ? "mcpServers" : "servers";
        await fs.ensureDir(path.dirname(target.destPath));
        await fs.writeJson(target.destPath, { [outerKey]: { [serverId]: entry } }, { spaces: 2 });
      }
      logger.success(`Updated ${target.label}`);
      updated++;
    } catch (err: any) {
      logger.warn(`Failed to update ${target.label}: ${err?.message ?? String(err)}`);
    }
  }

  logger.blank();
  logger.success(`MCP server "${serverId}" added to ${updated}/${targets.length} IDE config(s).`);

  // Credential hint
  const serverDefs = fs.readJsonSync(serverDefPath) as Record<string, unknown>;
  if (serverDefs["credentialTier"] === "optional" || serverDefs["credentialTier"] === "required") {
    const creds = Object.keys((serverDefs["credentials"] as object | undefined) ?? {});
    if (creds.length > 0) {
      logger.warn(`This server requires credentials. Add these to your .env.local:`);
      creds.forEach((k) => logger.dim(`  ${k}=<your-value>`));
    }
  }
}

export async function mcpRemoveCommand(serverId: string, cwd: string): Promise<void> {
  const config   = readConfig(cwd);
  const profile  = config?.profile ?? "custom";
  const targets  = detectIdeMcpTargets(cwd, profile, false);

  if (targets.length === 0) {
    logger.warn("No IDE MCP config files detected.");
    process.exit(0);
  }

  logger.info(`Removing MCP server "${chalk.cyan(serverId)}" from ${targets.length} IDE config(s)...`);

  let updated = 0;
  for (const target of targets) {
    const existing = readComposedMcp(target.destPath);
    if (!existing) { logger.dim(`Skipped ${target.label} (not found)`); continue; }
    if (!(serverId in existing.servers)) { logger.dim(`Skipped ${target.label} ("${serverId}" not present)`); continue; }

    delete existing.servers[serverId];
    const merged = { [existing.outerKey]: existing.servers };
    await fs.writeJson(target.destPath, merged, { spaces: 2 });
    logger.success(`Updated ${target.label}`);
    updated++;
  }

  logger.blank();
  if (updated > 0) {
    logger.success(`MCP server "${serverId}" removed from ${updated} IDE config(s).`);
  } else {
    logger.warn(`"${serverId}" was not found in any IDE MCP configs.`);
  }
}

export async function mcpApplyCommand(cwd: string): Promise<void> {
  const config = readConfig(cwd);
  if (!config) {
    logger.error("No .agstudio.json found. Run `studio init` first.");
    process.exit(1);
  }

  const profile  = config.profile;
  const targets  = detectIdeMcpTargets(cwd, profile, true);

  if (targets.length === 0) {
    logger.warn("No IDE MCP config files detected. Run `studio init` first.");
    process.exit(0);
  }

  logger.info(`Re-composing MCP configs for profile "${chalk.cyan(profile)}"...`);

  for (const target of targets) {
    composeMcp(cwd, target.ide, profile, target.destPath, target.label, true);
  }

  logger.blank();
  logger.success(`MCP configs re-applied for ${targets.length} IDE(s).`);
}
