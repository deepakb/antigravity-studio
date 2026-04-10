import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import crypto from "crypto";
import { logger } from "../ui/logger.js";
import Handlebars from "handlebars";
import type { RegistrySchema } from "../types/registry.js";

// ─── Handlebars Helpers ─────────────────────────────────────────────────────
Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

// ─── Safe Template Compilation ──────────────────────────────────────────────
// Template files (agents, skills, workflows) contain code examples with {{ }}
// syntax (JSX inline styles, GitHub Actions expressions, etc.) that Handlebars
// would wrongly interpret as expressions. This pre-processor protects them.

/** Known Handlebars variable names that should be resolved by the template engine */
const KNOWN_TEMPLATE_VARS = new Set([
  'name', 'projectName', 'profile', 'ide', 'timestamp', 'isMonorepo',
  'framework.name', 'framework.version', 'framework.hasTypeScript',
  'framework.hasTailwind', 'framework.hasEslint', 'framework.hasPrisma',
  'framework.hasTestFramework',
]);

/**
 * Escapes {{ }} patterns that are NOT legitimate Handlebars template expressions.
 * This allows code examples (JSX, GitHub Actions, inline code) to safely coexist
 * with Handlebars variables in the same markdown file.
 *
 * Preserved:  {{name}}, {{framework.name}}, {{#if ...}}, {{/if}}, {{else}}, {{> partial}}, {{{raw}}}
 * Escaped:    style={{ flex: 1 }}, ${{ secrets.TOKEN }}, {{input}}, etc.
 */
function escapeNonTemplateExpressions(content: string): string {
  // Step 1: Protect fenced code blocks entirely — replace {{ with \{{ inside ``` ... ```
  //         This is the safest approach since template variables belong in prose, not code.
  const codeBlockPlaceholders: string[] = [];
  let processed = content.replace(/```[\s\S]*?```/g, (match) => {
    const idx = codeBlockPlaceholders.length;
    codeBlockPlaceholders.push(match.replace(/\{\{/g, '\\{{'));
    return `__CODE_BLOCK_${idx}__`;
  });

  // Step 2: Protect inline code (backtick) — same logic
  const inlineCodePlaceholders: string[] = [];
  processed = processed.replace(/`[^`\n]+`/g, (match) => {
    const idx = inlineCodePlaceholders.length;
    inlineCodePlaceholders.push(match.replace(/\{\{/g, '\\{{'));
    return `__INLINE_CODE_${idx}__`;
  });

  // Step 3: Escape remaining {{ }} that aren't known Handlebars expressions.
  // Regex breakdown: \{\{(\{?)([^}]*?)\}\}(\}?)
  //   Group 1: optional third `{` (triple stash opening)
  //   Group 2: full inner content — includes leading #, /, >, @ chars
  //   Group 3: optional third `}` (triple stash closing)
  // NOTE: The previous regex pre-consumed #/> in the PATTERN so they were
  // never captured in group 2 — this caused {{/if}} to match with inner="if"
  // instead of inner="/if", escaping valid block-close helpers.
  processed = processed.replace(/\{\{(\{?)([^}]*?)\}\}(\}?)/g, (match, openExtra, inner, closeExtra) => {
    const trimmed = inner.trim();

    // Allow triple-stash raw output: {{{this}}}, {{{agents}}}
    if (openExtra === '{' && closeExtra === '}') return match;

    // Allow Handlebars block helpers: {{#if}}, {{#each}}, {{#unless}}, {{/if}}, etc.
    if (trimmed.startsWith('#') || trimmed.startsWith('/') || trimmed === 'else') {
      return match;
    }
    // Allow iteration keys: {{@key}}, {{@index}}
    if (trimmed.startsWith('@')) return match;

    // Allow special values: {{this}}, {{.}}
    if (trimmed === 'this' || trimmed === '.') return match;

    // Allow partial includes: {{> partialName}}
    if (trimmed.startsWith('>')) return match;

    // Allow known template variables
    if (KNOWN_TEMPLATE_VARS.has(trimmed)) return match;

    // Everything else is not a template expression — escape it
    return match.replace(/\{\{/g, '\\{{');
  });

  // Step 4: Restore code blocks and inline code (already escaped)
  for (let i = inlineCodePlaceholders.length - 1; i >= 0; i--) {
    processed = processed.replace(`__INLINE_CODE_${i}__`, inlineCodePlaceholders[i]!);
  }
  for (let i = codeBlockPlaceholders.length - 1; i >= 0; i--) {
    processed = processed.replace(`__CODE_BLOCK_${i}__`, codeBlockPlaceholders[i]!);
  }

  return processed;
}

/**
 * Safely compiles a Handlebars template string, protecting non-template {{ }} patterns.
 * Use this instead of Handlebars.compile() directly for user-facing template files.
 */
export function safeCompile(rawContent: string, context: Record<string, any>): string {
  const escaped = escapeNonTemplateExpressions(rawContent);
  const template = Handlebars.compile(escaped, { noEscape: true });
  return template(context);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Resolves the absolute path to the templates directory.
 *
 * Resolution order (first match wins):
 *   1. packages/templates  — monorepo source of truth (dev + npm-linked)
 *      Path: __dirname(dist/) → ../../../ → monorepo root → packages/templates
 *   2. apps/studio/templates/ — build artifact for standalone published installs
 *      Populated by tsup onSuccess hook from packages/templates at build time.
 *      This path is intentionally .gitignored and should NEVER be edited directly.
 *
 * Why monorepo first: ensures every `studio init` run always uses the latest
 * content from packages/templates without requiring a rebuild after content edits.
 */
function getTemplatesDir(): string {
  // Priority 1: packages/templates — the single source of truth
  // From dist/ (after build): dist/ → ../../../ → antigravity-studio/ → packages/templates
  const monoRepoSrcPath = path.resolve(__dirname, "../../../packages/templates");
  if (fs.existsSync(monoRepoSrcPath)) {
    return monoRepoSrcPath;
  }

  // Priority 1b: tsx dev-mode — __dirname resolves to src/core/ (one level deeper
  // than dist/), so we need one extra "../" to reach the monorepo root.
  // src/core/ → ../../../ → apps/ → ../../../../ → antigravity-studio/ → packages/templates
  const monoRepoSrcPathDev = path.resolve(__dirname, "../../../../packages/templates");
  if (fs.existsSync(monoRepoSrcPathDev)) {
    return monoRepoSrcPathDev;
  }

  // Priority 2: tsup-bundled copy (standalone published install, no monorepo context)
  // From dist/ → ../templates = apps/studio/templates/ (populated by tsup onSuccess)
  const bundledPath = path.resolve(__dirname, "../templates");
  if (fs.existsSync(bundledPath)) {
    return bundledPath;
  }

  throw new Error(
    "[Nexus Studio] Cannot locate templates directory.\n" +
    "  In monorepo: ensure packages/templates/ exists.\n" +
    "  Standalone:  run `npm run build` in apps/studio to populate templates/."
  );
}

/**
 * Resolved absolute path to the bundled templates directory.
 * Exported so CLI commands can reference template file paths directly.
 */
export const TEMPLATES_DIR = getTemplatesDir();

export function loadRegistry(): RegistrySchema {
  const templatesDir = getTemplatesDir();
  const registryPath = path.join(templatesDir, "registry.json");
  if (fs.existsSync(registryPath)) {
    return JSON.parse(fs.readFileSync(registryPath, "utf-8")) as RegistrySchema;
  }
  throw new Error(`Registry not found at ${registryPath}`);
}

interface CopyOptions {
  /** Agents, skills, workflows, or scripts to include (undefined = all) */
  include?: {
    agents?: string[];
    skills?: string[];
    workflows?: string[];
    scripts?: string[];      // which gate folders to include (e.g. ["security-scan", "ts-check"])
    scriptRunners?: string[]; // which stack runners to copy   (e.g. ["node"] or ["python"])
  };
  /** Overwrite existing files */
  force?: boolean;
  /** Preview actions without making changes */
  dryRun?: boolean;
}

export interface CopyResult {
  copied: string[];
  skipped: string[];
  installed: {
    agents: string[];
    skills: string[];
    workflows: string[];
    scripts: string[];
  };
  /**
   * SHA-256 hashes (12-char prefix) of the RAW (pre-compilation) template content,
   * keyed by relative path (e.g. "agents/security-analyst.md").
   * Only populated for files that were actually copied (not skipped).
   * Store these in .agstudio.json#installedHashes for accurate drift detection.
   */
  hashes: Record<string, string>;
}

/**
 * Copies selected templates into the target project's .agent/ folder.
 * Uses Handlebars to inject context into .md and .ts files.
 */
export async function copyTemplates(
  targetDir: string,
  options: CopyOptions = {},
  context: any = {}
): Promise<CopyResult> {
  const templatesDir = getTemplatesDir();
  const srcDir = path.join(templatesDir, ".agent");
  const destDir = path.join(targetDir, ".agent");
  const result: CopyResult = { 
    copied: [], 
    skipped: [],
    installed: { agents: [], skills: [], workflows: [], scripts: [] },
    hashes: {},
  };

  await fs.ensureDir(destDir);

  // Use forward slashes for glob on Windows to be safe
  const globPath = srcDir.replace(/\\/g, "/");
  const allFiles = await glob("**/*", { cwd: globPath, dot: true, nodir: true });

  for (let relPath of allFiles) {
    // Normalize to forward slashes for consistent parsing
    relPath = relPath.replace(/\\/g, "/");

    // Never copy .agent/mcp/ — these are internal studio tooling read by
    // mcp-composer.ts at init time. The IDE-specific outputs (.vscode/mcp.json,
    // .cursor/mcp.json, etc.) are written separately by composeMcp().
    if (relPath.startsWith("mcp/")) continue;

    // Filter by category if include options are set
    if (options.include) {
      const parts = relPath.split("/"); 
      const category = parts[0] ?? "";
      
      const rawName = parts[1] ?? ""; 
      const name = rawName.endsWith(".md") || rawName.endsWith(".ts") 
        ? path.basename(rawName, path.extname(rawName)) 
        : rawName;

      const isAgent = category === "agents";
      const isSkill = category === "skills";
      const isWorkflow = category === "workflows";
      const isScript = category === "scripts";
      const isCategorized = isAgent || isSkill || isWorkflow || isScript;

      // When include is specified, only copy categories that have explicit include lists.
      // Absent categories are treated as "include none" — not "include all".
      if (isCategorized) {
        if (isAgent) {
          if (!options.include.agents || !options.include.agents.includes(name)) continue;
        } else if (isSkill) {
          if (!options.include.skills || !options.include.skills.includes(name)) continue;
        } else if (isWorkflow) {
          if (!options.include.workflows) {
            // Workflows are always included unless explicitly excluded
          } else if (!options.include.workflows.includes(name)) {
            continue;
          }
        } else if (isScript) {
          if (!options.include.scripts) {
            // Scripts are always included unless explicitly excluded
          } else if (!options.include.scripts.includes(name)) {
            continue;
          }

          // ── Shell runner filter ──────────────────────────────────────────
          // parts: ["scripts", "dependency-audit", "node.sh"]
          //                                         ↑ parts[2]
          // manifest.md always passes through.
          // .sh files are gated by scriptRunners — only copy runners for
          // the detected stack (e.g. python project gets python.sh only).
          const scriptFile = parts[2];
          if (options.include.scriptRunners && scriptFile?.endsWith(".sh")) {
            const runner = scriptFile.replace(".sh", ""); // "node" | "python" | "java" | "dotnet" | "flutter"
            if (!options.include.scriptRunners.includes(runner)) continue;
          }
        }
      }
      // Top-level files (AGENT_SYSTEM.md, AGENTS.md, etc.) always pass through
    }

    const srcPath = path.join(srcDir, relPath);
    const destPath = path.join(destDir, relPath);

    // Add to categorized result (track everything we encounter)
    const parts = relPath.split("/");
    const categoryRaw = parts[0] ?? "";
    if (categoryRaw in result.installed) {
      const category = categoryRaw as keyof CopyResult["installed"];
      const rawName = parts[1] ?? "";
      const name = rawName.endsWith(".md") || rawName.endsWith(".ts") 
        ? path.basename(rawName, path.extname(rawName)) 
        : rawName;
      
      if (name && !result.installed[category].includes(name)) {
        result.installed[category].push(name);
      }
    }

    if (!options.force && (await fs.pathExists(destPath))) {
      result.skipped.push(relPath);
      continue;
    }

    if (!options.dryRun) {
      await fs.ensureDir(path.dirname(destPath));
      
      const isTemplate = relPath.endsWith(".md") || relPath.endsWith(".ts") || relPath.endsWith(".json");
      
      if (isTemplate) {
        const rawContent = await fs.readFile(srcPath, "utf-8");
        // Record the raw template hash BEFORE compilation so sync/update can
        // detect upstream drift without comparing compiled content to raw template.
        result.hashes[relPath] = crypto
          .createHash("sha256")
          .update(rawContent)
          .digest("hex")
          .slice(0, 12);
        const compiled = safeCompile(rawContent, context);
        await fs.writeFile(destPath, compiled);
      } else {
        const rawBuffer = await fs.readFile(srcPath);
        result.hashes[relPath] = crypto
          .createHash("sha256")
          .update(rawBuffer)
          .digest("hex")
          .slice(0, 12);
        await fs.copy(srcPath, destPath, { overwrite: options.force ?? false });
      }
    }
    
    result.copied.push(relPath);
  }

  if (!options.dryRun && result.installed.skills.length > 0) {
    const skillsManifestPath = path.join(destDir, "skills.json");
    try {
      await fs.ensureDir(path.dirname(skillsManifestPath));
      await fs.writeJson(skillsManifestPath, {
        project: context?.name ?? context?.projectName ?? "",
        profile: context?.profile ?? "",
        updatedAt: new Date().toISOString(),
        skills: result.installed.skills.map(id => ({
          id,
          path: `./skills/${id}`
        }))
      }, { spaces: 2 });
    } catch (e) {
      console.error("Failed to write skills manifest:", e);
    }
  }

  return result;
}

/**
 * Removes stale shell runners and out-of-profile gate folders from .agent/scripts/.
 *
 * Called after copyTemplates() during `studio init --force` so that a project that
 * previously had all runners cleaned up to only the runners for the new profile.
 *
 * @param targetDir  Project root (contains .agent/)
 * @param keepRunners  Stack runners to KEEP  e.g. ["python"]
 * @param keepGates    Gate folders to KEEP   e.g. ["security-scan", "ts-check"] (null = keep all)
 * @returns List of removed relative paths
 */
export async function cleanupStaleScriptRunners(
  targetDir: string,
  keepRunners: string[],
  keepGates: string[] | null = null
): Promise<string[]> {
  const scriptsDir = path.join(targetDir, ".agent", "scripts");
  if (!(await fs.pathExists(scriptsDir))) return [];

  const removed: string[] = [];
  const gateDirs = await fs.readdir(scriptsDir);

  for (const gate of gateDirs) {
    const gateDir = path.join(scriptsDir, gate);
    const stat = await fs.stat(gateDir);
    if (!stat.isDirectory()) continue;

    // Remove entire gate folder if not in the profile's scriptGates
    if (keepGates && !keepGates.includes(gate)) {
      await fs.remove(gateDir);
      removed.push(`scripts/${gate}/`);
      continue;
    }

    // Remove individual .sh runners that don't belong to this stack
    const files = await fs.readdir(gateDir);
    for (const file of files) {
      if (!file.endsWith(".sh")) continue;
      const runner = file.replace(".sh", ""); // "node" | "python" | "java" | "dotnet" | "flutter"
      if (!keepRunners.includes(runner)) {
        await fs.remove(path.join(gateDir, file));
        removed.push(`scripts/${gate}/${file}`);
      }
    }
  }

  return removed;
}

export async function removeTemplate(
  targetDir: string,
  category: "agents" | "skills" | "workflows" | "scripts",
  name: string
): Promise<void> {
  const agentDir = path.join(targetDir, ".agent", category);
  
  // Look for both the direct file (.md/.ts) or the folder (for skills)
  const fileTarget = path.join(agentDir, `${name}.md`);
  const scriptTarget = path.join(agentDir, `${name}.ts`);
  const folderTarget = path.join(agentDir, name);

  let removed = false;

  if (await fs.pathExists(fileTarget)) {
    await fs.remove(fileTarget);
    logger.success(`Removed ${category}/${name}.md`);
    removed = true;
  }
  
  if (await fs.pathExists(scriptTarget)) {
    await fs.remove(scriptTarget);
    logger.success(`Removed ${category}/${name}.ts`);
    removed = true;
  }
  
  if (await fs.pathExists(folderTarget) && (await fs.stat(folderTarget)).isDirectory()) {
    await fs.remove(folderTarget);
    logger.success(`Removed ${category}/${name}/`);
    removed = true;
  }

  if (!removed) {
    logger.warn(`Could not find ${name} in ${category}`);
  }
}
