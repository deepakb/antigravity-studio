/**
 * Cursor IDE config generator
 *
 * Generates:
 *   - .cursor/rules/antigravity-system.mdc  (main system rules, alwaysApply: true)
 *   - .cursor/rules/{agent}.mdc             (per-agent, alwaysApply: false)
 *   - .cursor/mcp.json                      (from .agent/mcp/servers.json)
 *   - .cursorignore                         (context exclusions)
 */

import fs from "fs-extra";
import path from "path";
import { logger } from "../../ui/logger.js";
import { composeMcp } from "../mcp-composer.js";
import {
  TEMPLATES_DIR,
  buildTemplateCtx,
  parseFrontmatter,
  writeFile,
  writeFromTemplate,
  type IdeConfigContext,
} from "./types.js";

export function generateCursorConfig(cwd: string, ctx: IdeConfigContext): void {
  const { selectedAgents, force = false } = ctx;

  logger.step("Configuring Cursor...");

  // 1. Main system rules (alwaysApply: true) — from template
  writeFromTemplate(
    path.join(TEMPLATES_DIR, ".cursor", "rules", "cursor.mdc"),
    path.join(cwd, ".cursor", "rules", "antigravity-system.mdc"),
    buildTemplateCtx(ctx),
    ".cursor/rules/antigravity-system.mdc",
    force
  );

  // 2. Per-agent .mdc rules (alwaysApply: false) — reference .agent/ as source of truth
  const rulesDir = path.join(cwd, ".cursor", "rules");
  fs.ensureDirSync(rulesDir);
  let agentCount = 0;
  for (const agentId of selectedAgents) {
    const agentSrc = path.join(cwd, ".agent", "agents", `${agentId}.md`);
    if (!fs.existsSync(agentSrc)) continue;
    const mdcDest = path.join(rulesDir, `${agentId}.mdc`);
    if (!force && fs.existsSync(mdcDest)) continue;

    const agentContent = fs.readFileSync(agentSrc, "utf8");
    // Parse agent frontmatter (name/description) if present
    const { data: agentMeta, body: agentBody } = parseFrontmatter(agentContent);
    const mdcDescription =
      agentMeta.description ??
      `${agentId.replace(/-/g, " ")} specialist — activate when working on related tasks`;

    const mdcContent = [
      "---",
      `description: ${mdcDescription}`,
      "globs: **/*",
      "alwaysApply: false",
      "---",
      "",
      agentBody,
    ].join("\n");
    fs.writeFileSync(mdcDest, mdcContent, "utf8");
    agentCount++;
  }
  if (agentCount > 0) {
    logger.success(`.cursor/rules/ — ${agentCount} agent rule files`);
  }

  // 3. MCP config — composed per IDE format (mcpServers key, no type field)
  composeMcp(
    cwd,
    "cursor",
    ctx.profile,
    path.join(cwd, ".cursor", "mcp.json"),
    ".cursor/mcp.json",
    force
  );

  // 4. .cursorignore — excludes files from AI context entirely
  writeFile(
    path.join(cwd, ".cursorignore"),
    [
      "# Cursor AI — context exclusions",
      "# Files listed here are INVISIBLE to the AI (cannot access even with @mention)",
      "# Use .cursorindexignore for files you want excluded from auto-index but accessible via @",
      "",
      "node_modules/",
      "dist/",
      ".next/",
      "out/",
      "build/",
      ".turbo/",
      "",
      "# Secrets — never accessible to AI",
      ".env",
      ".env.*",
      "secrets/",
      "*.key",
      "*.pem",
      "",
      "# Build artifacts",
      "coverage/",
      "*.lock",
      "*.log",
    ].join("\n") + "\n",
    ".cursorignore",
    force
  );
}
