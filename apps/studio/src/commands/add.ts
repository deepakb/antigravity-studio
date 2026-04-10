import { copyTemplates } from "../core/template-engine.js";
import { detectProject } from "../core/project-detector.js";
import { readConfig, writeConfig } from "../core/config-manager.js";
import { logger } from "../ui/logger.js";
import { getContextDir, generateSkillsIndex } from "../core/context-manager.js";
import fs from "fs-extra";

export async function addCommand(type: string, id: string) {
  const validTypes = ["agent", "skill", "workflow", "script"];

  if (!validTypes.includes(type)) {
    throw new Error(`Invalid type: "${type}". Must be one of: agent, skill, workflow, script.`);
  }

  // Reject any ID that contains path separators or non-slug characters
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    throw new Error(
      `Invalid id: "${id}". IDs must only contain lowercase letters, digits, and hyphens (e.g. "security-analyst").`
    );
  }

  const cwd = process.cwd();

  // Detect project to build proper Handlebars context
  const projectInfo = detectProject(cwd);
  const config = readConfig(cwd);
  const templateContext = {
    name: config?.project ?? projectInfo.name,
    projectName: config?.project ?? projectInfo.name,
    profile: config?.profile ?? projectInfo.profile,
    framework: {
      name: projectInfo.framework.name ?? 'unknown',
      version: projectInfo.framework.version ?? '',
      language: projectInfo.framework.language ?? 'unknown',
      hasTypeScript: projectInfo.framework.hasTypeScript ?? false,
      hasTailwind: projectInfo.framework.hasTailwind ?? false,
      hasEslint: projectInfo.framework.hasEslint ?? false,
      hasPrisma: projectInfo.framework.hasPrisma ?? false,
      hasTestFramework: projectInfo.framework.hasTestFramework ?? false,
    },
    ide: projectInfo.ide ?? 'unknown',
    timestamp: new Date().toISOString().split('T')[0],
  };

  // Build include options — only copy the specific requested type
  const includeOptions: {
    agents?: string[];
    skills?: string[];
    workflows?: string[];
    scripts?: string[];
  } = {};
  if (type === "agent") includeOptions.agents = [id];
  if (type === "skill") includeOptions.skills = [id];
  if (type === "workflow") includeOptions.workflows = [id];
  if (type === "script") includeOptions.scripts = [id];

  const result = await copyTemplates(cwd, {
    include: includeOptions,
    force: false,
  }, templateContext);

  if (result.copied.length > 0) {
    logger.success(`Successfully added ${type} '${id}' (copied ${result.copied.length} files)`);

    // Sync .agstudio.json
    if (config) {
      const categoryKey = `${type}s` as keyof typeof config.installed;
      if (!config.installed[categoryKey].includes(id)) {
        config.installed[categoryKey].push(id);
      }
      await writeConfig(config, cwd);
    }

    // Auto-refresh SKILLS_INDEX if context is initialised (silent — never breaks add)
    if (type === "skill" && fs.existsSync(getContextDir(cwd))) {
      try {
        await generateSkillsIndex(cwd, readConfig(cwd));
        logger.dim("↳ .agent/context/SKILLS_INDEX.md refreshed");
      } catch {
        // Non-critical — context sync failure must never block skill installation
      }
    }
  } else if (result.skipped.length > 0) {
    logger.warn(`${type} '${id}' already exists in your .agent folder. Skip or use update command.`);
  } else {
    logger.error(`Could not find a bundled template for ${type} '${id}'.`);
  }
}
