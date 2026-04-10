/**
 * Shared types and private helper utilities used by all IDE config generators.
 *
 * This module is internal to the ide-generators/ sub-package.
 * External consumers should import from the public facade:
 *   import { IdeConfigContext } from "../ide-config-generator.js"
 */

import fs from "fs-extra";
import path from "path";
import { logger } from "../../ui/logger.js";
import { TEMPLATES_DIR, safeCompile } from "../template-engine.js";

export { TEMPLATES_DIR };

// ─── Public Types ─────────────────────────────────────────────────────────────

export interface IdeConfigContext {
  projectName: string;
  profile: string;
  framework: {
    name: string;
    version?: string;
    hasTypeScript: boolean;
    hasTailwind?: boolean;
    hasEslint?: boolean;
    hasPrisma?: boolean;
    hasTestFramework?: boolean;
  };
  selectedAgents: string[];
  selectedSkills: string[];
  force?: boolean;
}

// ─── Private Helpers ─────────────────────────────────────────────────────────

/** Write raw content to a file, skipping if it exists (unless force). */
export function writeFile(
  destPath: string,
  content: string,
  label: string,
  force: boolean
): void {
  if (!force && fs.existsSync(destPath)) {
    logger.dim(`Skipped ${label} (already exists)`);
    return;
  }
  fs.ensureDirSync(path.dirname(destPath));
  fs.writeFileSync(destPath, content, "utf8");
  logger.success(`Created ${label}`);
}

/**
 * Parse YAML frontmatter from a markdown string.
 * Returns the key-value pairs and the body content after the closing ---.
 * If no frontmatter is found, data is {} and body is the full content.
 */
export function parseFrontmatter(content: string): {
  data: Record<string, string>;
  body: string;
} {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: content };
  const data: Record<string, string> = {};
  for (const line of (match[1] ?? "").split(/\r?\n/)) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const val = line
        .slice(colonIdx + 1)
        .trim()
        .replace(/^"|"$/g, "")
        .replace(/^'|'$/g, "");
      if (key) data[key] = val;
    }
  }
  return { data, body: match[2] ?? "" };
}

/** Render a Handlebars template file and write to destination. */
export function writeFromTemplate(
  templatePath: string,
  destPath: string,
  ctx: Record<string, unknown>,
  label: string,
  force: boolean
): void {
  if (!fs.existsSync(templatePath)) {
    logger.warn(
      `Template not found — skipping ${label} (expected: ${templatePath})`
    );
    return;
  }
  if (!force && fs.existsSync(destPath)) {
    logger.dim(
      `Skipped ${label} (already exists, use --force to overwrite)`
    );
    return;
  }
  try {
    const raw = fs.readFileSync(templatePath, "utf8");
    const rendered = safeCompile(raw, ctx);
    fs.ensureDirSync(path.dirname(destPath));
    fs.writeFileSync(destPath, rendered, "utf8");
    logger.success(`Created ${label}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(`Failed to write ${label}: ${msg}`);
  }
}

/**
 * @deprecated Use `composeMcp()` from `../mcp-composer.js` instead.
 * This legacy helper does a flat file copy with no IDE format transformation.
 * It remains here only for external backward compatibility — all internal IDE
 * generators (cursor, copilot, claude) now use the composeMcp() system.
 */
export function copyMcp(
  agentMcpPath: string,
  destPath: string,
  label: string,
  force: boolean
): void {
  if (!fs.existsSync(agentMcpPath)) return;
  if (!force && fs.existsSync(destPath)) {
    logger.dim(`Skipped ${label} (already exists)`);
    return;
  }
  fs.ensureDirSync(path.dirname(destPath));
  fs.copyFileSync(agentMcpPath, destPath);
  logger.success(`Mapped MCP → ${label}`);
}

/** Build a shared Handlebars template context from IDE config context. */
export function buildTemplateCtx(ctx: IdeConfigContext): Record<string, unknown> {
  return {
    name: ctx.projectName,
    projectName: ctx.projectName,
    profile: ctx.profile,
    framework: ctx.framework,
    timestamp: new Date().toISOString().split("T")[0],
    isMonorepo: false,
  };
}
