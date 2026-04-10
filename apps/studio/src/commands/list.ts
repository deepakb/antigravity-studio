import { logger } from "../ui/logger.js";
import { loadRegistry } from "../core/template-engine.js";
import { detectProject } from "../core/project-detector.js";
import { loadCompanyConfig } from "../core/enterprise-config.js";
import chalk from "chalk";
import gradient from "gradient-string";
import boxen from "boxen";

export async function listCommand(cwd: string = process.cwd()): Promise<void> {
  const registry = loadRegistry();
  const project = detectProject(cwd);
  const companyConfig = loadCompanyConfig(cwd);
  const requiredSkills = new Set(companyConfig?.requiredSkills ?? []);
  const forbiddenSkills = new Set(companyConfig?.forbiddenSkills ?? []);

  const agents = registry.agents as any[];
  const skills = registry.skills as any[];
  const profiles = Object.entries(registry.profiles as Record<string, any>);
  const slashCommands = (registry.slashCommands as string[]) || [];

  const cyanPink = gradient(["#00DBDE", "#FC00FF"]);
  const gold = gradient(["#FDBB2D", "#22C1C3"]);

  logger.blank();
  process.stdout.write(cyanPink.multiline(
    "  Nexus Registry — Knowledge Discovery\n" +
    "  " + "─".repeat(45) + "\n"
  ));

  // 1. Registry Stats
  console.log(
    boxen(
      `${chalk.bold("Registry Overview")}\n` +
      `  • Profiles:  ${chalk.cyan(String(profiles.length))}\n` +
      `  • AI Agents: ${chalk.cyan(String(agents.length))}\n` +
      `  • Skills:    ${chalk.cyan(String(skills.length))}\n` +
      `  • Shortcuts: ${chalk.cyan(String(slashCommands.length))}` +
      (companyConfig ? `\n  • Company:   ${chalk.yellow(companyConfig.companyName)} (${requiredSkills.size} required)` : ""),
      {
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        margin: { top: 0, bottom: 1 },
        borderStyle: "round",
        borderColor: "dim",
      }
    )
  );

  // 2. Architectural Profiles
  console.log(gold("\n  ◈ Architectural Profiles"));
  profiles.forEach(([id, data]) => {
    const isRecommended = data.hint === "recommended";
    const tag = isRecommended ? chalk.bgYellow.black(" RECOMMENDED ") :
      (id.startsWith("monorepo-") && project.isMonorepo) ? chalk.bgBlue.white(" WORKSPACE ") : "";
    console.log(`    ${chalk.cyan(`[${id}]`).padEnd(30)} ${data.label} ${tag}`);
  });

  // 3. Skills by Category
  console.log(gold("\n  ◈ Available Skills"));
  const skillsByCategory = skills.reduce((acc: Record<string, any[]>, s: any) => {
    if (!acc[s.category]) acc[s.category] = [];
    (acc[s.category] as any[]).push(s);
    return acc;
  }, {});

  Object.entries(skillsByCategory).sort(([a], [b]) => a.localeCompare(b)).forEach(([cat, catSkills]) => {
    console.log(`\n    ${chalk.bold.white(cat.toUpperCase())}`);
    (catSkills as any[]).forEach(s => {
      const requiredBadge  = requiredSkills.has(s.id)  ? chalk.bgGreen.black(" REQUIRED ")  : "";
      const forbiddenBadge = forbiddenSkills.has(s.id) ? chalk.bgRed.white(" FORBIDDEN ") : "";
      const tokenHint = s.tokenBudget ? chalk.dim(` ~${s.tokenBudget}t`) : "";
      console.log(`    ${chalk.cyan(s.id.padEnd(35))} ${s.name}${tokenHint} ${requiredBadge}${forbiddenBadge}`);
    });
  });

  // 4. Specialized AI Agents
  console.log(cyanPink("\n  ◈ Specialized AI Agents"));
  const agentCategories = [...new Set(agents.map((a: any) => a.category as string))].sort();
  agentCategories.forEach(category => {
    console.log(`\n    ${chalk.bold.white(category.toUpperCase())}`);
    agents
      .filter((a: any) => a.category === category)
      .forEach((a: any) => {
        console.log(`    ${chalk.cyan(a.id.padEnd(28))} ${a.name}`);
      });
  });

  // 5. Slash Commands
  if (slashCommands.length > 0) {
    console.log(gold("\n  ◈ Productivity Slash Commands"));
    console.log(`    ${chalk.dim(slashCommands.join("  "))}`);
  }

  logger.blank();
  logger.box(
    `${chalk.bold.white("Enterprise Usage Tips")}\n\n` +
    `  ${chalk.dim("• Add skill:")}      ${chalk.cyan("studio add skill <id>")}\n` +
    `  ${chalk.dim("• Add agent:")}      ${chalk.cyan("studio add agent <id>")}\n` +
    `  ${chalk.dim("• Check drift:")}    ${chalk.cyan("studio sync --check")}\n` +
    `  ${chalk.dim("• Company init:")}   ${chalk.cyan("studio company init <name>")}`,
    { borderColor: "cyan", padding: 1, margin: { top: 1, bottom: 1 } }
  );
}
