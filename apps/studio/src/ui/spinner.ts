import ora, { Ora } from "ora";
import chalk from "chalk";

/**
 * Enterprise-grade spinner frames.
 * Rotating quarter-circle: ◐◓◑◒  (renders cleanly on all terminals)
 */
const ENTERPRISE_SPINNER = { frames: ["◐", "◓", "◑", "◒"], interval: 80 };

/**
 * Filling bar frames — used for longer file-scan operations.
 * ▱▱▱ → ▰▱▱ → ▰▰▱ → ▰▰▰
 */
const BAR_SPINNER = { frames: ["▱▱▱", "▰▱▱", "▰▰▱", "▰▰▰"], interval: 200 };

/**
 * A consistent wrapper for CLI spinners.
 */
export class Spinner {
  private spinner: Ora;

  constructor(text: string) {
    this.spinner = ora({
      text,
      color: "cyan",
      spinner: ENTERPRISE_SPINNER,
    });
  }

  /**
   * Factory for file-scan / long-copy operations.
   * Uses a filling-bar animation instead of the rotating circle.
   */
  static bar(text: string): Spinner {
    const instance = new Spinner(text);
    instance.spinner = ora({
      text,
      color: "cyan",
      spinner: BAR_SPINNER,
    });
    return instance;
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
