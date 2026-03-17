import { existsSync, readFileSync } from "fs";
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

  const marker = ".agent/";
  let contents = "";

  if (existsSync(excludePath)) {
    contents = readFileSync(excludePath, "utf-8");
  }

  if (contents.includes(marker)) {
    logger.dim(".agent/ already in .git/info/exclude");
    return;
  }

  const entry = `\n# Antigravity Studio — local-only, do not track\n.agent/\n.agstudio.json\n`;
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
 */
export async function setupIdeConfig(
  ide: IdeType,
  cwd: string = process.cwd()
): Promise<void> {
  const systemPrompt = `You are an enterprise AI engineering assistant powered by the Antigravity Studio agent system.

When responding to requests:
1. Silently analyze the domain (frontend, backend, security, mobile, UX, etc.)
2. Auto-select the most appropriate agent from .agent/agents/
3. Load the relevant skills from .agent/skills/
4. Follow the strict procedures in .agent/workflows/ when a slash command is invoked
5. Before writing any code, state which agent and skills you are applying

Available slash commands: /blueprint /create /enhance /debug /audit-security /refactor-solid /generate-tests /generate-e2e /deploy /perf-audit /a11y-audit /document /orchestrate /preview /status`;

  if (ide === "cursor") {
    await writeFile(path.join(cwd, ".cursorrules"), systemPrompt, "utf-8");
    logger.success("Created .cursorrules for Cursor IDE");
  } else if (ide === "windsurf") {
    await writeFile(path.join(cwd, ".windsurfrules"), systemPrompt, "utf-8");
    logger.success("Created .windsurfrules for Windsurf IDE");
  } else if (ide === "vscode") {
    const copilotInstructions = path.join(cwd, ".github", "copilot-instructions.md");
    await writeFile(copilotInstructions, `# GitHub Copilot Instructions\n\n${systemPrompt}`, "utf-8");
    logger.success("Created .github/copilot-instructions.md for VS Code Copilot");
  } else {
    await writeFile(path.join(cwd, "AGENT_SYSTEM.md"), `# Enterprise AI Agent System\n\n${systemPrompt}`, "utf-8");
    logger.success("Created AGENT_SYSTEM.md (copy-paste into your AI assistant)");
  }
}
