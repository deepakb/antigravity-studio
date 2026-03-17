import { removeTemplate } from "../core/template-engine.js";
import { logger } from "../ui/logger.js";

export async function removeCommand(type: string, name: string) {
  const typeMap: Record<string, "agents" | "skills" | "workflows" | "scripts"> = {
    agent: "agents",
    skill: "skills",
    workflow: "workflows",
    script: "scripts",
  };

  const category = typeMap[type];

  if (!category) {
    logger.error(`Invalid type: ${type}. Use: agent, skill, workflow, script`);
    process.exit(1);
  }

  await removeTemplate(process.cwd(), category, name);
}
