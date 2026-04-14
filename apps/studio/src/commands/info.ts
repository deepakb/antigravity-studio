/**
 * `studio info <type> <id>`
 *
 * Shows full details about an agent, skill, or workflow from the registry —
 * metadata, token budget, which profiles include it, and a content preview
 * of the actual template file.
 */

import { loadRegistry, TEMPLATES_DIR } from "../core/template-engine.js";
import { readConfig } from "../core/config-manager.js";
import { logger } from "../ui/logger.js";
import { IC } from "../ui/icons.js";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import gradient from "gradient-string";
import boxen from "boxen";

const VALID_TYPES = ["agent", "skill", "workflow"] as const;
type InfoType = typeof VALID_TYPES[number];

export async function infoCommand(type: string, id: string, cwd: string): Promise<void> {
  if (!VALID_TYPES.includes(type as InfoType)) {
    logger.error(`Invalid type "${type}". Must be one of: ${VALID_TYPES.join(", ")}`);
    process.exit(1);
  }

  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    logger.error(`Invalid id "${id}". Use lowercase letters, digits, and hyphens only.`);
    process.exit(1);
  }

  const registry = loadRegistry();
  const config   = readConfig(cwd);
  const cyanPink = gradient(["#00DBDE", "#FC00FF"]);
  const gold     = gradient(["#FDBB2D", "#22C1C3"]);

  // ── Find registry entry ───────────────────────────────────────────────────
  // agents and skills are first-class in RegistrySchema; workflows fall through to []
  const installedKey: "agents" | "skills" | "workflows" | "scripts" =
    type === "agent" ? "agents" : type === "skill" ? "skills" : "workflows";
  const entries: Array<{ id: string; name?: string; category?: string; tokenBudget?: number }> =
    type === "agent"
      ? registry.agents
      : type === "skill"
      ? registry.skills
      : [];
  const entry = entries.find((e) => e.id === id);
  const categoryKey = installedKey; // alias for template path resolution

  // ── Resolve template file path ────────────────────────────────────────────
  const templateBase = path.join(TEMPLATES_DIR, ".agent", categoryKey);
  const candidates   = [
    path.join(templateBase, `${id}.md`),
    path.join(templateBase, `${id}.ts`),
    path.join(templateBase, id, "index.md"),
  ];
  const templatePath = candidates.find((p) => fs.existsSync(p));

  if (!entry && !templatePath) {
    logger.error(`No ${type} found with id "${id}" in the registry.`);
    logger.info(`Run ${chalk.cyan("studio list")} to see all available ${type}s.`);
    process.exit(1);
  }

  const isInstalled = config?.installed[installedKey]?.includes(id) ?? false;

  logger.blank();
  process.stdout.write(
    cyanPink.multiline(
      `  Nexus Info — ${type}: ${id}\n` +
      `  ${"─".repeat(45)}\n`
    )
  );

  // ── Metadata panel ────────────────────────────────────────────────────────
  const lines: string[] = [];
  if (entry) {
    lines.push(`  ${chalk.dim("Name:")}      ${chalk.bold(entry.name ?? id)}`);
    if (entry.category) {
      lines.push(`  ${chalk.dim("Category:")}  ${chalk.cyan(entry.category)}`);
    }
    if (entry.tokenBudget) {
      lines.push(`  ${chalk.dim("Tokens:")}    ${chalk.yellow(`~${entry.tokenBudget}t budget`)}`);
    }
  }
  lines.push(`  ${chalk.dim("Status:")}    ${isInstalled ? `${IC.pass} ${chalk.green("Installed")}` : chalk.dim("Not installed")}`);
  lines.push(`  ${chalk.dim("Type:")}      ${chalk.cyan(type)}`);
  lines.push(`  ${chalk.dim("ID:")}        ${id}`);

  // Which profiles include this entry?
  const includedIn: string[] = [];
  for (const [profileId, profileData] of Object.entries(registry.profiles as Record<string, any>)) {
    const pd = profileData as Record<string, string[] | undefined>;
    const list: string[] = pd[categoryKey] ?? pd["agents"] ?? [];
    if (list.includes(id)) includedIn.push(profileId);
  }
  if (includedIn.length > 0) {
    lines.push(`  ${chalk.dim("Profiles:")}  ${chalk.dim(includedIn.join(", "))}`);
  }

  console.log(
    boxen(lines.join("\n"), {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      margin: { top: 0, bottom: 1 },
      borderStyle: "round",
      borderColor: "cyan",
    })
  );

  // ── Template preview ──────────────────────────────────────────────────────
  if (templatePath) {
    const raw = await fs.readFile(templatePath, "utf8");
    const lines = raw.split("\n");
    const previewLines = lines.slice(0, 30);
    const truncated = lines.length > 30;

    console.log(gold(`  ◈ Template Preview`));
    console.log(
      chalk.dim(`  ${templatePath.replace(TEMPLATES_DIR, "<templates>")}`)
    );
    console.log();
    for (const line of previewLines) {
      if (line.startsWith("#")) {
        console.log(`  ${chalk.bold.cyan(line)}`);
      } else if (line.startsWith("  ") || line.startsWith("-") || line.startsWith("*")) {
        console.log(`  ${chalk.dim(line)}`);
      } else {
        console.log(`  ${line}`);
      }
    }
    if (truncated) {
      console.log(chalk.dim(`\n  … ${lines.length - 30} more lines`));
    }
  } else {
    logger.warn("Template file not found locally (may be available after studio init).");
  }

  // ── Quick actions ─────────────────────────────────────────────────────────
  logger.blank();
  if (!isInstalled) {
    logger.box(
      `${chalk.bold.white("Install this " + type)}\n\n` +
      `  ${chalk.cyan(`studio add ${type} ${id}`)}`,
      { borderColor: "cyan", padding: 1, margin: { top: 1, bottom: 1 } }
    );
  } else {
    logger.box(
      `${chalk.bold.white("Already installed")}\n\n` +
      `  ${chalk.dim("Update:")}  ${chalk.cyan(`studio update`)}\n` +
      `  ${chalk.dim("Remove:")}  ${chalk.cyan(`studio remove ${type} ${id}`)}`,
      { borderColor: "dim", padding: 1, margin: { top: 1, bottom: 1 } }
    );
  }
}
