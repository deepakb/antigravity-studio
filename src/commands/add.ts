import { copyTemplates } from "../core/template-engine.js";
import { logger } from "../ui/logger.js";

export async function addCommand(type: string, name: string) {
  const validTypes = ["agent", "skill", "workflow", "script"];

  if (!validTypes.includes(type)) {
    logger.error(`Invalid type: ${type}. Use: agent, skill, workflow, script`);
    process.exit(1);
  }

  const includeOptions: { agents?: string[]; skills?: string[]; workflows?: string[]; scripts?: string[] } = {};
  if (type === "agent") includeOptions.agents = [name];
  if (type === "skill") includeOptions.skills = [name];
  if (type === "workflow") includeOptions.workflows = [name];
  if (type === "script") includeOptions.scripts = [name];

  const result = await copyTemplates(process.cwd(), {
    ...(Object.keys(includeOptions).length > 0 ? { include: includeOptions } : {}),
    force: false,
  });

  if (result.copied.length > 0) {
    logger.success(`Successfully added ${type} '${name}' (copied ${result.copied.length} files)`);
  } else if (result.skipped.length > 0) {
    logger.warn(`${type} '${name}' already exists in your .agent folder. Skip or use update command.`);
  } else {
    logger.error(`Could not find a bundled template for ${type} '${name}'.`);
  }
}
