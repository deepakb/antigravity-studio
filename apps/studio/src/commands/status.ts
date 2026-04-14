import { readConfig } from "../core/config-manager.js";
import { loadCompanyConfig } from "../core/enterprise-config.js";
import { logger } from "../ui/logger.js";
import { getContextDir, CONTEXT_FILES } from "../core/context-manager.js";
import { profileExists, getProfileHash } from "../core/profile-manager.js";
import chalk from "chalk";
import { IC } from "../ui/icons.js";
import { sectionHeader, progressBar } from "../ui/theme.js";
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
    const bar = progressBar(pct, 20);

    console.log(gold("\n  ◈ Enterprise Standards"));
    console.log(`    ${chalk.bold("Company:")}    ${chalk.cyan(companyConfig.companyName)} v${companyConfig.version}`);
    console.log(`    ${chalk.bold("Compliance:")} ${bar} ${pct}%`);
    if (missing.length > 0) {
      console.log(`    ${IC.warn} Missing required skills: ${missing.map(s => chalk.yellow(s)).join(", ")}`);
      console.log(`    ${chalk.dim("→ Run")} ${chalk.cyan("studio sync")} ${chalk.dim("to install them")}`);
    } else {
      console.log(`    ${IC.pass}  All ${required.length} required skills installed`);
    }
  } else {
    console.log(gold("\n  ◈ Enterprise Standards"));
    console.log(`    ${IC.warn}  No company config — run config — run ${chalk.cyan("studio company init <name>")} to set standards`);
  }

  // 3. Installed Assets — two-panel grid
  console.log(gold(`\n  \u25c8 Knowledge Assets & Tools`));
  console.log("");

  const panels: Array<{ key: "agents" | "skills" | "workflows" | "scripts"; label: string }> = [
    { key: "agents",    label: "AI Agents" },
    { key: "skills",    label: "Skills" },
    { key: "workflows", label: "Workflows" },
    { key: "scripts",   label: "Scripts" },
  ];

  // Print in 2x2 grid: [Agents | Skills] / [Workflows | Scripts]
  for (let i = 0; i < panels.length; i += 2) {
    const left  = panels[i]!;
    const right = panels[i + 1];
    const lCount = (config.installed[left.key] || []).length;
    const rCount = right ? (config.installed[right.key] || []).length : 0;
    const lIcon  = lCount > 0 ? IC.pass : IC.skip;
    const rIcon  = right ? (rCount > 0 ? IC.pass : IC.skip) : "";
    const lCol   = lCount > 0 ? chalk.cyan : chalk.dim;
    const rCol   = rCount > 0 ? chalk.cyan : chalk.dim;

    const leftCell  = `${lIcon}  ${chalk.bold(left.label.padEnd(12))} ${lCol(lCount.toString().padStart(3))} installed`;
    const rightCell = right
      ? `${rIcon}  ${chalk.bold(right.label.padEnd(12))} ${rCol(rCount.toString().padStart(3))} installed`
      : "";
    console.log(`    ${leftCell}     ${rightCell}`);
  }

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
      const icon   = exists ? IC.pass : IC.skip;
      console.log(`    ${icon}  ${chalk.dim(file)}`);
    }

    // Profile staleness check
    if (profileExists()) {
      const currentHash = await getProfileHash();
      const storedHash  = (config as any)?.contextProfileHash ?? null;
      if (currentHash && currentHash !== storedHash) {
        console.log("");
        console.log(`    ${IC.warn}  ${chalk.yellow("Developer profile updated — run")} ${chalk.cyan("studio context sync")}`);
      } else {
        console.log("");
        console.log(`    ${IC.pass}  ${chalk.dim("Developer profile in sync")}`);
      }
    } else {
      console.log("");
      console.log(`    ${IC.skip}  ${chalk.dim("No developer profile — run")} ${chalk.cyan("studio profile create")}`);
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


