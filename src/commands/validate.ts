import { spawnSync } from "child_process";
import path from "path";
import { readConfig } from "../core/config-manager.js";
import { logger } from "../ui/logger.js";
import chalk from "chalk";
import ora from "ora";

interface ValidateOptions {
  skipE2e: boolean;
  fix: boolean;
}

interface CheckResult {
  name: string;
  passed: boolean;
  output?: string;
  skipped?: boolean;
}

function runScript(scriptName: string, cwd: string, args: string[] = []): CheckResult {
  const scriptPath = path.join(cwd, ".agent", "scripts", scriptName);
  const result = spawnSync("npx", ["tsx", scriptPath, cwd, ...args], {
    cwd,
    encoding: "utf-8",
    timeout: 120_000,
  });

  return {
    name: scriptName.replace(".ts", ""),
    passed: result.status === 0,
    output: result.stdout ?? result.stderr ?? "",
  };
}

export async function validateCommand(
  cwd: string = process.cwd(),
  options: Partial<ValidateOptions> = {}
): Promise<void> {
  const config = readConfig(cwd);
  if (!config) {
    logger.error("No .agstudio.json found. Run `studio init` first.");
    process.exit(1);
  }

  const { skipE2e = false, fix = false } = options;

  logger.blank();
  logger.section("Running Enterprise Quality Gates");

  const checks: Array<{ script: string; label: string; isE2e?: boolean }> = [
    { script: "ts-check.ts", label: "TypeScript & ESLint" },
    { script: "type-coverage.ts", label: "Type Coverage" },
    { script: "security-scan.ts", label: "Security Scan" },
    { script: "seo-linter.ts", label: "SEO Linter" },
    { script: "accessibility-audit.ts", label: "Accessibility Audit" },
    { script: "bundle-analyzer.ts", label: "Bundle Size Check" },
    { script: "dependency-audit.ts", label: "Dependency CVE Audit" },
    { script: "verify-all.ts", label: "End-to-End Tests", isE2e: true },
  ];

  const results: CheckResult[] = [];

  for (const check of checks) {
    if (check.isE2e && skipE2e) {
      logger.dim(`  ○ ${check.label} — skipped (--skip-e2e)`);
      results.push({ name: check.script, passed: true, skipped: true });
      continue;
    }

    const spinner = ora(`  Running: ${check.label}...`).start();
    const result = runScript(check.script, cwd, fix ? ["--fix"] : []);
    results.push(result);

    if (result.passed) {
      spinner.succeed(chalk.green(`  ${check.label}`));
    } else {
      spinner.fail(chalk.red(`  ${check.label}`));
      if (result.output) {
        console.log(chalk.dim(result.output.trim().split("\n").slice(0, 5).join("\n")));
      }
    }
  }

  logger.blank();
  logger.divider();

  const failed = results.filter((r) => !r.passed && !r.skipped);
  if (failed.length === 0) {
    logger.success("All quality gates passed — ready to ship!");
  } else {
    logger.error(`${failed.length} check(s) failed. Fix issues before deploying.`);
    process.exit(1);
  }

  logger.blank();
}
