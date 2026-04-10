/**
 * Windsurf (Cascade) IDE config generator
 *
 * Generates:
 *   - .windsurfrules      (project rules — always loaded by Cascade)
 *   - .codeiumignore      (codebase index exclusions)
 */

import fs from "fs-extra";
import path from "path";
import { logger } from "../../ui/logger.js";
import {
  TEMPLATES_DIR,
  buildTemplateCtx,
  writeFile,
  writeFromTemplate,
  type IdeConfigContext,
} from "./types.js";

export function generateWindsurfConfig(cwd: string, ctx: IdeConfigContext): void {
  const { selectedAgents, force = false } = ctx;

  logger.step("Configuring Windsurf (Cascade)...");

  // Build agents object so {{#each agents}} works in the template
  const agentsObj: Record<string, string> = {};
  for (const id of selectedAgents) {
    const agentPath = path.join(cwd, ".agent", "agents", `${id}.md`);
    if (fs.existsSync(agentPath)) {
      agentsObj[id] = fs.readFileSync(agentPath, "utf8");
    }
  }

  // .windsurfrules — Cascade loads this on every interaction
  writeFromTemplate(
    path.join(TEMPLATES_DIR, "windsurf", ".windsurfrules"),
    path.join(cwd, ".windsurfrules"),
    { ...buildTemplateCtx(ctx), agents: agentsObj },
    ".windsurfrules",
    force
  );

  // .codeiumignore — excludes from Windsurf's codebase index
  writeFile(
    path.join(cwd, ".codeiumignore"),
    [
      "# Windsurf (Codeium) — codebase index exclusions",
      "# Excluded files won't be auto-indexed but can still be opened manually",
      "",
      "node_modules/",
      "dist/",
      ".next/",
      "out/",
      "build/",
      ".turbo/",
      "",
      "# Secrets",
      ".env*",
      "secrets/",
      "*.pem",
      "*.key",
      "",
      "# Build artifacts",
      "coverage/",
      "*.lock",
      "*.log",
    ].join("\n") + "\n",
    ".codeiumignore",
    force
  );
}
