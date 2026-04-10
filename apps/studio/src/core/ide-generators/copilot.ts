/**
 * GitHub Copilot (VS Code) config generator
 *
 * Generates:
 *   - .github/copilot-instructions.md           (repository instructions)
 *   - .github/prompts/*.prompt.md               (workflows → reusable prompt files)
 *   - .github/instructions/agents.instructions.md (path-specific agent routing)
 *   - .vscode/settings.json                     (enables instruction files)
 *   - .vscode/mcp.json                          (MCP server config for Copilot)
 */

import fs from "fs-extra";
import path from "path";
import { logger } from "../../ui/logger.js";
import { composeMcp } from "../mcp-composer.js";
import {
  TEMPLATES_DIR,
  buildTemplateCtx,
  parseFrontmatter,
  writeFromTemplate,
  type IdeConfigContext,
} from "./types.js";

export function generateCopilotConfig(cwd: string, ctx: IdeConfigContext): void {
  const { selectedAgents, force = false } = ctx;

  logger.step("Configuring GitHub Copilot...");

  // 1. .github/copilot-instructions.md — repository-level instructions (highest priority)
  writeFromTemplate(
    path.join(TEMPLATES_DIR, ".github", "copilot-instructions.md"),
    path.join(cwd, ".github", "copilot-instructions.md"),
    buildTemplateCtx(ctx),
    ".github/copilot-instructions.md",
    force
  );

  // 2. .github/prompts/*.prompt.md — workflows as reusable Copilot prompt files
  // Copilot prompt file format (as of Feb 2026 GA):
  //   - 'mode' field is DEPRECATED → use 'agent' (values: agent | ask | edit)
  //   - 'codebase' tool RENAMED → 'search/codebase'
  //   - Source workflows already have frontmatter (description etc.) — merge, don't duplicate
  const promptsDir = path.join(cwd, ".github", "prompts");
  fs.ensureDirSync(promptsDir);
  const workflowsDir = path.join(cwd, ".agent", "workflows");
  let promptCount = 0;
  if (fs.existsSync(workflowsDir)) {
    for (const file of fs.readdirSync(workflowsDir).filter((f) => f.endsWith(".md"))) {
      const destPath = path.join(promptsDir, file.replace(".md", ".prompt.md"));
      if (!force && fs.existsSync(destPath)) continue;

      const raw = fs.readFileSync(path.join(workflowsDir, file), "utf8");
      // Parse existing frontmatter from source workflow so we don't duplicate it
      const { data: existingFm, body } = parseFrontmatter(raw);

      // Build correct Copilot frontmatter merged with source workflow metadata
      const fm: Record<string, string> = {
        description: existingFm.description ?? path.basename(file, ".md"),
        agent: "agent",                        // replaces deprecated 'mode: agent'
        tools: "[search/codebase, terminal]",  // 'codebase' renamed to 'search/codebase'
      };
      // Carry over any extra source metadata (agents, skills) if present
      if (existingFm.agents) fm.agents = existingFm.agents;
      if (existingFm.skills) fm.skills = existingFm.skills;

      const fmStr = Object.entries(fm)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
      fs.writeFileSync(destPath, `---\n${fmStr}\n---\n\n${body.trimStart()}`, "utf8");
      promptCount++;
    }
  }
  if (promptCount > 0) {
    logger.success(`.github/prompts/ — ${promptCount} prompt files`);
  }

  // 3. .github/instructions/agents.instructions.md — path-specific agent routing hint
  const instrPath = path.join(
    cwd,
    ".github",
    "instructions",
    "agents.instructions.md"
  );
  if (force || !fs.existsSync(instrPath)) {
    fs.ensureDirSync(path.dirname(instrPath));
    const agentRefs = selectedAgents
      .map((a) => `- \`@${a}\` → \`.agent/agents/${a}.md\``)
      .join("\n");
    const instrContent =
      [
        "---",
        'applyTo: "**/*"',
        "---",
        "",
        "# Nexus Studio — Agent System",
        "",
        "This project uses a multi-agent orchestration system.",
        "Installed agents (read their personas from `.agent/agents/`):",
        "",
        agentRefs,
        "",
        "## Routing",
        "",
        "Consult `.agent/AGENTS.md` to determine which agent to activate.",
        "Follow the 5-stage pipeline defined in `.agent/AGENT_FLOW.md`.",
        "",
        "## Non-Negotiable Rules",
        "",
        "- Always define TypeScript types/interfaces before implementation",
        "- Activate `@llm-security-officer` for ALL AI/LLM-related work",
        "- Run quality gates from `.agent/scripts/` before delivering",
        "- For requests spanning 3+ domains: produce architecture doc first (`/blueprint`)",
      ].join("\n") + "\n";
    fs.writeFileSync(instrPath, instrContent, "utf8");
    logger.success(".github/instructions/agents.instructions.md");
  } else {
    logger.dim("Skipped .github/instructions/agents.instructions.md (already exists)");
  }

  // 4. .vscode/settings.json — enable Copilot instruction files
  const vscodeSettingsPath = path.join(cwd, ".vscode", "settings.json");
  fs.ensureDirSync(path.dirname(vscodeSettingsPath));
  let vscodeSettings: Record<string, unknown> = {};
  if (fs.existsSync(vscodeSettingsPath)) {
    try {
      vscodeSettings = JSON.parse(
        fs.readFileSync(vscodeSettingsPath, "utf8")
      ) as Record<string, unknown>;
    } catch {
      /* keep empty object */
    }
  }
  if (
    vscodeSettings["github.copilot.chat.codeGeneration.useInstructionFiles"] !== true
  ) {
    vscodeSettings["github.copilot.chat.codeGeneration.useInstructionFiles"] = true;
    fs.writeFileSync(
      vscodeSettingsPath,
      JSON.stringify(vscodeSettings, null, 2),
      "utf8"
    );
    logger.success(".vscode/settings.json (Copilot instruction files enabled)");
  }

  // 5. .vscode/mcp.json — MCP server config for VS Code Copilot (servers key + type:stdio)
  composeMcp(
    cwd,
    "vscode",
    ctx.profile,
    path.join(cwd, ".vscode", "mcp.json"),
    ".vscode/mcp.json",
    force
  );
}
