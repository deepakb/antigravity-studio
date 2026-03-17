import * as p from "@clack/prompts";
import chalk from "chalk";
import ora from "ora";
import path from "path";
import { loadRegistry, copyTemplates } from "../core/template-engine.js";
import { detectProject } from "../core/project-detector.js";
import { createConfig, writeConfig } from "../core/config-manager.js";
import { setupGitExclude, checkGitignore, setupIdeConfig } from "../core/git-integration.js";
import { printWelcome } from "../ui/banner.js";
import { logger } from "../ui/logger.js";
import type { ProjectProfile } from "../types/config.js";

const registry = loadRegistry();
const ALL_AGENTS = registry.agents.map((a: { id: string }) => a.id);
const PROFILE_AGENTS = Object.fromEntries(
  Object.entries(registry.profiles).map(([key, val]: [string, any]) => [key, val.agents])
) as Record<ProjectProfile, string[]>;
const SLASH_COMMANDS = registry.slashCommands;

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
  const profileOptions = Object.entries(registry.profiles).map(([id, p]: [string, any]) => ({
    value: id,
    label: p.label,
    hint: p.hint,
  }));
  profileOptions.push({ value: "custom", label: "Custom (Choose agents individually)", hint: undefined });

  const profile = await p.select({
    message: "Select installation profile:",
    options: profileOptions as any,
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
      options: ALL_AGENTS.map((a: string) => ({ value: a, label: a })),
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
  }, projectInfo);

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
