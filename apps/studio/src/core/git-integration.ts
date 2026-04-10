import { existsSync, readFileSync, mkdirSync } from "fs";
import { appendFile, writeFile } from "fs/promises";
import path from "path";
import { logger } from "../ui/logger.js";
import type { IdeType } from "../types/config.js";

/**
 * Ensures .agent/ is excluded from Git tracking but visible to the IDE.
 */
export async function setupGitExclude(cwd: string = process.cwd()): Promise<void> {
  const gitInfoDir = path.join(cwd, ".git", "info");
  const excludePath = path.join(gitInfoDir, "exclude");

  if (!existsSync(path.join(cwd, ".git"))) {
    logger.warn("No git repository found — skipping git exclude setup.");
    return;
  }

  // Ensure .git/info/ directory exists (may not exist in fresh repos)
  if (!existsSync(gitInfoDir)) {
    mkdirSync(gitInfoDir, { recursive: true });
  }

  const marker = ".agent/";
  let contents = "";

  if (existsSync(excludePath)) {
    contents = readFileSync(excludePath, "utf-8");
  }

  if (contents.includes(marker)) {
    logger.dim(".agent/ already in .git/info/exclude");
    return;
  }

  const entry = `\n# Nexus Studio — local-only, do not track\n.agent/\n.agstudio.json\n`;
  await appendFile(excludePath, entry, "utf-8");
  logger.success("Added .agent/ to .git/info/exclude");
}

/**
 * Warns if .agent/ is in the project's .gitignore (breaks IDE indexing).
 */
export function checkGitignore(cwd: string = process.cwd()): void {
  const gitignorePath = path.join(cwd, ".gitignore");
  if (!existsSync(gitignorePath)) return;
  
  const contents = readFileSync(gitignorePath, "utf-8");
  if (contents.includes(".agent")) {
    logger.warn(
      ".agent/ detected in .gitignore — this WILL break Cursor/Windsurf from indexing agents."
    );
    logger.dim(
      "Solution: remove .agent from .gitignore, then add to .git/info/exclude instead."
    );
  }
}

/**
 * Creates IDE-specific configuration files to inform the AI assistant
 * about the enterprise agent system.
 * 
 * Instead of duplicating the full system prompt, this writes a lightweight
 * pointer to the master .agent/ folder — the single source of truth.
 */
export async function setupIdeConfig(
  ide: IdeType,
  cwd: string = process.cwd()
): Promise<void> {
  // Only create a root-level pointer if .agent/ exists
  const agentDir = path.join(cwd, ".agent");
  if (!existsSync(agentDir)) return;

  const targetPath = path.join(cwd, "AGENT_SYSTEM.md");
  if (!existsSync(targetPath)) {
    const pointer = `# Enterprise AI Agent System\n\n` +
      `> This project is powered by **Nexus Studio**.\n\n` +
      `## Source of Truth\n\n` +
      `All agent definitions, skills, workflows, and orchestration rules live in the \`.agent/\` folder:\n\n` +
      `| File | Purpose |\n|------|---------|\n` +
      `| \`.agent/AGENT_SYSTEM.md\` | Master system prompt & behavioral rules |\n` +
      `| \`.agent/AGENTS.md\` | Agent routing index & coalition patterns |\n` +
      `| \`.agent/AGENT_FLOW.md\` | 5-stage execution pipeline |\n` +
      `| \`.agent/ARCHITECTURE.md\` | Full architecture reference |\n` +
      `| \`.agent/agents/\` | Individual agent personas |\n` +
      `| \`.agent/skills/\` | Domain-specific coding guidelines |\n` +
      `| \`.agent/workflows/\` | Slash-command procedures |\n` +
      `| \`.agent/scripts/\` | Quality gate validation scripts |\n\n` +
      `## Quick Start\n\n` +
      `Run \`studio status\` to see what's installed.\n` +
      `Run \`studio validate\` to run quality gates.\n`;
    await writeFile(targetPath, pointer, "utf-8");
    logger.success("Created AGENT_SYSTEM.md (pointer to .agent/ source of truth)");
  }
}
