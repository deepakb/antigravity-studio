import { readConfig } from "../core/config-manager.js";
import { loadCompanyConfig } from "../core/enterprise-config.js";
import { logger } from "../ui/logger.js";
import { getContextDir, CONTEXT_FILES } from "../core/context-manager.js";
import { profileExists, getProfileHash } from "../core/profile-manager.js";
import chalk from "chalk";
import logSymbols from "log-symbols";
import gradient from "gradient-string";
import boxen from "boxen";
import fs from "fs-extra";
import path from "path";

export async function statusCommand(cwd: string = process.cwd()): Promise<void> {
  const config = readConfig(cwd);

  if (!config) {
    throw new Error("No .agstudio.json found. Run `studio init` first.");
  }

  const companyConfig = loadCompanyConfig(cwd);
  const cyanPink = gradient(["#00DBDE", "#FC00FF"]);
  const gold = gradient(["#FDBB2D", "#22C1C3"]);

  logger.blank();
  process.stdout.write(cyanPink.multiline(
    `  Nexus Studio — Project Status\n` +
    `  ${"─".repeat(35)}\n`
  ));

  // 1. Project Overview
  console.log(
    boxen(
      `${chalk.bold(config.project.toUpperCase())}\n\n` +
      `  ${chalk.dim("• Profile:")}     ${chalk.cyan(config.profile)}\n` +
      `  ${chalk.dim("• Version:")}     ${chalk.cyan(config.version)}\n` +
      `  ${chalk.dim("• Status:")}      ${chalk.green.bold("ACTIVE")}`,
      { padding: 1, margin: { top: 0, bottom: 1 }, borderStyle: "round", borderColor: "dim" }
    )
  );

  // 2. Company Config Panel
  if (companyConfig) {
    const installedSkills = new Set(config.installed.skills ?? []);
    const required = companyConfig.requiredSkills;
    const installed = required.filter(s => installedSkills.has(s));
    const missing   = required.filter(s => !installedSkills.has(s));
    const pct = required.length > 0 ? Math.round((installed.length / required.length) * 100) : 100;
    const bar = buildBar(pct, 20);
    const barColor = pct === 100 ? chalk.green : pct >= 50 ? chalk.yellow : chalk.red;

    console.log(gold("\n  ◈ Enterprise Standards"));
    console.log(`    ${chalk.bold("Company:")}    ${chalk.cyan(companyConfig.companyName)} v${companyConfig.version}`);
    console.log(`    ${chalk.bold("Compliance:")} ${barColor(bar)} ${pct}%`);
    if (missing.length > 0) {
      console.log(`    ${chalk.yellow(logSymbols.warning)} Missing required skills: ${missing.map(s => chalk.yellow(s)).join(", ")}`);
      console.log(`    ${chalk.dim("→ Run")} ${chalk.cyan("studio sync")} ${chalk.dim("to install them")}`);
    } else {
      console.log(`    ${logSymbols.success} All ${required.length} required skills installed`);
    }
  } else {
    console.log(gold("\n  ◈ Enterprise Standards"));
    console.log(`    ${chalk.dim(logSymbols.warning)} No company config — run ${chalk.cyan("studio company init <name>")} to set standards`);
  }

  // 3. Installed Assets
  console.log(gold(`\n  ◈ Knowledge Assets & Tools`));
  const categories: Array<{ key: "agents" | "skills" | "workflows" | "scripts"; label: string }> = [
    { key: "agents",    label: "AI Agents" },
    { key: "skills",    label: "Specialized Skills" },
    { key: "workflows", label: "Automated Workflows" },
    { key: "scripts",   label: "Utility Scripts" },
  ];

  console.log("");
  categories.forEach(({ key, label }) => {
    const list  = config.installed[key] || [];
    const count = list.length;
    const color = count > 0 ? chalk.cyan : chalk.dim;
    const icon  = count > 0 ? logSymbols.success : chalk.dim("○");
    process.stdout.write(`    ${icon} ${label.padEnd(20)} ${color(count.toString().padStart(2))} installed\n`);
  });

  // 4. Customized files (protected from overwrite)
  if (config.customized && config.customized.length > 0) {
    console.log(cyanPink(`\n  ◈ Protected Customizations`));
    config.customized.forEach((f) => {
      console.log(`    ${chalk.yellow("●")} ${chalk.dim(f)}`);
    });
  }

  // 5. Context health panel (silent if context not initialised)
  const contextDir = getContextDir(cwd);
  if (fs.existsSync(contextDir)) {
    console.log(gold(`\n  ◈ Living Context (.agent/context/)`));
    console.log("");

    // File presence check
    for (const file of CONTEXT_FILES) {
      const exists = fs.existsSync(path.join(contextDir, file));
      const icon   = exists ? logSymbols.success : chalk.dim("○");
      console.log(`    ${icon} ${chalk.dim(file)}`);
    }

    // Profile staleness check
    if (profileExists()) {
      const currentHash = await getProfileHash();
      const storedHash  = (config as any)?.contextProfileHash ?? null;
      if (currentHash && currentHash !== storedHash) {
        console.log("");
        console.log(`    ${logSymbols.warning} ${chalk.yellow("Developer profile updated — run")} ${chalk.cyan("studio context sync")}`);
      } else {
        console.log("");
        console.log(`    ${logSymbols.success} ${chalk.dim("Developer profile in sync")}`);
      }
    } else {
      console.log("");
      console.log(`    ${chalk.dim(logSymbols.warning)} ${chalk.dim("No developer profile — run")} ${chalk.cyan("studio profile create")}`);
    }
  }

  logger.blank();
  logger.box(
    `${chalk.bold.white("Quick Commands")}\n\n` +
    `  ${chalk.dim("• Check drift:")}   ${chalk.cyan("studio sync --check")}\n` +
    `  ${chalk.dim("• Pull updates:")}  ${chalk.cyan("studio sync")}\n` +
    `  ${chalk.dim("• Health check:")}  ${chalk.cyan("studio doctor")}\n` +
    `  ${chalk.dim("• Context log:")}   ${chalk.cyan("studio context log")}\n` +
    `  ${chalk.dim("• Context sync:")}  ${chalk.cyan("studio context sync")}`,
    { borderColor: "cyan", padding: 1, margin: { top: 1, bottom: 1 } }
  );
}

function buildBar(pct: number, width: number): string {
  const filled = Math.round((pct / 100) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}
