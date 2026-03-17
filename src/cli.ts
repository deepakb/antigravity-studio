#!/usr/bin/env node
import { Command } from "commander";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { printBanner } from "./ui/banner.js";
import { initCommand } from "./commands/init.js";
import { statusCommand } from "./commands/status.js";
import { validateCommand } from "./commands/validate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getVersion(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(path.resolve(__dirname, "../package.json"), "utf-8")
    ) as { version: string };
    return pkg.version;
  } catch {
    return "1.0.0";
  }
}

const version = getVersion();
const program = new Command();

program
  .name("studio")
  .description("Antigravity Studio — Enterprise AI Agent Toolkit for TypeScript")
  .version(version, "-v, --version", "Output the current version");

// ─── init ─────────────────────────────────────────────────────────────────
program
  .command("init")
  .description("Initialize the enterprise AI agent toolkit in your project")
  .option("-f, --force", "Overwrite existing .agent files", false)
  .option("-p, --path <dir>", "Target directory (default: current directory)", process.cwd())
  .option("-q, --quiet", "Suppress output (for CI/CD)", false)
  .option("--dry-run", "Preview actions without making any changes", false)
  .action(async (opts: { force: boolean; path: string; quiet: boolean; dryRun: boolean }) => {
    if (!opts.quiet) printBanner(version);
    await initCommand(opts.path);
  });

// ─── status ───────────────────────────────────────────────────────────────
program
  .command("status")
  .description("Show installed agents, skills, and workflows")
  .action(async () => {
    await statusCommand(process.cwd());
  });

// ─── validate ─────────────────────────────────────────────────────────────
program
  .command("validate")
  .description("Run all enterprise quality gate validation scripts")
  .option("--skip-e2e", "Skip slow Playwright end-to-end tests", false)
  .option("--fix", "Auto-fix issues where possible (ESLint --fix)", false)
  .action(async (opts: { skipE2e: boolean; fix: boolean }) => {
    await validateCommand(process.cwd(), opts);
  });

// ─── add ──────────────────────────────────────────────────────────────────
program
  .command("add <type> <name>")
  .description("Add a specific agent, skill, or workflow")
  .usage("agent <name> | skill <name> | workflow <name>")
  .action(async (type: string, name: string) => {
    const { addCommand } = await import("./commands/add.js");
    await addCommand(type, name);
  });

// ─── remove ───────────────────────────────────────────────────────────────
program
  .command("remove <type> <name>")
  .description("Remove a specific agent, skill, or workflow")
  .action(async (type: string, name: string) => {
    const { removeCommand } = await import("./commands/remove.js");
    await removeCommand(type, name);
  });

// ─── update ───────────────────────────────────────────────────────────────
program
  .command("update")
  .description("Update installed templates to the latest version")
  .option("--force", "Overwrite customized files", false)
  .option("--dry-run", "Preview what would be updated", false)
  .action(async (opts: { force: boolean; dryRun: boolean }) => {
    const { updateCommand } = await import("./commands/update.js");
    await updateCommand(opts);
  });

program.parse(process.argv);

// Show help if no command given
if (!process.argv.slice(2).length) {
  printBanner(version);
  program.outputHelp();
}
