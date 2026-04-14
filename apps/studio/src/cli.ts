#!/usr/bin/env node
import { execSync } from "child_process";
import { Command } from "commander";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import chalk from "chalk";
import { printBanner, printWelcome } from "./ui/banner.js";
import { logger } from "./ui/logger.js";
import { initCommand, InitCancelledError } from "./commands/init.js";
import { statusCommand } from "./commands/status.js";
import { validateCommand } from "./commands/validate.js";
import { doctorCommand } from "./commands/doctor.js";
import { listCommand } from "./commands/list.js";
import { runCommand } from "./commands/run.js";
import { searchCommand } from "./commands/search.js";
import { infoCommand } from "./commands/info.js";
import { diffCommand } from "./commands/diff.js";
import { rollbackCommand } from "./commands/rollback.js";
import { ciCommand } from "./commands/ci.js";
import { createCommand } from "./commands/create.js";
import { completionCommand } from "./commands/completion.js";
import {
  mcpListCommand,
  mcpAddCommand,
  mcpRemoveCommand,
  mcpApplyCommand,
} from "./commands/mcp.js";
import {
  profileCreateCommand,
  profileShowCommand,
  profileEditCommand,
  profilePathCommand,
} from "./commands/profile.js";
import {
  contextInitCommand,
  contextSyncCommand,
  contextLogCommand,
  contextStatusCommand,
} from "./commands/context.js";
import { contributeCommand } from "./commands/contribute.js";

// ── Windows: switch console to UTF-8 so Unicode symbols render correctly ──────
// Without this, boxen borders and @clack/prompts icons show as garbage (CP437).
if (process.platform === "win32") {
  try { execSync("chcp 65001", { stdio: "pipe" }); } catch { /* non-critical */ }
}

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
  .description("Nexus Studio — The AI Dev OS for Every Team")
  .version(version, "-v, --version", "Output the current version")
  .option("--debug", "Enable debug mode (show full stack traces)", false);

// Wrap actions with global error handling
const wrapAction = (fn: (...args: any[]) => Promise<void>) => {
  return async (...args: any[]) => {
    try {
      await fn(...args);
    } catch (error: any) {
      // User cancellation is not an error
      if (error instanceof InitCancelledError) {
        process.exit(0);
      }

      const isDebug = program.opts().debug;
      logger.blank();
      
      if (error instanceof Error) {
        logger.error(error.message);
        if (isDebug && error.stack) {
          console.error(chalk.dim(error.stack));
        } else if (!isDebug) {
          logger.dim("Use --debug to see full stack trace.");
        }
      } else {
        logger.error(String(error));
      }
      
      process.exit(1);
    }
  };
};

// ─── init ─────────────────────────────────────────────────────────────────
program
  .command("init")
  .description("Initialize the enterprise AI agent toolkit in your project")
  .option("-f, --force", "Overwrite existing .agent files", false)
  .option("-p, --path <dir>", "Target directory", process.cwd())
  .option("-q, --quiet", "Suppress output", false)
  .action(wrapAction(async (opts: { force: boolean; path: string; quiet: boolean }) => {
    if (!opts.quiet) printBanner(version);
    await initCommand(opts.path, { force: opts.force, quiet: opts.quiet });
  }));

// ─── status ───────────────────────────────────────────────────────────────
program
  .command("status")
  .description("Show installed agents, skills, and workflows")
  .action(wrapAction(async () => {
    await statusCommand(process.cwd());
  }));

// ─── list ─────────────────────────────────────────────────────────────────
program
  .command("list")
  .description("List available architectural profiles and specialized agents")
  .action(wrapAction(async () => {
    await listCommand(process.cwd());
  }));

// ─── doctor ───────────────────────────────────────────────────────────────
program
  .command("doctor")
  .description("Check workspace health and configuration integrity")
  .action(wrapAction(async () => {
    await doctorCommand(process.cwd());
  }));

// ─── validate ─────────────────────────────────────────────────────────────
program
  .command("validate")
  .description("Run all enterprise quality gate validation scripts")
  .option("--skip-e2e", "Skip slow Playwright end-to-end tests", false)
  .option("--fix", "Auto-fix issues where possible", false)
  .option("--all", "Run validation across all packages in a monorepo", false)
  .option("--json", "Emit structured JSON output for CI pipelines / Slack / Datadog", false)
  .action(wrapAction(async (opts: { skipE2e: boolean; fix: boolean; all: boolean; json: boolean }) => {
    await validateCommand(process.cwd(), opts);
  }));

// ─── run ──────────────────────────────────────────────────────────────────
program
  .command("run [script]")
  .description("Run a quality-gate script from .agent/scripts/ against your project")
  .option("-s, --stack <stack>", "Force a specific stack runner (node|python|java|dotnet|flutter)")
  .option("--dry-run",           "Show what would be executed without running it", false)
  .option("--fix",               "Pass --fix flag to auto-fixable scripts", false)
  .option("-l, --list",          "List all available scripts", false)
  .addHelpText("after", `
Examples:
  $ studio run security-scan
  $ studio run dependency-audit --fix
  $ studio run ts-check --stack java
  $ studio run verify-all --dry-run
  $ studio run --list`)
  .action(
    wrapAction(
      async (
        script: string | undefined,
        opts: { stack?: string; dryRun: boolean; fix: boolean; list: boolean }
      ) => {
        const runOpts: import("./commands/run.js").RunOptions = {
          dryRun: opts.dryRun,
          fix:    opts.fix,
          list:   opts.list,
        };
        if (opts.stack !== undefined) runOpts.stack = opts.stack;
        await runCommand(script ?? "", process.cwd(), runOpts);
      }
    )
  );

// ─── add ──────────────────────────────────────────────────────────────────
program
  .command("add <type> <id>")
  .description("Add a specific agent, skill, or workflow")
  .usage("agent <id> | skill <id> | workflow <id>")
  .action(wrapAction(async (type: string, id: string) => {
    const { addCommand } = await import("./commands/add.js");
    await addCommand(type, id);
  }));

// ─── remove ───────────────────────────────────────────────────────────────
program
  .command("remove <type> <id>")
  .description("Remove a specific agent, skill, or workflow")
  .action(wrapAction(async (type: string, id: string) => {
    const { removeCommand } = await import("./commands/remove.js");
    await removeCommand(type, id);
  }));

// ─── update ───────────────────────────────────────────────────────────────
program
  .command("update")
  .description("Update installed templates to the latest version")
  .option("--force", "Overwrite customized files", false)
  .option("--dry-run", "Preview what would be updated", false)
  .action(wrapAction(async (opts: { force: boolean; dryRun: boolean }) => {
    const { updateCommand } = await import("./commands/update.js");
    await updateCommand(opts);
  }));

// ─── sync ─────────────────────────────────────────────────────────────────
program
  .command("sync")
  .description("Check for drift and pull latest templates + enforce company standards")
  .option("--check",  "CI mode — exit 1 if drift detected (no prompts)", false)
  .option("--force",  "Pull all updates without prompting", false)
  .option("--quiet",  "Suppress output (for programmatic use)", false)
  .option("--all",    "Monorepo mode — sync all packages under apps/ and packages/", false)
  .option("--deep",   "Deep sync — root instruction files, ghost tracking, profile drift + MCP hints", false)
  .action(wrapAction(async (opts: { check: boolean; force: boolean; quiet: boolean; all: boolean; deep: boolean }) => {
    const { syncCommand } = await import("./commands/sync.js");
    await syncCommand(process.cwd(), opts);
  }));

// ─── company ──────────────────────────────────────────────────────────────
const companyCmd = program
  .command("company")
  .description("Manage enterprise company standards configuration");

companyCmd
  .command("init")
  .description("Scaffold a .agstudio.company.json to define company-wide AI agent standards")
  .argument("<company-name>", "Your company or organisation name")
  .action(wrapAction(async (companyName: string) => {
    const { scaffoldCompanyConfig } = await import("./core/enterprise-config.js");
    await scaffoldCompanyConfig(process.cwd(), companyName);
  }));

companyCmd
  .command("validate")
  .description("Validate the .agstudio.company.json in the current directory")
  .action(wrapAction(async () => {
    const { loadCompanyConfig, validateCompanyConfig } = await import("./core/enterprise-config.js");
    const config = loadCompanyConfig(process.cwd());
    if (!config) {
      logger.error("No .agstudio.company.json found. Run `studio company init <name>` first.");
      process.exit(1);
    }
    const issues = validateCompanyConfig(config);
    if (issues.length === 0) {
      logger.success(`Company config for "${config.companyName}" is valid ✓`);
    } else {
      logger.error(`Found ${issues.length} issue(s):`);
      issues.forEach((i) => logger.warn(`  • ${i}`));
      process.exit(1);
    }
  }));

// ─── search ─────────────────────────────────────────────────────────────────────
program
  .command("search <query>")
  .description("Search agents, skills, and workflows by keyword")
  .option("-t, --type <type>", "Filter by type: agent | skill | workflow")
  .addHelpText("after", `
Examples:
  $ studio search security
  $ studio search react --type skill
  $ studio search architect --type agent`)
  .action(wrapAction(async (query: string, opts: { type?: string }) => {
    await searchCommand(query, process.cwd(), opts);
  }));

// ─── info ────────────────────────────────────────────────────────────────────────
program
  .command("info <type> <id>")
  .description("Show details and template preview for an agent, skill, or workflow")
  .addHelpText("after", `
Examples:
  $ studio info agent security-engineer
  $ studio info skill owasp-top10
  $ studio info workflow deploy`)
  .action(wrapAction(async (type: string, id: string) => {
    await infoCommand(type, id, process.cwd());
  }));

// ─── diff ────────────────────────────────────────────────────────────────────────
program
  .command("diff <type> <id>")
  .description("Show a unified diff of an installed template vs the latest bundled version")
  .addHelpText("after", `
Examples:
  $ studio diff agent security-engineer
  $ studio diff skill owasp-top10`)
  .action(wrapAction(async (type: string, id: string) => {
    await diffCommand(type, id, process.cwd());
  }));

// ─── rollback ───────────────────────────────────────────────────────────────────
program
  .command("rollback")
  .description("Restore .agent/ from the snapshot created by the last studio update")
  .option("--list",  "List all available snapshots", false)
  .option("--force", "Restore without confirmation prompt", false)
  .action(wrapAction(async (opts: { list: boolean; force: boolean }) => {
    await rollbackCommand(process.cwd(), opts);
  }));

// ─── ci ─────────────────────────────────────────────────────────────────────────────
program
  .command("ci")
  .description("Generate a CI pipeline that runs studio validate on every push / pull-request")
  .option("-p, --platform <platform>", "CI platform: github | gitlab")
  .option("-f, --force", "Overwrite existing CI file", false)
  .addHelpText("after", `
Examples:
  $ studio ci
  $ studio ci --platform github
  $ studio ci --platform gitlab --force`)
  .action(wrapAction(async (opts: { platform?: string; force: boolean }) => {
    await ciCommand(process.cwd(), { platform: opts.platform as any, force: opts.force });
  }));

// ─── create ───────────────────────────────────────────────────────────────────────
program
  .command("create <type> <id>")
  .description("Scaffold a custom agent, skill, or workflow template in .agstudio/templates/")
  .addHelpText("after", `
Examples:
  $ studio create agent my-domain-expert
  $ studio create skill my-coding-standards
  $ studio create workflow deploy-checklist`)
  .action(wrapAction(async (type: string, id: string) => {
    await createCommand(type, id, process.cwd());
  }));

// ─── mcp ─────────────────────────────────────────────────────────────────────────────
const mcpCmd = program
  .command("mcp")
  .description("Manage MCP (Model Context Protocol) server configurations");

mcpCmd
  .command("list")
  .description("List all available MCP server definitions")
  .action(wrapAction(async () => {
    await mcpListCommand(process.cwd());
  }));

mcpCmd
  .command("add <id>")
  .description("Enable an MCP server in all detected IDE configs")
  .action(wrapAction(async (id: string) => {
    await mcpAddCommand(id, process.cwd());
  }));

mcpCmd
  .command("remove <id>")
  .description("Remove an MCP server from all detected IDE configs")
  .action(wrapAction(async (id: string) => {
    await mcpRemoveCommand(id, process.cwd());
  }));

mcpCmd
  .command("apply")
  .description("Re-compose all IDE MCP configs from the current profile")
  .action(wrapAction(async () => {
    await mcpApplyCommand(process.cwd());
  }));

// ─── context ─────────────────────────────────────────────────────────────────────
const contextCmd = program
  .command("context")
  .description("Manage the living project context in .agent/context/");

contextCmd
  .command("init")
  .description("Create .agent/context/ files, inject developer profile, generate skills index")
  .option("-f, --force", "Overwrite existing context files", false)
  .action(wrapAction(async (opts: { force: boolean }) => {
    await contextInitCommand(process.cwd(), opts.force);
  }));

contextCmd
  .command("sync")
  .description("Re-inject profile if changed and regenerate SKILLS_INDEX.md")
  .action(wrapAction(async () => {
    await contextSyncCommand(process.cwd());
  }));

contextCmd
  .command("log [type] [message]")
  .description("Append a decision, gotcha, or progress update to context files")
  .addHelpText("after", `
Examples:
  $ studio context log
  $ studio context log decision "chose REST over GraphQL because simpler for this scale"
  $ studio context log gotcha "Prisma client fails in Vercel Edge runtime"
  $ studio context log done "authentication module"
  $ studio context log next "search functionality"
  $ studio context log blocked "waiting for API keys from DevOps"`)
  .action(wrapAction(async (type?: string, message?: string) => {
    await contextLogCommand(process.cwd(), type, message);
  }));

contextCmd
  .command("status")
  .description("Show context health — files present, profile sync status")
  .action(wrapAction(async () => {
    await contextStatusCommand(process.cwd());
  }));

// ─── profile ─────────────────────────────────────────────────────────────────────
const profileCmd = program
  .command("profile")
  .description("Manage your global developer DNA profile (~/.agstudio/profile.md)");

profileCmd
  .command("create")
  .description("Interactive wizard to create your developer profile")
  .action(wrapAction(async () => {
    await profileCreateCommand();
  }));

profileCmd
  .command("show")
  .description("Display your current developer profile")
  .action(wrapAction(async () => {
    await profileShowCommand();
  }));

profileCmd
  .command("edit")
  .description("Open your profile in $EDITOR for manual editing")
  .action(wrapAction(async () => {
    await profileEditCommand();
  }));

profileCmd
  .command("path")
  .description("Print the path to your profile file")
  .action(wrapAction(async () => {
    await profilePathCommand();
  }));

// ─── contribute ──────────────────────────────────────────────────────────────────
program
  .command("contribute [type] [id]")
  .description("Contribute a locally-created agent, skill, or workflow back to the Nexus Studio community")
  .addHelpText("after", `
Examples:
  $ studio contribute
  $ studio contribute skill my-skill-id
  $ studio contribute agent my-agent-id
  $ studio contribute workflow my-workflow-id`)
  .action(wrapAction(async (type: string | undefined, id: string | undefined) => {
    await contributeCommand(type, id, process.cwd());
  }));

// ─── completion ──────────────────────────────────────────────────────────────────
program
  .command("completion [shell]")
  .description("Output shell completion script (bash | zsh | fish | pwsh)")
  .addHelpText("after", `
Examples:
  $ studio completion bash >> ~/.bash_completion.d/studio
  $ studio completion zsh  >> ~/.zshrc
  $ studio completion fish > ~/.config/fish/completions/studio.fish
  $ Invoke-Expression (& studio completion pwsh)`)
  .action(wrapAction(async (shell: string | undefined) => {
    await completionCommand(shell);
  }));

// Show help if no arguments provided
if (process.argv.length <= 2) {
  printBanner(version);
  program.outputHelp();
  process.exit(0);
}

program.parse(process.argv);
