import { spawn, spawnSync } from "child_process";
import path from "path";
import { readConfig } from "../core/config-manager.js";
import { detectProject } from "../core/project-detector.js";
import { getBashExecutable } from "../core/platform.js";
import { logger } from "../ui/logger.js";
import { Spinner } from "../ui/spinner.js";
import chalk from "chalk";
import { IC } from "../ui/icons.js";
import { sectionHeader, elapsed, langLabel } from "../ui/theme.js";
import gradient from "gradient-string";
import boxen from "boxen";
import type { ValidationResult, ValidationIssue } from "../types/validation.js";
import type { FrameworkInfo } from "../types/config.js";
import { printValidationCoalition } from "../core/agent-gate-map.js";

interface ValidateOptions {
  skipE2e: boolean;
  fix: boolean;
  all: boolean;
  json: boolean;
}

// ── Language-specific check definitions ──────────────────────────────────────

interface NativeCheck {
  label: string;
  cmd: string;
  args: string[];
  isE2e?: boolean;
}

/**
 * Returns the right set of quality-gate checks for the detected language.
 * JS/TS projects run the bundled .agent/scripts/*.ts via tsx.
 * Python/Java/.NET projects run native toolchain commands directly.
 */
function getChecksForLanguage(
  framework: FrameworkInfo,
  fix: boolean
): { native: NativeCheck[]; scripts: Array<{ script: string; label: string; isE2e?: boolean }> } {
  const lang = framework.language ?? "unknown";

  if (lang === "python") {
    return {
      native: [
        {
          label: "Ruff Lint",
          cmd: "ruff",
          args: fix ? ["check", ".", "--fix"] : ["check", "."],
        },
        {
          label: "Ruff Format",
          cmd: "ruff",
          args: fix ? ["format", "."] : ["format", "--check", "."],
        },
        {
          label: "Bandit Security",
          cmd: "bandit",
          args: ["-r", ".", "-ll", "--quiet"],
        },
        {
          label: "Pytest (unit)",
          cmd: "pytest",
          args: ["--tb=short", "-q", "--co", "-q"],
          isE2e: true,
        },
      ],
      scripts: [],
    };
  }

  if (lang === "java") {
    return {
      native: [
        { label: "Maven Checkstyle", cmd: "mvn", args: ["checkstyle:check", "-q"] },
        { label: "Maven Compile",    cmd: "mvn", args: ["compile", "-q"] },
        { label: "Maven Test",       cmd: "mvn", args: ["test", "-q"], isE2e: true },
      ],
      scripts: [],
    };
  }

  if (lang === "csharp") {
    return {
      native: [
        {
          label: "dotnet format",
          cmd: "dotnet",
          args: fix ? ["format"] : ["format", "--verify-no-changes"],
        },
        { label: "dotnet build", cmd: "dotnet", args: ["build", "--nologo", "-q"] },
        { label: "dotnet test",  cmd: "dotnet", args: ["test",  "--nologo", "-q"], isE2e: true },
      ],
      scripts: [],
    };
  }

  if (lang === "dart") {
    return {
      native: [
        { label: "Flutter Analyze", cmd: "flutter", args: ["analyze", "--no-pub"] },
        { label: "Flutter Test",    cmd: "flutter", args: ["test"],                isE2e: true },
      ],
      scripts: [],
    };
  }

  // Default: JS / TS — use polyglot shell runners
  const bash = getBashExecutable();
  return {
    native: [
      { label: "Security Scan",      cmd: bash, args: [".agent/scripts/security-scan/node.sh",      "."] },
      { label: "TypeScript Check",   cmd: bash, args: [".agent/scripts/ts-check/node.sh",          "."] },
      { label: "Env Validator",      cmd: bash, args: [".agent/scripts/env-validator/node.sh",      "."] },
      { label: "Dependency Audit",   cmd: bash, args: [".agent/scripts/dependency-audit/node.sh",  "."] },
      { label: "License Audit",      cmd: bash, args: [".agent/scripts/license-audit/node.sh",     "."] },
      { label: "Accessibility",      cmd: bash, args: [".agent/scripts/accessibility-audit/node.sh","."] },
      { label: "Bundle Analyzer",    cmd: bash, args: [".agent/scripts/bundle-analyzer/node.sh",   "."] },
      { label: "SEO Linter",         cmd: bash, args: [".agent/scripts/seo-linter/node.sh",        "."] },
      { label: "i18n Linter",        cmd: bash, args: [".agent/scripts/i18n-linter/node.sh",       "."] },
      { label: "Type Coverage",      cmd: bash, args: [".agent/scripts/type-coverage/node.sh",     "."] },
      { label: "Full Verify",        cmd: bash, args: [".agent/scripts/verify-all/node.sh",        "."], isE2e: true },
    ],
    scripts: [],
  };
}

// ── Runners ───────────────────────────────────────────────────────────────────

async function runScript(scriptName: string, cwd: string, args: string[] = []): Promise<ValidationResult> {
  const scriptPath = path.join(cwd, ".agent", "scripts", scriptName);
  
  return new Promise((resolve) => {
    const startTime = Date.now();
    const child = spawn("npx", ["tsx", scriptPath, cwd, "--json", ...args], {
      cwd,
      shell: true,
      env: { ...process.env, FORCE_COLOR: "1" },
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => { stdout += data.toString(); });
    child.stderr.on("data", (data) => { stderr += data.toString(); });

    child.on("close", (code) => {
      clearTimeout(timer);
      const durationMs = Date.now() - startTime;
      let parsed: any = null;
      try {
        const match = stdout.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      } catch (e) {}

      const name = scriptName.replace(".ts", "");
      if (parsed && typeof parsed === "object" && "passed" in parsed) {
        resolve({ name, ...parsed, durationMs });
      } else {
        resolve({
          name,
          passed: code === 0,
          summary: code === 0 ? "Check passed" : "Check failed",
          issues: code !== 0 ? [{
            severity: "error",
            message: (stdout + stderr).trim().split("\n")[0] || "Unknown error",
          }] : [],
          durationMs,
        });
      }
    });

    const timer = setTimeout(() => {
      try { child.kill(); } catch { /* already exited */ }
      resolve({
        name: scriptName.replace(".ts", ""),
        passed: false,
        summary: "Execution timed out",
        issues: [{ severity: "error", message: "Script execution exceeded 2 minute timeout" }],
        durationMs: 120_000,
      });
    }, 120_000);
  });
}

/** Run a native toolchain command (python/java/.net) and return a ValidationResult. */
async function runNativeCheck(check: NativeCheck, cwd: string): Promise<ValidationResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const child = spawn(check.cmd, check.args, {
      cwd,
      shell: true,
      env: { ...process.env, FORCE_COLOR: "1" },
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => { stdout += d.toString(); });
    child.stderr.on("data", (d) => { stderr += d.toString(); });

    child.on("close", (code) => {
      clearTimeout(timer);
      const durationMs = Date.now() - startTime;
      const combined = (stdout + stderr).trim();
      const passed = code === 0;
      resolve({
        name: check.label,
        passed,
        summary: passed ? `${check.label} passed` : `${check.label} failed`,
        issues: passed ? [] : [{
          severity: "error" as const,
          message: combined.split("\n").slice(0, 5).join(" | ") || `${check.label} failed (exit ${code})`,
        }],
        durationMs,
      });
    });

    const timer = setTimeout(() => {
      try { child.kill(); } catch { /* already exited */ }
      resolve({
        name: check.label,
        passed: false,
        summary: "Timed out",
        issues: [{ severity: "error", message: `${check.label} exceeded 2 minute timeout` }],
        durationMs: 120_000,
      });
    }, 120_000);
  });
}

export async function validateCommand(
  cwd: string = process.cwd(),
  options: Partial<ValidateOptions> = {}
): Promise<void> {
  const { skipE2e = false, fix = false, all = false, json = false } = options;
  const startTime = Date.now();
  const project = detectProject(cwd);

  const cyanPink = gradient(["#00DBDE", "#FC00FF"]);
  const gold = gradient(["#FDBB2D", "#22C1C3"]);

  if (all && project.isMonorepo) {
    logger.blank();
    process.stdout.write(cyanPink.multiline(
      "  Nexus Orchestrator — Workspace Quality Gates\n" +
      "  " + "─".repeat(50) + "\n"
    ));
    logger.info("Executing validation across all packages via Turborepo...");
    try {
      const turboArgs = ["run", "validate"];
      if (skipE2e) turboArgs.push("--", "--skip-e2e");
      if (fix) turboArgs.push("--", "--fix");
      spawnSync("npx", ["turbo", ...turboArgs], { cwd, stdio: "inherit", shell: true });
      return;
    } catch (e) {
      throw new Error("Workspace orchestration failed. Ensure 'turbo' is installed.");
    }
  }

  const config = readConfig(cwd);
  if (!config) {
    throw new Error("No .agstudio.json found. Run `studio init` first.");
  }

  logger.blank();
  process.stdout.write(cyanPink.multiline(
    "  Nexus Quality Control — Enterprise Gates\n" +
    "  " + "─".repeat(48) + "\n"
  ));

  // ── Language-aware check selection ─────────────────────────────────────────
  const { native, scripts } = getChecksForLanguage(project.framework, fix);
  const lang = project.framework.language ?? "typescript";
  const langLabel = ({
    python: "🐍 Python", java: "☕ Java", csharp: "🔵 .NET",
    dart: "💙 Flutter/Dart", typescript: "🟦 TypeScript", javascript: "🟨 JavaScript",
  } as Record<string, string>)[lang] ?? lang;

  logger.info(`Language detected: ${chalk.bold(langLabel)}`);
  if (native.length > 0) {
    logger.dim(`Running ${native.length} native ${langLabel} checks`);
  } else {
    logger.dim(`Running ${scripts.length} TypeScript quality-gate scripts`);
  }
  logger.blank();

  const results: ValidationResult[] = [];
  const allIssues: Array<ValidationIssue & { script: string }> = [];

  // ── Agent coalition summary (Claude-CLI-style — show who is doing what) ────
  const allChecks = [...native, ...scripts].map((c) => ({ label: c.label }));
  if (!json) {
    printValidationCoalition(allChecks);
    console.log(gold("  ◈ Executing Validation Matrix\n"));
  }

  // ── Native checks (Python / Java / .NET / Flutter) ─────────────────────────
  if (native.length > 0) {
    const parallelNative = native.filter(c => !c.isE2e);
    const sequentialNative = native.filter(c => c.isE2e);

    await Promise.all(parallelNative.map(async (check) => {
      const result = await runNativeCheck(check, cwd);
      results.push(result);
      if (!json) {
        if (result.passed) {
          logger.success(`${check.label} passed`);
        } else {
          logger.error(`${check.label} failed`);
        }
      }
      if (!result.passed) {
        result.issues.forEach(i => allIssues.push({ ...i, script: result.name }));
      }
    }));

    for (const check of sequentialNative) {
      if (skipE2e) {
        if (!json) {
          console.log(`    ${chalk.dim("○")} ${chalk.dim(check.label.padEnd(25))} ${chalk.dim("SKIPPED")}`);
        }
        continue;
      }
      const spinner = json ? null : new Spinner(`Running: ${check.label}...`).start();
      const result = await runNativeCheck(check, cwd);
      results.push(result);
      if (spinner) {
        if (result.passed) spinner.succeed(chalk.green(check.label));
        else {
          spinner.fail(chalk.red(check.label));
        }
      }
      if (!result.passed) {
        result.issues.forEach(i => allIssues.push({ ...i, script: result.name }));
      }
    }
  }

  // ── Script-based checks (TypeScript projects) ──────────────────────────────
  if (scripts.length > 0) {
    const parallelScripts = scripts.filter(c => !c.isE2e);
    const sequentialScripts = scripts.filter(c => c.isE2e);

    await Promise.all(parallelScripts.map(async (check) => {
      const result = await runScript(check.script, cwd, fix ? ["--fix"] : []);
      results.push(result);
      if (!json) {
        if (result.passed) logger.success(`${check.label} passed`);
        else logger.error(`${check.label} failed`);
      }
      if (!result.passed) {
        result.issues.forEach(i => allIssues.push({ ...i, script: result.name }));
      }
    }));

    for (const check of sequentialScripts) {
      if (skipE2e) {
        if (!json) {
          console.log(`    ${chalk.dim("○")} ${chalk.dim(check.label.padEnd(25))} ${chalk.dim("SKIPPED")}`);
        }
        continue;
      }
      const spinner = json ? null : new Spinner(`Checking: ${check.label}...`).start();
      const result = await runScript(check.script, cwd, fix ? ["--fix"] : []);
      results.push(result);
      if (spinner) {
        if (result.passed) spinner.succeed(chalk.green(check.label));
        else {
          spinner.fail(chalk.red(check.label));
        }
      }
      if (!result.passed) {
        result.issues.forEach(i => allIssues.push({ ...i, script: result.name }));
      }
    }
  }

  // ── JSON output (CI mode) ──────────────────────────────────────────────────
  if (json) {
    const totalDuration = Date.now() - startTime;
    const output = {
      passed:   results.filter((r) =>  r.passed).length,
      failed:   results.filter((r) => !r.passed).length,
      skipped:  allChecks.length - results.length,
      duration: totalDuration,
      gates: results.map((r) => ({
        name:     r.name,
        passed:   r.passed,
        duration: r.durationMs,
        issues:   (r.issues ?? []).map((i) => ({
          severity: i.severity,
          message:  i.message,
          ...(i.file !== undefined ? { file: i.file } : {}),
          ...(i.line !== undefined ? { line: i.line } : {}),
        })),
      })),
    };
    process.stdout.write(JSON.stringify(output, null, 2) + "\n");
    if (output.failed > 0) process.exit(1);
    return;
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  if (allIssues.length > 0) {
    console.log(cyanPink("\n  ◈ Engineering Findings Summary\n"));
    allIssues.forEach((issue) => {
      const symbol = issue.severity === "error" ? IC.fail : IC.warn;
      const color  = issue.severity === "error" ? chalk.red : chalk.yellow;
      const location = issue.file ? ` [${issue.file}${issue.line ? `:${issue.line}` : ""}]` : "";
      console.log(`    ${symbol}  ${chalk.bold(issue.script.toUpperCase())}`);
      console.log(`      ${color(issue.message)}${chalk.dim(location)}`);
    });
  }

  logger.blank();
  const failedCount = results.filter((r) => !r.passed).length;
  if (failedCount === 0) {
    logger.box(
      chalk.bold.green("✓ All Quality Gates Passed — Enterprise Standards Met"),
      { borderColor: "green", padding: 1 }
    );
  } else {
    logger.box(
      chalk.bold.red(`${failedCount} Gate Failure(s) Detected`) + "\n" +
      chalk.dim("Review the engineering findings above and initiate remediation steps."),
      { borderColor: "red", padding: 1 }
    );
    process.exit(1);
  }
}
