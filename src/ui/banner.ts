import chalk from "chalk";

export function printBanner(version: string): void {
  console.log("");
  console.log(
    chalk.bold.cyan("  ╔══════════════════════════════════════════════════════╗")
  );
  console.log(
    chalk.bold.cyan("  ║") +
      chalk.bold.white("     ⚡  Antigravity Studio CLI ") +
      chalk.dim(`v${version}`) +
      chalk.bold.cyan("         ║")
  );
  console.log(
    chalk.bold.cyan("  ║") +
      chalk.dim("     Enterprise AI Agent Toolkit for TypeScript      ") +
      chalk.bold.cyan("║")
  );
  console.log(
    chalk.bold.cyan("  ╚══════════════════════════════════════════════════════╝")
  );
  console.log("");
}

export function printWelcome(projectName: string, commandsList: string[]): void {
  console.log("");
  console.log(chalk.bold.green("  ✓ All done! Your enterprise AI toolkit is ready."));
  console.log("");
  console.log(chalk.dim("  Project: ") + chalk.cyan(projectName));
  console.log("");
  console.log(chalk.bold.white("  Slash Commands Available:"));
  const cols = 3;
  const rows = Math.ceil(commandsList.length / cols);
  for (let r = 0; r < rows; r++) {
    const line = commandsList
      .slice(r * cols, r * cols + cols)
      .map((c) => chalk.cyan(c.padEnd(20)))
      .join("  ");
    console.log(`  ${line}`);
  }
  console.log("");
  console.log(
    chalk.dim("  Run ") +
      chalk.cyan("studio validate") +
      chalk.dim(" to run your first quality gate")
  );
  console.log("");
}
