/**
 * icons.ts — Single canonical icon system for Nexus Studio CLI
 *
 * Replaces:
 *   - logSymbols  (✔ ✖ ⚠ ℹ  — inconsistent across platforms)
 *   - Raw emoji   (🔄 ✅ ❌ 🏢 — break on Windows CP437 terminals)
 *
 * All icons are plain Unicode box-drawing / geometric characters that
 * render correctly on Windows Terminal, PowerShell 7, macOS Terminal,
 * iTerm2, and VS Code integrated terminal.
 */

import chalk from "chalk";

// ── Status icons ──────────────────────────────────────────────────────────────

export const IC = {
  // Status
  pass:        chalk.green("✓"),
  fail:        chalk.red("✗"),
  warn:        chalk.yellow("▲"),
  info:        chalk.cyan("◉"),
  skip:        chalk.dim("○"),

  // Actions
  run:         chalk.blue("▶"),
  sync:        chalk.cyan("⟳"),
  add:         chalk.green("⊕"),
  remove:      chalk.red("⊖"),
  arrow:       chalk.blue("→"),
  sub:         chalk.dim("⎿"),       // child / continuation line
  pipe:        chalk.dim("│"),

  // Entities
  agent:       chalk.magenta("◆"),
  skill:       chalk.cyan("◇"),
  enterprise:  chalk.yellow("▣"),
  community:   chalk.magenta("✦"),
  shield:      chalk.red("■"),       // security / hard block
  clock:       chalk.dim("◷"),

  // Section structure
  section:     chalk.bold("◈"),
  block:       chalk.red("■■■"),     // tier 1 fill — see tierBadge()
  divider:     chalk.dim("─"),

  // Language labels (replaces emoji map in validate.ts)
  lang: {
    python:     chalk.yellow("PY"),
    java:       chalk.red("JV"),
    csharp:     chalk.blue("CS"),
    dart:       chalk.cyan("FL"),
    typescript: chalk.blue("TS"),
    javascript: chalk.yellow("JS"),
    unknown:    chalk.dim("??"),
  } as Record<string, string>,
} as const;

// ── Tier badge helpers ────────────────────────────────────────────────────────

/**
 * Visual fill badge for script tiers.
 *
 *   tierBadge(1)  →  "■■■  HARD BLOCK"   (red)
 *   tierBadge(2)  →  "■■░  AUTO-FIX"     (yellow)
 *   tierBadge(3)  →  "■░░  ADVISORY"     (green)
 */
export function tierBadge(tier: 1 | 2 | 3): string {
  switch (tier) {
    case 1: return chalk.red("■■■") + " " + chalk.red.bold("HARD BLOCK");
    case 2: return chalk.yellow("■■") + chalk.dim("░") + " " + chalk.yellow.bold("AUTO-FIX");
    case 3: return chalk.green("■") + chalk.dim("░░") + " " + chalk.green.bold("ADVISORY");
  }
}

/**
 * Map a SCRIPT_TIERS label string → tierBadge output.
 * Keeps run.ts clean — no change to SCRIPT_TIERS data shape needed.
 */
export function labelToTierBadge(label: string): string {
  if (label.startsWith("TIER 1")) return tierBadge(1);
  if (label.startsWith("TIER 2")) return tierBadge(2);
  if (label.startsWith("TIER 3")) return tierBadge(3);
  if (label === "ALL TIERS")      return chalk.cyan("■■■") + " " + chalk.cyan.bold("ALL TIERS");
  return chalk.dim(label);
}
