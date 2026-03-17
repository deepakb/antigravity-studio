import { readConfig } from "../core/config-manager.js";
import { logger } from "../ui/logger.js";
import chalk from "chalk";

export async function statusCommand(cwd: string = process.cwd()): Promise<void> {
  const config = readConfig(cwd);

  if (!config) {
    logger.error("No .agstudio.json found. Run `studio init` first.");
    process.exit(1);
  }

  logger.blank();
  logger.section(`Antigravity Studio — ${config.project}`);

  console.log(
    `  ${chalk.dim("Profile:")}     ${chalk.cyan(config.profile)}`
  );
  console.log(
    `  ${chalk.dim("Version:")}     ${chalk.cyan(config.version)}`
  );
  logger.blank();

  const entries: Array<["agents" | "skills" | "workflows" | "scripts", string]> = [
    ["agents", "Agents"],
    ["skills", "Skills"],
    ["workflows", "Workflows"],
    ["scripts", "Scripts"],
  ];

  for (const [key, label] of entries) {
    const list = config.installed[key];
    const icon = list.length > 0 ? chalk.green("✓") : chalk.dim("○");
    console.log(
      `  ${icon} ${chalk.white(label.padEnd(12))} ${chalk.cyan(list.length.toString().padStart(2))} installed`
    );
  }

  if (config.customized.length > 0) {
    logger.blank();
    logger.warn(`${config.customized.length} file(s) marked as customized (protected from update):`);
    config.customized.forEach((f) => logger.dim(`  - ${f}`));
  }

  logger.blank();
  logger.dim(`Run ${chalk.cyan("studio update")} to pull the latest agent definitions.`);
  logger.blank();
}
