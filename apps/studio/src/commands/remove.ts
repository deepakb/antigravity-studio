import { removeTemplate } from "../core/template-engine.js";
import { readConfig, writeConfig } from "../core/config-manager.js";
import { logger } from "../ui/logger.js";
import { getContextDir, generateSkillsIndex } from "../core/context-manager.js";
import fs from "fs-extra";

export async function removeCommand(type: string, id: string) {
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

  // Reject any ID that contains path separators or non-slug characters
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    logger.error(
      `Invalid id: "${id}". IDs must only contain lowercase letters, digits, and hyphens.`
    );
    process.exit(1);
  }

  const cwd = process.cwd();
  await removeTemplate(cwd, category, id);

  // Sync .agstudio.json — remove the ID from installed list
  const config = readConfig(cwd);
  if (config) {
    config.installed[category] = config.installed[category].filter((item: string) => item !== id);
    await writeConfig(config, cwd);
    logger.dim(`Updated .agstudio.json`);
  }

  // Auto-refresh SKILLS_INDEX if context is initialised (silent — never breaks remove)
  if (type === "skill" && fs.existsSync(getContextDir(cwd))) {
    try {
      await generateSkillsIndex(cwd, readConfig(cwd));
      logger.dim("↳ .agent/context/SKILLS_INDEX.md refreshed");
    } catch {
      // Non-critical — context sync failure must never block skill removal
    }
  }
}
