import chalk from "chalk";
import boxen, { Options as BoxenOptions } from "boxen";
import { IC } from "./icons.js";
import { sectionHeader, commandBanner, elapsed, termWidth } from "./theme.js";

export const logger = {
  info:    (msg: string) => console.log(`${IC.info}  ${msg}`),
  success: (msg: string) => console.log(`${IC.pass}  ${chalk.green(msg)}`),
  warn:    (msg: string) => console.warn(`${IC.warn}  ${chalk.yellow(msg)}`),
  error:   (msg: string) => console.error(`${IC.fail}  ${chalk.red(msg)}`),
  step:    (msg: string) => console.log(`${IC.arrow} ${msg}`),
  dim:     (msg: string) => console.log(chalk.dim(`  ${IC.sub} ${msg}`)),
  blank:   () => console.log(""),
  divider: () => console.log(chalk.dim("─".repeat(termWidth()))),

  /** Full-width ◈ section header with optional right-aligned item count */
  section: (title: string, count?: number) => {
    console.log("");
    console.log(sectionHeader(title, count));
  },

  /**
   * 1-line command context banner printed at the top of every command.
   * e.g. logger.header("validate", { project: "my-app", stack: "node" })
   */
  header: (cmd: string, meta: Record<string, string> = {}) => {
    console.log("");
    console.log(commandBanner(cmd, meta));
    console.log("");
  },

  /**
   * Elapsed timing line for end-of-command summaries.
   * e.g. logger.timed("Completed", Date.now() - startTime)
   */
  timed: (label: string, ms: number) => {
    console.log(`  ${IC.clock}  ${chalk.dim(label)} ${chalk.cyan(elapsed(ms))}`);
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
