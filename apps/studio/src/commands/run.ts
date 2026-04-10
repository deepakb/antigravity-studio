/**
 * `studio run <script> [--stack <override>]`
 *
 * Runs a single quality-gate shell runner from .agent/scripts/<script>/<stack>.sh.
 * Auto-detects the project stack; use --stack to override.
 */

import path from "path";
import { existsSync, readdirSync, statSync } from "fs";
import { spawn } from "child_process";
import chalk, { type ChalkInstance } from "chalk";
import logSymbols from "log-symbols";
import boxen from "boxen";
import gradient from "gradient-string";
import { detectProject } from "../core/project-detector.js";
import { getBashExecutable, isWindows } from "../core/platform.js";
import { loadRegistry, TEMPLATES_DIR } from "../core/template-engine.js";
import { logger } from "../ui/logger.js";
import { printAgentGateContext } from "../core/agent-gate-map.js";

// ── Types ─────────────────────────────────────────────────────────────────────

type StackName = "node" | "python" | "java" | "dotnet" | "flutter";
const ALL_STACKS: StackName[] = ["node", "python", "java", "dotnet", "flutter"];

export interface RunOptions {
  stack?: string;
  dryRun?: boolean;
  fix?: boolean;
  list?: boolean;
}

// ── Script Registry ───────────────────────────────────────────────────────────

/**
 * Build the script registry dynamically from the bundled templates on disk
 * rather than from a hardcoded static map.  This way run.ts never drifts out of
 * sync with registry.json / the actual .sh files that are shipped.
 *
 * Scans:  templates/.agent/scripts/<gate>/<stack>.sh  (and .ps1 for Windows)
 * Returns: Record<gateName, StackName[]>
 */
function buildScriptRegistry(): Record<string, StackName[]> {
  const scriptsDir = path.join(TEMPLATES_DIR, ".agent", "scripts");
  if (!existsSync(scriptsDir)) return {};

  const result: Record<string, StackName[]> = {};

  try {
    for (const gate of readdirSync(scriptsDir)) {
      const gateDir = path.join(scriptsDir, gate);
      if (!statSync(gateDir).isDirectory()) continue;

      const stacks: StackName[] = [];
      for (const file of readdirSync(gateDir)) {
        // Accept both .sh runners and .ps1 Windows runners
        if (!file.endsWith(".sh") && !file.endsWith(".ps1")) continue;
        const runner = file.replace(/\.(sh|ps1)$/, "") as StackName;
        if (ALL_STACKS.includes(runner) && !stacks.includes(runner)) stacks.push(runner);
      }
      if (stacks.length > 0) result[gate] = stacks;
    }
  } catch {
    // If scanning fails (e.g. fresh install before init), return empty — handled downstream
  }

  return result;
}

// Tier metadata is still declared here because it is presentation-only and
// does not need to come from registry.json.
const SCRIPT_TIERS: Record<string, { label: string; color: ChalkInstance }> = {
  "security-scan":       { label: "TIER 1 · HARD BLOCK", color: chalk.red   },
  "ts-check":            { label: "TIER 1 · HARD BLOCK", color: chalk.red   },
  "env-validator":       { label: "TIER 1 · HARD BLOCK", color: chalk.red   },
  "dependency-audit":    { label: "TIER 2 · AUTO-FIX",   color: chalk.yellow },
  "license-audit":       { label: "TIER 2 · AUTO-FIX",   color: chalk.yellow },
  "accessibility-audit": { label: "TIER 3 · ADVISORY",   color: chalk.green  },
  "bundle-analyzer":     { label: "TIER 3 · ADVISORY",   color: chalk.green  },
  "performance-budget":  { label: "TIER 3 · ADVISORY",   color: chalk.green  },
  "seo-linter":          { label: "TIER 3 · ADVISORY",   color: chalk.green  },
  "i18n-linter":         { label: "TIER 3 · ADVISORY",   color: chalk.green  },
  "type-coverage":       { label: "TIER 3 · ADVISORY",   color: chalk.green  },
  "verify-all":          { label: "ALL TIERS",            color: chalk.cyan   },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function languageToStack(lang: string): StackName {
  switch (lang) {
    case "python": return "python";
    case "java":   return "java";
    case "csharp": return "dotnet";
    case "dart":   return "flutter";
    default:       return "node";
  }
}

function printScriptList(): void {
  const registry = buildScriptRegistry();
  console.log(
    boxen(
      gradient.passion("  Available Quality Gate Scripts  "),
      { padding: 0, margin: { top: 1, bottom: 0, left: 0, right: 0 }, borderStyle: "round", borderColor: "cyan" }
    )
  );
  console.log();

  const rows: [string, string, string][] = [];
  for (const [name, stacks] of Object.entries(registry)) {
    const t = SCRIPT_TIERS[name];
    rows.push([
      t ? t.color(t.label.padEnd(22)) : "".padEnd(22),
      chalk.cyan(name.padEnd(26)),
      chalk.dim(`[${stacks.join(", ")}]`),
    ]);
  }

  for (const [tier, name, stacks] of rows) {
    console.log(`  ${tier}  ${name}  ${stacks}`);
  }

  console.log();
  console.log(chalk.dim("  Usage: studio run <script> [--stack node|python|java|dotnet|flutter]"));
  console.log(chalk.dim("  Extra: studio run verify-all             ← runs ALL gates for your stack"));
  console.log();
}

// ── Main Command ──────────────────────────────────────────────────────────────

export async function runCommand(
  scriptName: string,
  cwd: string,
  opts: RunOptions = {}
): Promise<void> {
  // --list flag — show all available scripts then exit
  if (opts.list || !scriptName) {
    printScriptList();
    return;
  }

  // Build the runtime registry once per command invocation
  const scriptRegistry = buildScriptRegistry();

  // ── Validate script name ──────────────────────────────────────────────────
  if (!scriptRegistry[scriptName]) {
    logger.blank();
    logger.error(`Unknown script: "${chalk.cyan(scriptName)}"`);
    logger.blank();
    printScriptList();
    process.exit(1);
  }

  // ── Resolve stack ─────────────────────────────────────────────────────────
  let stack: StackName;

  if (opts.stack) {
    const allowed: StackName[] = ["node", "python", "java", "dotnet", "flutter"];
    if (!allowed.includes(opts.stack as StackName)) {
      logger.error(
        `Invalid --stack "${opts.stack}". Must be one of: ${allowed.map((s) => chalk.cyan(s)).join(", ")}`
      );
      process.exit(1);
    }
    stack = opts.stack as StackName;
    logger.dim(`Stack override: ${stack}`);
  } else {
    logger.dim("Detecting project stack…");
    const project = detectProject(cwd);
    stack = languageToStack(project.framework.language);
    logger.dim(`Detected stack: ${stack} (${project.framework.language})`);
  }

  // ── Check script supports this stack ──────────────────────────────────────
  const supportedStacks = scriptRegistry[scriptName] ?? [];
  if (!supportedStacks.includes(stack)) {
    logger.blank();
    logger.warn(
      `Script ${chalk.cyan(scriptName)} has no runner for stack ${chalk.yellow(stack)}.`
    );
    logger.info(`Supported stacks: [${supportedStacks.map((s: StackName) => chalk.cyan(s)).join(", ")}]`);
    logger.info(`Use ${chalk.dim("--stack <stack>")} to override.`);
    logger.blank();
    // Non-fatal — advisory scripts may legitimately not support every stack
    process.exit(0);
  }

  // ── Resolve script path — prefer .sh, fall back to .ps1 on Windows ──────
  const shRelPath  = path.join(".agent", "scripts", scriptName, `${stack}.sh`);
  const ps1RelPath = path.join(".agent", "scripts", scriptName, `${stack}.ps1`);
  const shAbsPath  = path.join(cwd, shRelPath);
  const ps1AbsPath = path.join(cwd, ps1RelPath);

  // Determine which runner to use
  const usePs1   = isWindows() && !existsSync(shAbsPath) && existsSync(ps1AbsPath);
  const scriptRelPath = usePs1 ? ps1RelPath : shRelPath;
  const scriptAbsPath = usePs1 ? ps1AbsPath : shAbsPath;

  if (!existsSync(scriptAbsPath)) {
    logger.blank();
    logger.error(`Script runner not found: ${chalk.dim(shRelPath)}`);
    if (isWindows()) {
      logger.info("Tip: .ps1 runners are also checked on Windows when .sh is not available.");
    }
    logger.info("Run `studio init` to set up the .agent directory, then re-run.");
    logger.blank();
    process.exit(1);
  }

  // ── Header ────────────────────────────────────────────────────────────────
  const tierInfo = SCRIPT_TIERS[scriptName];
  const tierDisplay = tierInfo ? tierInfo.color(tierInfo.label) : "";

  console.log(
    boxen(
      gradient.passion("  studio run  ") + "\n" +
      chalk.white("  Script : ") + chalk.cyan(scriptName)        + "\n" +
      chalk.white("  Stack  : ") + chalk.yellow(stack)           + "\n" +
      chalk.white("  Tier   : ") + tierDisplay                   + "\n" +
      chalk.white("  Runner : ") + chalk.dim(scriptRelPath),
      { padding: 0, margin: { top: 1, bottom: 0, left: 0, right: 0 }, borderStyle: "round", borderColor: "cyan" }
    )
  );
  logger.blank();

  // ── Agent / skill context (Claude-CLI-style inline transparency) ──────────
  printAgentGateContext(scriptName, scriptRelPath);

  // ── Dry-run shortcut ──────────────────────────────────────────────────────
  if (opts.dryRun) {
    if (usePs1) {
      console.log(`${logSymbols.info} ${chalk.dim("[dry-run]")} Would execute (PowerShell):`);
      console.log(chalk.cyan(`  pwsh -NonInteractive -File ${scriptRelPath} ${cwd}${opts.fix ? " --fix" : ""}`));
    } else {
      const bashExe = getBashExecutable();
      console.log(`${logSymbols.info} ${chalk.dim("[dry-run]")} Would execute:`);
      console.log(chalk.cyan(`  ${bashExe} ${scriptRelPath} ${cwd}${opts.fix ? " --fix" : ""}`));
    }
    logger.blank();
    return;
  }

  // ── Spawn shell runner ────────────────────────────────────────────────────
  let shellExe: string;
  let shellArgs: string[];

  if (usePs1) {
    // PowerShell Core (pwsh) or Windows PowerShell (powershell)
    shellExe  = "pwsh";
    shellArgs = ["-NonInteractive", "-File", scriptAbsPath, cwd];
    if (opts.fix) shellArgs.push("--fix");
  } else {
    shellExe  = getBashExecutable();
    shellArgs = [scriptAbsPath, cwd];
    if (opts.fix) shellArgs.push("--fix");
  }

  const child = spawn(shellExe, shellArgs, {
    cwd,
    stdio: "inherit",          // stream output directly — AI/human readable
    shell: false,
    env: { ...process.env, FORCE_COLOR: "1", AG_SCRIPT: scriptName, AG_STACK: stack },
  });

  child.on("error", (err) => {
    logger.blank();
    logger.error(`Failed to launch shell: ${err.message}`);
    logger.info(`Shell used: ${shellExe}`);
    logger.info(
      usePs1
        ? "Ensure PowerShell (pwsh or powershell) is available on your PATH."
        : "Ensure Git Bash is installed and available on your PATH (or at the default Git for Windows path)."
    );
    process.exit(1);
  });

  child.on("close", (code) => {
    logger.blank();
    if (code === 0) {
      console.log(
        `${logSymbols.success} ${chalk.green(`"${scriptName}" passed`)} ${chalk.dim(`[${stack}]`)}`
      );
    } else {
      console.log(
        `${logSymbols.error} ${chalk.red(`"${scriptName}" failed`)} ${chalk.dim(`exit ${code}  [${stack}]`)}`
      );
      if (tierInfo?.label.startsWith("TIER 1")) {
        console.log(chalk.red.bold("  ⛔  TIER 1 HARD BLOCK — commit should not proceed."));
      }
      process.exit(code ?? 1);
    }
  });
}
