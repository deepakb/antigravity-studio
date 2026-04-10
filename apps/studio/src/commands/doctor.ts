import fs from "fs-extra";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { logger } from "../ui/logger.js";
import { readConfig } from "../core/config-manager.js";
import { loadRegistry, TEMPLATES_DIR } from "../core/template-engine.js";
import { loadCompanyConfig, validateCompanyConfig } from "../core/enterprise-config.js";
import chalk from "chalk";
import logSymbols from "log-symbols";
import gradient from "gradient-string";
import boxen from "boxen";

const execFileAsync = promisify(execFile);

interface HealthCheck {
  name: string;
  status: "pass" | "warn" | "fail";
  message: string;
  fix?: string;
  /** Agent IDs affected by this check failure — shown as @agent hints */
  affects?: string[];
}

export async function doctorCommand(cwd: string = process.cwd()): Promise<void> {
  const cyanPink = gradient(["#00DBDE", "#FC00FF"]);
  const gold = gradient(["#FDBB2D", "#22C1C3"]);

  logger.blank();
  process.stdout.write(cyanPink.multiline(
    "  Nexus Physician \u2014 Workspace Health Check\n" +
    "  " + "\u2500".repeat(48) + "\n"
  ));

  const checks = {
    Runtime: [] as HealthCheck[],
    Workspace: [] as HealthCheck[],
    Project: [] as HealthCheck[],
    Enterprise: [] as HealthCheck[],
  };

  // 1. Runtime Checks (Environment)
  try {
    const nodeVersion = process.version;
    const majorVersion = nodeVersion.slice(1).split(".")[0] || "0";
    const major = parseInt(majorVersion);
    if (major < 18) {
      checks.Runtime.push({
        name: "Node.js Version",
        status: "fail",
        message: `Version ${nodeVersion} detected. Requires Node.js >= 18.`,
        fix: "Upgrade Node.js at https://nodejs.org"
      });
    } else {
      checks.Runtime.push({ name: "Node.js Version", status: "pass", message: nodeVersion });
    }
  } catch (e) {
    checks.Runtime.push({ name: "Node.js Version", status: "fail", message: "Could not determine Node.js version." });
  }

  // 2. Workspace Checks (Monorepo/Repo structure)
  const isMonorepo = fs.existsSync(path.join(cwd, "turbo.json")) || fs.existsSync(path.join(cwd, "nx.json"));
  if (isMonorepo) {
    checks.Workspace.push({ name: "Workspace Type", status: "pass", message: "Monorepo detected (Turborepo/Nx)" });
    
    try {
      await execFileAsync("npx", ["turbo", "--version"]);
      checks.Workspace.push({ name: "Turbo CLI", status: "pass", message: "Available via npx" });
    } catch (e) {
      checks.Workspace.push({
        name: "Turbo CLI",
        status: "warn",
        message: "Turbo not found in path.",
        fix: "Run `npm install -dev turbo`"
      });
    }
  } else {
    checks.Workspace.push({ name: "Workspace Type", status: "pass", message: "Standard project" });
  }

  if (fs.existsSync(path.join(cwd, "tsconfig.json"))) {
    checks.Workspace.push({ name: "TypeScript", status: "pass", message: "Found tsconfig.json" });
  } else {
    checks.Workspace.push({
      name: "TypeScript",
      status: "warn",
      message: "No tsconfig.json found at root.",
      fix: "Initialize TypeScript for full feature support.",
      affects: ["tech-lead", "qa-engineer"],
    });
  }

  // 3. Project Checks (Antigravity specifics)
  const config = readConfig(cwd);
  if (!config) {
    checks.Project.push({
      name: "Config File",
      status: "fail",
      message: "No .agstudio.json found.",
      fix: "Run `studio init` to initialize the project."
    });
  } else {
    checks.Project.push({ name: "Config File", status: "pass", message: `.agstudio.json (${config.project})` });
    
    const agentDir = path.join(cwd, ".agent");
    if (!fs.existsSync(agentDir)) {
      checks.Project.push({
        name: "Core Templates",
        status: "fail",
        message: ".agent directory missing.",
        fix: "Run `studio init --force` to restore."
      });
    } else {
      checks.Project.push({ name: "Core Templates", status: "pass", message: "Present and accessible" });
      
      const registry = loadRegistry();
      if (registry && Array.isArray(registry.agents)) {
        const invalidAgents = (config.installed?.agents || []).filter(id => {
          return !registry.agents.find((a: { id: string }) => a.id === id);
        });
        if (invalidAgents.length > 0) {
          checks.Project.push({
            name: "Registry Sync",
            status: "warn",
            message: `${invalidAgents.length} agent(s) not found in registry.`,
            fix: "Run `studio update` to refresh library.",
            affects: invalidAgents,
          });
        } else {
          checks.Project.push({ name: "Registry Sync", status: "pass", message: "All agents matched" });
        }
      }
    }
  }

  // 4. Enterprise Checks
  const companyConfig = loadCompanyConfig(cwd);
  if (!companyConfig) {
    checks.Enterprise.push({
      name: "Company Config",
      status: "warn",
      message: "No .agstudio.company.json found.",
      fix: "Create one to enforce company-wide standards. See: studio sync --check",
      affects: ["enterprise-architect"],
    });
  } else {
    const configIssues = validateCompanyConfig(companyConfig);
    if (configIssues.length > 0) {
      checks.Enterprise.push({
        name: "Company Config",
        status: "fail",
        message: `${configIssues.length} issue(s) in .agstudio.company.json`,
        fix: configIssues[0]!,
        affects: ["enterprise-architect"],
      });
    } else {
      checks.Enterprise.push({
        name: "Company Config",
        status: "pass",
        message: `${companyConfig.companyName} (v${companyConfig.version})`,
      });
    }

    // Check required skills are installed
    if (config && companyConfig.requiredSkills.length > 0) {
      const installed = config.installed?.skills ?? [];
      const missing = companyConfig.requiredSkills.filter((s) => !installed.includes(s));
      if (missing.length > 0) {
        checks.Enterprise.push({
          name: "Required Skills",
          status: "fail",
          message: `${missing.length} company-required skill(s) not installed: ${missing.join(", ")}`,
          fix: "Run `studio sync` to install missing required skills.",
          affects: ["enterprise-architect", "tech-lead"],
        });
      } else {
        checks.Enterprise.push({
          name: "Required Skills",
          status: "pass",
          message: `All ${companyConfig.requiredSkills.length} required skills installed`,
        });
      }
    }

    // Check for forbidden skills
    if (config && companyConfig.forbiddenSkills.length > 0) {
      const installed = config.installed?.skills ?? [];
      const forbidden = companyConfig.forbiddenSkills.filter((s) => installed.includes(s));
      if (forbidden.length > 0) {
        checks.Enterprise.push({
          name: "Forbidden Skills",
          status: "fail",
          message: `Forbidden skill(s) installed: ${forbidden.join(", ")}`,
          fix: "Run `studio remove skill <id>` for each flagged skill.",
          affects: ["enterprise-architect"],
        });
      } else {
        checks.Enterprise.push({
          name: "Forbidden Skills",
          status: "pass",
          message: "No policy violations",
        });
      }
    }
  }

  // 5. Skill file integrity + rough token estimation
  if (config && fs.existsSync(path.join(cwd, ".agent", "skills"))) {
    const installed = config.installed?.skills ?? [];
    let largeSkills: string[] = [];
    let missingFiles: string[] = [];

    for (const skillId of installed) {
      const skillDir = path.join(cwd, ".agent", "skills", skillId);
      const skillFile = path.join(cwd, ".agent", "skills", `${skillId}.md`);
      let content = "";
      if (fs.existsSync(skillFile)) {
        content = fs.readFileSync(skillFile, "utf8");
      } else if (fs.existsSync(skillDir)) {
        const indexMd = path.join(skillDir, "index.md");
        if (fs.existsSync(indexMd)) content = fs.readFileSync(indexMd, "utf8");
      } else {
        missingFiles.push(skillId);
        continue;
      }
      // Rough token estimate: ~4 chars per token
      const estimatedTokens = Math.round(content.length / 4);
      if (estimatedTokens > 4000) {
        largeSkills.push(`${skillId} (~${estimatedTokens.toLocaleString()} tokens)`);
      }
    }

    if (missingFiles.length > 0) {
      checks.Project.push({
        name: "Skill Files",
        status: "warn",
        message: `${missingFiles.length} skill file(s) missing on disk: ${missingFiles.join(", ")}`,
        fix: "Run `studio sync` to restore missing skill files.",
        affects: ["tech-lead", "qa-engineer"],
      });
    } else {
      checks.Project.push({
        name: "Skill Files",
        status: "pass",
        message: `${installed.length} skill file(s) present`,
      });
    }

    if (largeSkills.length > 0) {
      checks.Project.push({
        name: "Token Budget",
        status: "warn",
        message: `${largeSkills.length} skill(s) may exceed IDE context limits`,
        fix: `Large skills: ${largeSkills.join(" | ")}. Consider trimming or splitting.`,
      });
    }
  }

  // Summarize Results
  const allChecks = Object.values(checks).flat();
  const passes = allChecks.filter(c => c.status === "pass").length;
  const warns = allChecks.filter(c => c.status === "warn").length;
  const fails = allChecks.filter(c => c.status === "fail").length;

  console.log(
    boxen(
      `${chalk.bold("Health Summary")}\n` +
      `  • Checks Passed:   ${chalk.green(passes)}\n` +
      `  • Warnings:        ${chalk.yellow(warns)}\n` +
      `  • Failures:        ${chalk.red(fails)}`,
      {
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        margin: { top: 0, bottom: 1 },
        borderStyle: "round",
        borderColor: "dim",
      }
    )
  );

  // Output Categorized Results
  for (const [category, categoryChecks] of Object.entries(checks)) {
    if (categoryChecks.length === 0) continue;

    console.log(gold(`\n  ◈ ${category} Configuration`));
    
    categoryChecks.forEach(check => {
      const symbol = check.status === "pass" ? logSymbols.success : check.status === "warn" ? logSymbols.warning : logSymbols.error;
      const color = check.status === "pass" ? chalk.green : check.status === "warn" ? chalk.yellow : chalk.red;
      
      console.log(`    ${symbol} ${chalk.bold(check.name.padEnd(18))} ${chalk.dim("│")} ${color(check.message)}`);
      if (check.fix) {
        console.log(`       ${chalk.blue("→")} ${chalk.dim("Fix suggestion:")} ${chalk.italic(check.fix)}`);
      }
      if (check.affects && check.affects.length > 0 && check.status !== "pass") {
        const agentList = check.affects.map((a) => chalk.magenta(`@${a}`)).join(", ");
        console.log(`       ${chalk.dim("⎿")}  Affects: ${agentList}`);
      }
    });
  }

  logger.blank();
  const totalIssues = warns + fails;
  
  if (totalIssues === 0) {
    logger.box(
      chalk.bold.green("✓ Your workspace is healthy and ready for AI-first development!"),
      { borderColor: "green", padding: 1 }
    );
  } else {
    logger.box(
      chalk.yellow(`Found ${totalIssues} issue(s) that might need your attention.`) +
      "\n" +
      chalk.dim("Review the fix suggestions above to optimize your development environment."),
      { borderColor: fails > 0 ? "red" : "yellow", padding: 1 }
    );
  }
}
