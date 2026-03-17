import * as p from "@clack/prompts";
import chalk from "chalk";
import ora from "ora";
import path from "path";
import { detectProject } from "../core/project-detector.js";
import { copyTemplates } from "../core/template-engine.js";
import { createConfig, writeConfig } from "../core/config-manager.js";
import { setupGitExclude, checkGitignore, setupIdeConfig } from "../core/git-integration.js";
import { printWelcome } from "../ui/banner.js";
import { logger } from "../ui/logger.js";
import type { ProjectProfile } from "../types/config.js";

// All available agents in the bundle
const ALL_AGENTS = [
  "enterprise-architect",
  "tech-lead",
  "nextjs-expert",
  "react-performance-guru",
  "frontend-specialist",
  "ui-component-architect",
  "ux-designer",
  "ui-design-engineer",
  "accessibility-auditor",
  "backend-specialist",
  "api-architect",
  "database-engineer",
  "data-layer-specialist",
  "security-engineer",
  "penetration-tester",
  "rn-architect",
  "rn-performance-expert",
  "mobile-ux-designer",
  "qa-engineer",
  "devops-engineer",
  "debugger",
  "seo-specialist",
  "orchestrator",
  "product-manager",
  "project-planner",
];

// Profile-to-agent mapping (preselected agents per profile)
const PROFILE_AGENTS: Record<ProjectProfile, string[]> = {
  "nextjs-fullstack": [
    "enterprise-architect", "nextjs-expert", "react-performance-guru",
    "frontend-specialist", "ui-component-architect", "backend-specialist",
    "api-architect", "database-engineer", "security-engineer",
    "qa-engineer", "devops-engineer", "debugger", "seo-specialist",
    "orchestrator", "product-manager",
  ],
  "nextjs-frontend": [
    "nextjs-expert", "react-performance-guru", "frontend-specialist",
    "ui-component-architect", "ux-designer", "ui-design-engineer",
    "accessibility-auditor", "qa-engineer", "debugger", "seo-specialist",
  ],
  "expo-mobile": [
    "rn-architect", "rn-performance-expert", "mobile-ux-designer",
    "frontend-specialist", "backend-specialist", "security-engineer",
    "qa-engineer", "devops-engineer", "debugger",
  ],
  "react-vite": [
    "frontend-specialist", "react-performance-guru", "ui-component-architect",
    "ux-designer", "qa-engineer", "debugger",
  ],
  "node-api": [
    "backend-specialist", "api-architect", "database-engineer",
    "security-engineer", "devops-engineer", "debugger", "product-manager",
  ],
  "monorepo": [
    "enterprise-architect", "tech-lead", "orchestrator", "devops-engineer",
    "nextjs-expert", "backend-specialist", "security-engineer", "qa-engineer",
  ],
  "custom": ALL_AGENTS,
};

const SLASH_COMMANDS = [
  "/blueprint", "/create", "/enhance", "/debug",
  "/audit-security", "/refactor-solid", "/generate-tests",
  "/generate-e2e", "/deploy", "/perf-audit", "/a11y-audit",
  "/document", "/orchestrate", "/preview", "/status",
];

export async function initCommand(cwd: string = process.cwd()): Promise<void> {
  p.intro(chalk.bold.cyan("Antigravity Studio — Enterprise AI Agent Toolkit"));

  // Step 1: Detect project
  const spinner = ora("Detecting your project...").start();
  const projectInfo = await detectProject(cwd);
  spinner.succeed(
    `${chalk.cyan(projectInfo.framework.name)} detected (${projectInfo.profile})`
  );

  checkGitignore(cwd);

  // Step 2: Confirm project name
  const projectName = await p.text({
    message: "What is your project name?",
    defaultValue: projectInfo.name,
    placeholder: projectInfo.name,
  });

  if (p.isCancel(projectName)) {
    p.cancel("Installation cancelled.");
    process.exit(0);
  }

  // Step 3: Choose installation profile
  const profile = await p.select({
    message: "Select installation profile:",
    options: [
      { value: "nextjs-fullstack", label: "Full Stack (Next.js + Backend + DB)", hint: "recommended" },
      { value: "nextjs-frontend", label: "Frontend Only (React/Next.js)" },
      { value: "expo-mobile", label: "Mobile (React Native / Expo)" },
      { value: "node-api", label: "Backend API (Node.js)" },
      { value: "monorepo", label: "Monorepo (Turborepo / Nx)" },
      { value: "custom", label: "Custom (Choose agents individually)" },
    ],
    initialValue: projectInfo.profile as ProjectProfile,
  });

  if (p.isCancel(profile)) {
    p.cancel("Installation cancelled.");
    process.exit(0);
  }

  // Step 4: Select agents (multi-select if custom, otherwise use preset)
  let selectedAgents: string[];

  if (profile === "custom") {
    const chosen = await p.multiselect({
      message: "Which agents would you like to install?",
      options: ALL_AGENTS.map((a) => ({ value: a, label: a })),
      initialValues: PROFILE_AGENTS["nextjs-fullstack"],
      required: true,
    });

    if (p.isCancel(chosen)) {
      p.cancel("Installation cancelled.");
      process.exit(0);
    }
    selectedAgents = chosen as string[];
  } else {
    selectedAgents = PROFILE_AGENTS[profile as ProjectProfile] ?? ALL_AGENTS;
    logger.dim(`Pre-selecting ${selectedAgents.length} agents for ${profile} profile`);
  }

  // Step 5: Telemetry opt-in
  const telemetry = await p.confirm({
    message: "Help improve Antigravity Studio? (anonymous usage data only)",
    initialValue: false,
  });

  if (p.isCancel(telemetry)) {
    p.cancel("Installation cancelled.");
    process.exit(0);
  }

  // Step 6: Install templates
  const installSpinner = ora(`Installing ${selectedAgents.length} agents, skills, and workflows...`).start();

  const result = await copyTemplates(cwd, {
    include: { agents: selectedAgents },
  });

  installSpinner.succeed(
    `${result.copied.length} files installed${result.skipped.length > 0 ? `, ${result.skipped.length} skipped (already exist)` : ""}`
  );

  // Step 7: Git setup
  await setupGitExclude(cwd);

  // Step 8: IDE config
  await setupIdeConfig(projectInfo.ide, cwd);

  // Step 9: Write config
  const config = createConfig(
    String(projectName),
    profile as ProjectProfile,
    result.installed,
    Boolean(telemetry)
  );
  await writeConfig(config, cwd);
  logger.success("Created .agstudio.json");

  // Success
  p.outro(chalk.bold.green("Your enterprise AI toolkit is ready!"));
  printWelcome(String(projectName), SLASH_COMMANDS);
}
