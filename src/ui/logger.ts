import chalk from "chalk";

const PREFIX = {
  info: chalk.cyan("ℹ"),
  success: chalk.green("✓"),
  warn: chalk.yellow("⚠"),
  error: chalk.red("✗"),
  step: chalk.blue("→"),
  dim: chalk.dim("·"),
};

export const logger = {
  info: (msg: string) => console.log(`${PREFIX.info} ${msg}`),
  success: (msg: string) => console.log(`${PREFIX.success} ${chalk.green(msg)}`),
  warn: (msg: string) => console.warn(`${PREFIX.warn} ${chalk.yellow(msg)}`),
  error: (msg: string) => console.error(`${PREFIX.error} ${chalk.red(msg)}`),
  step: (msg: string) => console.log(`${PREFIX.step} ${msg}`),
  dim: (msg: string) => console.log(`${PREFIX.dim} ${chalk.dim(msg)}`),
  blank: () => console.log(""),
  divider: () => console.log(chalk.dim("─".repeat(55))),

  /** Print a section header */
  section: (title: string) => {
    console.log("");
    console.log(chalk.bold.white(title));
    console.log(chalk.dim("─".repeat(title.length)));
  },
};
