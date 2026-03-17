import { spawnSync } from "child_process";
import path from "path";
import { readConfig } from "../core/config-manager.js";
import { detectProject } from "../core/project-detector.js";
import { logger } from "../ui/logger.js";
import chalk from "chalk";
import ora from "ora";
import type { ValidationResult, ValidationIssue, ValidationSeverity } from "../types/validation.js";

interface ValidateOptions {
  skipE2e: boolean;
  fix: boolean;
  all: boolean;
}

function runScript(scriptName: string, cwd: string, args: string[] = []): ValidationResult {
// ... existing runScript logic
  const scriptPath = path.join(cwd, ".agent", "scripts", scriptName);
  
  // Try running with --json flag first to get structured data
  const result = spawnSync("npx", ["tsx", scriptPath, cwd, "--json", ...args], {
    cwd,
    encoding: "utf-8",
    timeout: 120_000,
    shell: true,
  });

  let parsed: any = null;
  try {
    // Look for JSON block in output (in case of mixed logs)
    const match = result.stdout?.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    }
  } catch (e) {
    // Fallback to legacy parsing if JSON fails
  }

  if (parsed && typeof parsed === 'object' && 'passed' in parsed) {
    return {
      name: scriptName.replace(".ts", ""),
      ...parsed,
      durationMs: 0, // Could be tracked if needed
    };
  }

  // Legacy fallback
  return {
    name: scriptName.replace(".ts", ""),
    passed: result.status === 0,
    summary: result.status === 0 ? "Check passed" : "Check failed",
    issues: result.status !== 0 ? [{
      severity: "error",
      message: (String(result.stdout || "") + String(result.stderr || "")).trim().split("\n")[0] || "Unknown error",
    }] : [],
  };
}

export async function validateCommand(
  cwd: string = process.cwd(),
  options: Partial<ValidateOptions> = {}
): Promise<void> {
  const { skipE2e = false, fix = false, all = false } = options;
  const project = await detectProject(cwd);

  // Monorepo Orchestration
  if (all && project.isMonorepo) {
    logger.blank();
    logger.section("Orchestrating Workspace-Wide Quality Gates");
    logger.info("Executing validation across all packages via Turborepo...");
    
    try {
      const turboArgs = ["run", "validate"];
      if (skipE2e) turboArgs.push("--", "--skip-e2e");
      if (fix) turboArgs.push("--", "--fix");
      
      spawnSync("npx", ["turbo", ...turboArgs], { cwd, stdio: "inherit", shell: true });
      return;
    } catch (e) {
      logger.error("Workspace orchestration failed. Ensure 'turbo' is installed and scripts are defined.");
      process.exit(1);
    }
  }

  const config = readConfig(cwd);
  if (!config) {
    logger.error("No .agstudio.json found. Run `studio init` first.");
    process.exit(1);
  }

  logger.blank();
  logger.section("Running Enterprise Quality Gates");

  const checks: Array<{ script: string; label: string; isE2e?: boolean }> = [
    { script: "ts-check.ts", label: "TypeScript & ESLint" },
    { script: "security-scan.ts", label: "Security Scan" },
    { script: "seo-linter.ts", label: "SEO Linter" },
    { script: "accessibility-audit.ts", label: "Accessibility Audit" },
    { script: "verify-all.ts", label: "End-to-End Tests", isE2e: true },
  ];

  const results: ValidationResult[] = [];
  const allIssues: Array<ValidationIssue & { script: string }> = [];

  for (const check of checks) {
    if (check.isE2e && skipE2e) {
      logger.dim(`  ○ ${check.label} — skipped (--skip-e2e)`);
      continue;
    }

    const spinner = ora(`  Running: ${check.label}...`).start();
    const result = runScript(check.script, cwd, fix ? ["--fix"] : []);
    results.push(result);

    if (result.passed) {
      spinner.succeed(chalk.green(`  ${check.label}`));
    } else {
      spinner.fail(chalk.red(`  ${check.label}`));
      result.issues.forEach(issue => allIssues.push({ ...issue, script: result.name }));
    }
  }

  if (allIssues.length > 0) {
    logger.blank();
    logger.divider();
    logger.info(chalk.bold("Findings Summary"));
    logger.blank();

    allIssues.forEach((issue) => {
      const color = issue.severity === "error" ? chalk.red : issue.severity === "warning" ? chalk.yellow : chalk.blue;
      const icon = issue.severity === "error" ? "✖" : issue.severity === "warning" ? "⚠" : "ℹ";
      const location = issue.file ? ` [${issue.file}${issue.line ? `:${issue.line}` : ""}]` : "";
      
      console.log(`  ${color(icon)} ${chalk.bold(issue.script)}: ${issue.message}${chalk.dim(location)}`);
    });
  }

  logger.blank();
  logger.divider();

  const failedCount = results.filter((r) => !r.passed).length;
  if (failedCount === 0) {
    logger.success("All quality gates passed — project is healthy!");
  } else {
    logger.error(`${failedCount} gate(s) failed. Review the findings above.`);
    process.exit(1);
  }

  logger.blank();
}
