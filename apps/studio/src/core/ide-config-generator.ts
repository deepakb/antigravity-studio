/**
 * IDE Config Generator - public facade
 *
 * This module re-exports every public symbol from the ide-generators/ sub-package
 * so that all existing consumers (commands/init.ts, commands/sync.ts, commands/update.ts,
 * and src/index.ts) keep working without any import changes.
 *
 * The actual implementations live in:
 *   ./ide-generators/types.ts        - IdeConfigContext + shared helpers
 *   ./ide-generators/root-agents.ts  - generateRootAgentsFile()
 *   ./ide-generators/cursor.ts       - generateCursorConfig()
 *   ./ide-generators/windsurf.ts     - generateWindsurfConfig()
 *   ./ide-generators/copilot.ts      - generateCopilotConfig()
 *   ./ide-generators/claude.ts       - generateClaudeConfig()
 *
 * Mapping (for reference):
 *   .agent/rules/       -> Cursor: .cursor/rules/*.mdc
 *                       -> Windsurf: .windsurfrules
 *                       -> Copilot: .github/copilot-instructions.md
 *                       -> Claude:  CLAUDE.md
 *   .agent/workflows/   -> Cursor: .cursor/rules/*-workflow.mdc (manual activation)
 *                       -> Copilot: .github/prompts/*.prompt.md
 *                       -> Claude:  .claude/commands/*.md
 *   .agent/agents/      -> Cursor: .cursor/rules/{agent}.mdc (alwaysApply: false)
 *                       -> Claude:  .claude/agents/{agent}.md (with frontmatter)
 *                       -> Copilot: .github/instructions/agents.instructions.md
 *   .agent/mcp/         -> Cursor: .cursor/mcp.json
 *                       -> Copilot: .vscode/mcp.json
 *                       -> Claude:  .mcp.json
 *   (cross-IDE)         -> AGENTS.md (root) - recognized by Claude, Copilot CLI, Antigravity
 */

import { logger } from "../ui/logger.js";
import { generateRootAgentsFile } from "./ide-generators/root-agents.js";
import { generateCursorConfig } from "./ide-generators/cursor.js";
import { generateWindsurfConfig } from "./ide-generators/windsurf.js";
import { generateCopilotConfig } from "./ide-generators/copilot.js";
import { generateClaudeConfig } from "./ide-generators/claude.js";

// --- Re-exports (backward-compatible public API) ----------------------------

export type { IdeConfigContext } from "./ide-generators/types.js";
export { generateRootAgentsFile } from "./ide-generators/root-agents.js";
export { generateCursorConfig } from "./ide-generators/cursor.js";
export { generateWindsurfConfig } from "./ide-generators/windsurf.js";
export { generateCopilotConfig } from "./ide-generators/copilot.js";
export { generateClaudeConfig } from "./ide-generators/claude.js";

// --- Main Orchestrator -------------------------------------------------------

/**
 * Generate all IDE-specific config files from the centralized .agent/ folder.
 * Call this AFTER copyTemplates() has populated .agent/.
 *
 * Always generates AGENTS.md at root (cross-IDE convention).
 * Then generates IDE-specific files for each selected IDE.
 *
 * IDE -> files generated:
 *   cursor    -> .cursor/rules/*.mdc, .cursor/mcp.json, .cursorignore
 *   windsurf  -> .windsurfrules, .codeiumignore
 *   copilot   -> .github/copilot-instructions.md, .github/prompts/*.prompt.md,
 *               .github/instructions/agents.instructions.md,
 *               .vscode/settings.json, .vscode/mcp.json
 *   claude    -> CLAUDE.md, .claude/settings.json, .claude/commands/*.md,
 *               .claude/agents/*.md, .mcp.json
 *   antigravity -> handled by copyTemplates() -- .agent/ IS the config
 */
export async function generateIdeConfigs(
  cwd: string,
  selectedIdes: string[],
  ctx: Parameters<typeof generateRootAgentsFile>[1]
): Promise<void> {
  const ides = selectedIdes.filter(Boolean);
  logger.section(`IDE Configuration (${ides.join(", ")})`);

  // Root AGENTS.md - always generated (cross-IDE convention)
  try {
    generateRootAgentsFile(cwd, ctx);
  } catch (err: unknown) {
    logger.warn(
      `AGENTS.md generation failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  if (ides.includes("cursor")) {
    try {
      generateCursorConfig(cwd, ctx);
    } catch (err: unknown) {
      logger.warn(
        `Cursor config failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  if (ides.includes("windsurf")) {
    try {
      generateWindsurfConfig(cwd, ctx);
    } catch (err: unknown) {
      logger.warn(
        `Windsurf config failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  if (ides.includes("copilot")) {
    try {
      generateCopilotConfig(cwd, ctx);
    } catch (err: unknown) {
      logger.warn(
        `Copilot config failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  if (ides.includes("claude")) {
    try {
      generateClaudeConfig(cwd, ctx);
    } catch (err: unknown) {
      logger.warn(
        `Claude Code config failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  // "antigravity" is handled by copyTemplates() - .agent/ folder IS the Antigravity config
}