import ora, { Ora } from "ora";
import chalk from "chalk";

/**
 * A consistent wrapper for CLI spinners
 */
export class Spinner {
  private spinner: Ora;

  constructor(text: string) {
    this.spinner = ora({
      text,
      color: "cyan",
      spinner: "dots",
    });
  }

  /** Start the spinner */
  start(text?: string): Spinner {
    if (text) this.spinner.text = text;
    this.spinner.start();
    return this;
  }

  /** Stop the spinner with a success message */
  succeed(text?: string): void {
    this.spinner.succeed(text);
  }

  /** Stop the spinner with a failure message */
  fail(text?: string): void {
    this.spinner.fail(text ? chalk.red(text) : undefined);
  }

  /** Update the spinner text */
  update(text: string): void {
    this.spinner.text = text;
  }

  /** Stop the spinner without any symbol */
  stop(): void {
    this.spinner.stop();
  }
}
