import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import { logger } from "../ui/logger.js";
import { readConfig } from "../core/config-manager.js";
import { loadRegistry } from "../core/template-engine.js";
import chalk from "chalk";

interface HealthCheck {
  name: string;
  status: "pass" | "warn" | "fail";
  message: string;
  fix?: string;
}

export async function doctorCommand(cwd: string = process.cwd()): Promise<void> {
  logger.blank();
  logger.section("Antigravity Physician — Workspace Health Check");

  const checks: HealthCheck[] = [];

  // 1. Environment Checks
  try {
    const nodeVersion = process.version;
    const majorVersion = nodeVersion.slice(1).split(".")[0] || "0";
    const major = parseInt(majorVersion);
    if (major < 18) {
      checks.push({
        name: "Node.js Version",
        status: "fail",
        message: `Version ${nodeVersion} detected. Antigravity requires Node.js >= 18.`,
        fix: "Upgrade Node.js at https://nodejs.org"
      });
    } else {
      checks.push({ name: "Node.js Version", status: "pass", message: nodeVersion });
    }
  } catch (e) {
    checks.push({ name: "Node.js Version", status: "fail", message: "Could not determine Node.js version." });
  }

  // 2. Monorepo Config
  const isMonorepo = fs.existsSync(path.join(cwd, "turbo.json")) || fs.existsSync(path.join(cwd, "nx.json"));
  if (isMonorepo) {
    checks.push({ name: "Workspace Type", status: "pass", message: "Monorepo detected (Turborepo/Nx)" });
    
    // Check if turbo is globally available or in dependencies
    try {
      execSync("npx turbo --version", { stdio: "pipe" });
      checks.push({ name: "Turbo CLI", status: "pass", message: "Available via npx" });
    } catch (e) {
      checks.push({
        name: "Turbo CLI",
        status: "warn",
        message: "Turbo not found in path.",
        fix: "Run `npm install -g turbo` or `npm install --save-dev turbo`"
      });
    }
  } else {
    checks.push({ name: "Workspace Type", status: "pass", message: "Standard project" });
  }

  // 3. Project Configuration
  const config = readConfig(cwd);
  if (!config) {
    checks.push({
      name: "Project Config",
      status: "fail",
      message: "No .agstudio.json found.",
      fix: "Run `studio init` to initialize the project."
    });
  } else {
    checks.push({ name: "Project Config", status: "pass", message: `.agstudio.json present (${config.project})` });
    
    // 4. Agent Integrity
    const agentDir = path.join(cwd, ".agent");
    if (!fs.existsSync(agentDir)) {
      checks.push({
        name: "Agent Directory",
        status: "fail",
        message: ".agent directory missing.",
        fix: "Run `studio init --force` to restore core files."
      });
    } else {
      checks.push({ name: "Agent Directory", status: "pass", message: "Present and accessible" });
      
      // Compare with Registry
      const registry = loadRegistry();
      if (registry && Array.isArray(registry.agents)) {
        const invalidAgents = (config.installed?.agents || []).filter(id => {
          return !registry.agents.find((a: { id: string }) => a.id === id);
        });
        if (invalidAgents.length > 0) {
          checks.push({
            name: "Registry Sync",
            status: "warn",
            message: `Installed agents [${invalidAgents.join(", ")}] not found in current registry.`,
            fix: "Run `studio update` to refresh the template library."
          });
        } else {
          checks.push({ name: "Registry Sync", status: "pass", message: "All agents matched in registry" });
        }
      }
    }
  }

  // 5. Build/TS State (Quick check)
  if (fs.existsSync(path.join(cwd, "tsconfig.json"))) {
    checks.push({ name: "TypeScript Config", status: "pass", message: "Found tsconfig.json" });
  } else {
    checks.push({
      name: "TypeScript Config",
      status: "warn",
      message: "No tsconfig.json found at root.",
      fix: "Initialize TypeScript to use full enterprise validation features."
    });
  }

  // Output Results
  logger.blank();
  checks.forEach(check => {
    const icon = check.status === "pass" ? chalk.green("✓") : check.status === "warn" ? chalk.yellow("⚠") : chalk.red("✗");
    const color = check.status === "pass" ? chalk.green : check.status === "warn" ? chalk.yellow : chalk.red;
    
    console.log(`  ${icon} ${chalk.bold(check.name.padEnd(20))} ${chalk.dim("│")} ${check.message}`);
    if (check.fix) {
      console.log(`     ${chalk.blue("→ Fix:")} ${check.fix}`);
    }
  });

  logger.blank();
  logger.divider();

  const issues = checks.filter(c => c.status !== "pass").length;
  if (issues === 0) {
    logger.success("Your workspace is healthy and ready for AI-first development!");
  } else {
    logger.warn(`Found ${issues} potential health issue(s). Review suggestions above.`);
  }
  logger.blank();
}
