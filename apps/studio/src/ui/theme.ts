/**
 * theme.ts — Shared layout utilities and gradient definitions
 *
 * Single source of truth for:
 *   - Named gradients (GRAD.*)
 *   - Section divider headers with right-aligned count
 *   - 1-line command context banner (like kubectl context display)
 *   - Progress bar builder
 *   - Elapsed time formatter
 *   - Language label map (replaces emoji object in validate.ts)
 */

import chalk from "chalk";
import gradient from "gradient-string";

// ── Named gradients ───────────────────────────────────────────────────────────

// Use a simple callable type to avoid gradient-string's non-exported interface names
type Grad = (str: string) => string;

export const GRAD = {
  /** Cyan → magenta  — primary header gradient used across all commands */
  header:  gradient(["#00DBDE", "#FC00FF"]) as unknown as Grad,
  /** Gold → teal     — section heading gradient */
  gold:    gradient(["#FDBB2D", "#22C1C3"]) as unknown as Grad,
  /** Red → orange    — used in run.ts header */
  passion: gradient.passion  as unknown as Grad,
  /** Purple → teal   — available for alternate styling */
  vice:    gradient.vice     as unknown as Grad,
};

// ── Terminal width helper ─────────────────────────────────────────────────────

/** Safe terminal width — falls back to 80 when stdout is not a TTY (CI). */
export function termWidth(): number {
  return process.stdout.columns ?? 80;
}

// ── Section header ────────────────────────────────────────────────────────────

/**
 * Render a full-width ◈ section header with optional right-aligned count.
 *
 * Example:
 *   sectionHeader("Agent Coalition", 10)
 *   →  "  ◈ Agent Coalition ─────────────────────── 10 ◈"
 */
export function sectionHeader(title: string, count?: number): string {
  const prefix  = `  ◈ ${title}`;
  const suffix  = count !== undefined
    ? ` ${chalk.dim(count.toString())} ${chalk.bold("◈")}`
    : ` ${chalk.bold("◈")}`;
  const width   = termWidth();
  const fillLen = Math.max(2, width - prefix.length - suffix.length - 1);
  const fill    = chalk.dim("─".repeat(fillLen));
  return GRAD.gold(`${prefix} `) + fill + GRAD.gold(suffix);
}

// ── Command context banner ────────────────────────────────────────────────────

/**
 * Prints a 1-line context row showing which command is running and key metadata.
 *
 * Example:
 *   commandBanner("validate", { project: "my-app", stack: "node", version: "5.7" })
 *   →  "  ◉  studio validate  ·  project: my-app  ·  stack: node  ·  ts 5.7"
 */
export function commandBanner(cmd: string, meta: Record<string, string>): string {
  const parts = Object.entries(meta).map(
    ([k, v]) => chalk.dim(`${k}: `) + chalk.cyan(v)
  );
  const separator = chalk.dim("  ·  ");
  return (
    chalk.dim("  ◉  ") +
    chalk.bold.white(`studio ${cmd}`) +
    separator +
    parts.join(separator)
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

/**
 * Build a filled progress bar string.
 *
 *   progressBar(80, 20)  →  "████████████████░░░░"
 *   progressBar(100, 20) →  "████████████████████"
 */
export function progressBar(pct: number, width: number = 20): string {
  const clamped = Math.max(0, Math.min(100, pct));
  const filled  = Math.round((clamped / 100) * width);
  const empty   = width - filled;
  const bar     = "█".repeat(filled) + "░".repeat(empty);
  if (clamped === 100) return chalk.green(bar);
  if (clamped >= 75)   return chalk.cyan(bar);
  if (clamped >= 50)   return chalk.yellow(bar);
  return chalk.red(bar);
}

// ── Elapsed time ──────────────────────────────────────────────────────────────

/**
 * Format elapsed milliseconds into a human-readable string.
 *
 *   elapsed(412)   →  "412ms"
 *   elapsed(1234)  →  "1.2s"
 *   elapsed(62000) →  "1m 2s"
 */
export function elapsed(ms: number): string {
  if (ms < 1000)         return `${ms}ms`;
  if (ms < 60_000)       return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60_000);
  const s = Math.round((ms % 60_000) / 1000);
  return `${m}m ${s}s`;
}

// ── Language labels ───────────────────────────────────────────────────────────

/**
 * Human-readable language label map.
 * Replaces the emoji object in validate.ts.
 *
 *   langLabel("python")     →  "Python"   (yellow)
 *   langLabel("typescript") →  "TypeScript" (blue)
 */
export const LANG_LABEL: Record<string, string> = {
  python:     chalk.yellow("Python"),
  java:       chalk.red("Java"),
  csharp:     chalk.blue(".NET / C#"),
  dart:       chalk.cyan("Flutter / Dart"),
  typescript: chalk.blue("TypeScript"),
  javascript: chalk.yellow("JavaScript"),
  unknown:    chalk.dim("unknown"),
};

export function langLabel(lang: string): string {
  return LANG_LABEL[lang] ?? chalk.dim(lang);
}
