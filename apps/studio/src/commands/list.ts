import { logger } from "../ui/logger.js";
import { loadRegistry } from "../core/template-engine.js";
import { detectProject } from "../core/project-detector.js";
import chalk from "chalk";

export async function listCommand(cwd: string = process.cwd()): Promise<void> {
  const registry = loadRegistry();
  const project = await detectProject(cwd);

  logger.blank();
  logger.section("Antigravity Registry — Knowledge Discovery");

  // 1. List Profiles
  console.log(chalk.bold.blue("\nArchitectural Profiles:"));
  const profiles = Object.entries(registry.profiles as Record<string, any>);
  profiles.forEach(([id, data]) => {
    const isRecommended = data.hint === "recommended";
    const name = isRecommended ? chalk.yellow(`[${id}]`) : `[${id}]`;
    const label = data.label;
    const recommendedTag = isRecommended ? chalk.bgYellow.black(" RECOMMENDED ") : "";
    
    // Highlight monorepo profiles if applicable
    const isMonorepoProfile = id.startsWith("monorepo-");
    const monoTag = isMonorepoProfile && project.isMonorepo ? chalk.bgBlue.white(" WORKSPACE ") : "";

    console.log(`  ${name.padEnd(25)} ${label} ${recommendedTag}${monoTag}`);
  });

  // 2. List Agents grouped by Category
  console.log(chalk.bold.blue("\nSpecialized AI Agents:"));
  const agents = registry.agents as any[];
  const categories = [...new Set(agents.map(a => a.category))].sort();

  categories.forEach(category => {
    console.log(`\n  ${chalk.underline(category)}:`);
    agents
      .filter(a => a.category === category)
      .forEach(a => {
        console.log(`    - ${chalk.cyan(a.id.padEnd(20))} ${chalk.dim("│")} ${a.name}`);
      });
  });

  // 3. List Slash Commands
  if (registry.slashCommands) {
    console.log(chalk.bold.blue("\nProductivity Slash Commands:"));
    const commands = registry.slashCommands as string[];
    console.log(`  ${chalk.dim(commands.join(", "))}`);
  }

  logger.blank();
  logger.divider();
  console.log(`  Tip: Use ${chalk.cyan("studio add agent <id>")} to install a specific agent.`);
  logger.blank();
}
