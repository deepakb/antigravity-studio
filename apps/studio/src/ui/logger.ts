import chalk from "chalk";
import logSymbols from "log-symbols";
import boxen, { Options as BoxenOptions } from "boxen";

export const logger = {
  info: (msg: string) => console.log(`${logSymbols.info} ${msg}`),
  success: (msg: string) => console.log(`${logSymbols.success} ${chalk.green(msg)}`),
  warn: (msg: string) => console.warn(`${logSymbols.warning} ${chalk.yellow(msg)}`),
  error: (msg: string) => console.error(`${logSymbols.error} ${chalk.red(msg)}`),
  step: (msg: string) => console.log(`${chalk.blue("→")} ${msg}`),
  dim: (msg: string) => console.log(chalk.dim(`· ${msg}`)),
  blank: () => console.log(""),
  divider: () => console.log(chalk.dim("─".repeat(55))),

  /** Print a section header */
  section: (title: string) => {
    console.log("");
    console.log(chalk.bold.white(title));
    console.log(chalk.dim("─".repeat(title.length)));
  },

  /** Print a message in a box */
  box: (message: string, options: BoxenOptions = {}) => {
    console.log(
      boxen(message, {
        padding: 1,
        margin: { top: 1, bottom: 1 },
        borderStyle: "round",
        borderColor: "cyan",
        ...options,
      })
    );
  },
};
