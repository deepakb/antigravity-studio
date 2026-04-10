/**
 * Context Manager — Manages .agent/context/ in the developer's active project.
 *
 * Responsibilities:
 *   - init:    Create .agent/context/ files from templates + inject developer profile
 *   - sync:    Re-inject profile if changed, regenerate SKILLS_INDEX
 *   - log:     Append entries to DECISIONS, GOTCHAS, PROJECT_STATE
 *   - status:  Report context health (files present, staleness)
 *
 * Design principles:
 *   - ~/.agstudio/profile.md  is the SOURCE (managed by profile-manager.ts)
 *   - .agent/context/         is the TARGET (what the AI reads in-project)
 *   - .agstudio.json          stores the profile hash for staleness detection
 */

import fs from "fs-extra";
import path from "path";
import { TEMPLATES_DIR, safeCompile, loadRegistry } from "./template-engine.js";
import { readConfig, writeConfig } from "./config-manager.js";
import {
  profileExists,
  readProfileRaw,
  getProfileHash,
  PROFILE_PATH,
} from "./profile-manager.js";
import type { AgStudioConfig } from "../types/config.js";
import type { RegistrySkill } from "../types/registry.js";

// ─── Constants ────────────────────────────────────────────────────────────────

export const CONTEXT_DIR_NAME = "context";

/** All context files, in priority order for status display */
export const CONTEXT_FILES = [
  "DEVELOPER.md",
  "PROJECT_STATE.md",
  "DECISIONS.md",
  "GOTCHAS.md",
  "SKILLS_INDEX.md",
] as const;

export type ContextFile = (typeof CONTEXT_FILES)[number];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContextStatus {
  contextDirExists: boolean;
  files: Array<{
    name: ContextFile;
    exists: boolean;
    lastModified: string | null;
  }>;
  profileSynced: boolean;         // false if profile hash changed since last inject
  profileExists: boolean;
  profilePath: string;
}

export interface LogEntry {
  type: "decision" | "gotcha" | "done" | "next" | "blocked";
  message: string;
}

// ─── Path Helpers ─────────────────────────────────────────────────────────────

export function getContextDir(cwd: string): string {
  return path.join(cwd, ".agent", CONTEXT_DIR_NAME);
}

export function getContextFilePath(cwd: string, file: ContextFile): string {
  return path.join(getContextDir(cwd), file);
}

// ─── Init ─────────────────────────────────────────────────────────────────────

/**
 * Create .agent/context/ in the project, render all template files,
 * inject the developer profile, generate the skills index.
 */
export async function initContext(
  cwd: string,
  force = false
): Promise<{ created: string[]; skipped: string[] }> {
  const contextDir = getContextDir(cwd);
  fs.ensureDirSync(contextDir);

  const config = readConfig(cwd);
  const templateCtx = buildTemplateContext(cwd, config);

  const created: string[] = [];
  const skipped: string[] = [];

  // ── Step 1: Copy & render static template files ────────────────────────────
  const templateContextDir = path.join(TEMPLATES_DIR, ".agent", CONTEXT_DIR_NAME);

  for (const fileName of CONTEXT_FILES) {
    if (fileName === "DEVELOPER.md" || fileName === "SKILLS_INDEX.md") continue; // handled separately

    const srcPath = path.join(templateContextDir, fileName);
    const destPath = path.join(contextDir, fileName);

    if (!force && fs.existsSync(destPath)) {
      skipped.push(fileName);
      continue;
    }

    if (fs.existsSync(srcPath)) {
      const raw = fs.readFileSync(srcPath, "utf-8");
      const rendered = safeCompile(raw, templateCtx);
      fs.writeFileSync(destPath, rendered, "utf-8");
      created.push(fileName);
    }
  }

  // ── Step 2: Inject developer profile into DEVELOPER.md ────────────────────
  const developerMdPath = path.join(contextDir, "DEVELOPER.md");
  if (force || !fs.existsSync(developerMdPath)) {
    await injectProfile(cwd, config);
    created.push("DEVELOPER.md");
  } else {
    skipped.push("DEVELOPER.md");
  }

  // ── Step 3: Generate SKILLS_INDEX.md from installed skills ────────────────
  await generateSkillsIndex(cwd, config);
  created.push("SKILLS_INDEX.md");

  return { created, skipped };
}

// ─── Sync ─────────────────────────────────────────────────────────────────────

/**
 * Re-inject profile if it changed since last sync.
 * Always regenerate SKILLS_INDEX (skills may have been added/removed).
 * Returns whether the profile was re-injected.
 */
export async function syncContext(cwd: string): Promise<{
  profileUpdated: boolean;
  skillsUpdated: boolean;
  stale: boolean;
}> {
  const contextDir = getContextDir(cwd);
  if (!fs.existsSync(contextDir)) {
    throw new Error(
      "Context not initialised. Run `studio context init` first."
    );
  }

  const config = readConfig(cwd);
  const currentHash = await getProfileHash();
  const storedHash = (config as any)?.contextProfileHash ?? null;
  const stale = currentHash !== storedHash;

  let profileUpdated = false;
  if (stale && profileExists()) {
    await injectProfile(cwd, config);
    profileUpdated = true;
  }

  await generateSkillsIndex(cwd, config);

  return { profileUpdated, skillsUpdated: true, stale };
}

// ─── Profile Injection ────────────────────────────────────────────────────────

/**
 * Write ~/.agstudio/profile.md content into .agent/context/DEVELOPER.md
 * and store the profile hash in .agstudio.json for future staleness checks.
 */
async function injectProfile(cwd: string, config: AgStudioConfig | null): Promise<void> {
  const contextDir = getContextDir(cwd);
  const destPath = path.join(contextDir, "DEVELOPER.md");

  if (!profileExists()) {
    // Write placeholder so the AI knows to prompt setup
    const templatePath = path.join(TEMPLATES_DIR, ".agent", CONTEXT_DIR_NAME, "DEVELOPER.md");
    if (fs.existsSync(templatePath)) {
      fs.copyFileSync(templatePath, destPath);
    }
    return;
  }

  const profileContent = readProfileRaw()!;
  fs.ensureDirSync(contextDir);
  fs.writeFileSync(destPath, profileContent, "utf-8");

  // Store hash in .agstudio.json so we can detect future changes
  const hash = await getProfileHash();
  if (config && hash) {
    const updated = { ...config, contextProfileHash: hash } as AgStudioConfig & { contextProfileHash: string };
    await writeConfig(updated, cwd);
  }
}

// ─── Skills Index Generator ───────────────────────────────────────────────────

/**
 * Generate .agent/context/SKILLS_INDEX.md from:
 *   - .agstudio.json (which skills are installed)
 *   - registry.json  (skill names, categories, tokenBudgets)
 *   - packages/templates/.agent/skills/<id>/SKILL.md (descriptions via frontmatter)
 */
export async function generateSkillsIndex(
  cwd: string,
  config: AgStudioConfig | null
): Promise<void> {
  const contextDir = getContextDir(cwd);
  fs.ensureDirSync(contextDir);

  const registry = loadRegistry();
  const installedSkillIds: string[] = config?.installed?.skills ?? [];

  // Build skill rows — only for installed skills
  const installedSkills: RegistrySkill[] = registry.skills.filter((s) =>
    installedSkillIds.includes(s.id)
  );

  const now = new Date().toISOString().split("T")[0]!;

  // Build table rows
  const rows = installedSkills.map((skill) => {
    const budget = skill.tokenBudget ? `~${skill.tokenBudget}t` : "—";
    const description = getSkillDescription(skill.id);
    return `| \`${skill.id}\` | ${skill.name} | ${skill.category} | ${budget} | ${description} |`;
  });

  // Build keyword routing table
  const keywordRows = buildKeywordRouting(installedSkills);

  const content = `# Installed Skills Catalog — ${path.basename(cwd)}
<!-- AUTO-GENERATED by Nexus Studio — DO NOT edit manually.
     Regenerated by: studio context sync | studio add skill | studio remove skill -->

> **AI Instruction**: Read this catalog before every response. When a task
> matches a skill's domain, announce and load that skill:
> \`🤖 Loading skill: [skill-id]...\`
> then apply the patterns from \`.agent/skills/[skill-id]/SKILL.md\`.

---

## Installed Skills (${installedSkills.length} total)

${
  rows.length > 0
    ? `| Skill ID | Name | Category | Token Budget | Description |\n|----------|------|----------|-------------|-------------|\n${rows.join("\n")}`
    : "_No skills installed yet. Run `studio add skill <id>` to add skills._"
}

---

## Skill → Keyword Auto-Routing

> The AI auto-loads these skills when matching keywords appear in a request.
> You can also request explicitly: _"Apply the prisma-orm skill to this problem"_

${
  keywordRows.length > 0
    ? `| Keywords | Auto-loaded Skill |\n|----------|-------------------|\n${keywordRows.join("\n")}`
    : "_No routing rules available yet._"
}

---

*Last generated: ${now} | ${installedSkills.length} of ${registry.skills.length} available skills installed*
*Refresh with \`studio context sync\` after adding or removing skills*
`;

  fs.writeFileSync(path.join(contextDir, "SKILLS_INDEX.md"), content, "utf-8");
}

// ─── Log ──────────────────────────────────────────────────────────────────────

/**
 * Append a structured log entry to the correct context file.
 */
export function appendLogEntry(cwd: string, entry: LogEntry): void {
  const contextDir = getContextDir(cwd);

  if (!fs.existsSync(contextDir)) {
    throw new Error("Context not initialised. Run `studio context init` first.");
  }

  const date = new Date().toISOString().split("T")[0]!;
  const time = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  switch (entry.type) {
    case "decision": {
      const filePath = path.join(contextDir, "DECISIONS.md");
      const block = `\n## [${date}] — ${entry.message}\n- **Date**: ${date}\n- **Status**: ✅ Final\n- **Decision**: ${entry.message}\n- **Why**: _(add reasoning here)_\n- **Why NOT**: _(add rejected alternatives here)_\n`;
      appendToSection(filePath, "## Decisions", block);
      break;
    }

    case "gotcha": {
      const filePath = path.join(contextDir, "GOTCHAS.md");
      const block = `\n## [${date}] — ${entry.message}\n- **Area**: _(specify file or module)_\n- **Problem**: ${entry.message}\n- **Root Cause**: _(add root cause here)_\n- **Fix**: _(add fix or workaround here)_\n`;
      appendToSection(filePath, "## Gotchas", block);
      break;
    }

    case "done": {
      const filePath = path.join(contextDir, "PROJECT_STATE.md");
      appendChecklistItem(filePath, "## Completed ✅", `- [x] ${entry.message} _(${date})_`);
      removeFromSection(filePath, "## In Progress 🔄", entry.message);
      break;
    }

    case "next": {
      const filePath = path.join(contextDir, "PROJECT_STATE.md");
      appendChecklistItem(filePath, "## Not Started 📋", `- [ ] ${entry.message}`);
      break;
    }

    case "blocked": {
      const filePath = path.join(contextDir, "PROJECT_STATE.md");
      appendChecklistItem(filePath, "## Blocked 🔴", `- [ ] ${entry.message} _(${date} ${time})_`);
      break;
    }
  }
}

// ─── Status ───────────────────────────────────────────────────────────────────

/**
 * Return a snapshot of the current context health for the project.
 */
export async function getContextStatus(cwd: string): Promise<ContextStatus> {
  const contextDir = getContextDir(cwd);
  const contextDirExists = fs.existsSync(contextDir);

  const config = readConfig(cwd);
  const currentHash = await getProfileHash();
  const storedHash = (config as any)?.contextProfileHash ?? null;
  const profileSynced = !currentHash || currentHash === storedHash;

  const files = CONTEXT_FILES.map((name) => {
    const filePath = path.join(contextDir, name);
    const exists = contextDirExists && fs.existsSync(filePath);
    let lastModified: string | null = null;
    if (exists) {
      const stat = fs.statSync(filePath);
      lastModified = stat.mtime.toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    }
    return { name, exists, lastModified };
  });

  return {
    contextDirExists,
    files,
    profileSynced,
    profileExists: profileExists(),
    profilePath: PROFILE_PATH,
  };
}

// ─── Private Helpers ──────────────────────────────────────────────────────────

function buildTemplateContext(cwd: string, config: AgStudioConfig | null): Record<string, any> {
  return {
    name: config?.project || path.basename(cwd),
    profile: config?.profile || "custom",
    timestamp: new Date().toISOString().split("T")[0],
    framework: { name: config?.profile || "—" },
  };
}

function getSkillDescription(skillId: string): string {
  const skillMdPath = path.join(TEMPLATES_DIR, ".agent", "skills", skillId, "SKILL.md");
  if (!fs.existsSync(skillMdPath)) return "—";

  const content = fs.readFileSync(skillMdPath, "utf-8");

  // Try to extract from YAML frontmatter description field
  const fmMatch = content.match(/^---[\s\S]*?description:\s*"?([^"\n]+)"?[\s\S]*?---/);
  if (fmMatch?.[1]) return fmMatch[1].trim().slice(0, 80);

  // Fallback: first non-empty line after the heading
  const lines = content.split("\n").filter((l) => l.trim() && !l.startsWith("#") && !l.startsWith("---"));
  return (lines[0] ?? "—").trim().slice(0, 80);
}

/** Static keyword routing map — covers the most common skills */
const SKILL_KEYWORDS: Record<string, string[]> = {
  "nextjs-app-router":        ["next.js", "app router", "rsc", "server component", "server action"],
  "react-patterns":           ["react", "hook", "usestate", "component", "useeffect"],
  "react-performance":        ["react performance", "memo", "usecallback", "usememo", "re-render"],
  "prisma-orm":               ["prisma", "schema", "migration", "orm", "database query"],
  "auth-nextauth":            ["nextauth", "session", "oauth", "auth", "signin"],
  "api-design-restful":       ["api", "rest", "endpoint", "openapi", "route handler"],
  "tailwind-design-system":   ["tailwind", "css", "styling", "design token", "theme"],
  "shadcn-radix-ui":          ["shadcn", "radix", "ui component", "dialog", "select"],
  "vitest-unit-tests":        ["test", "vitest", "unit test", "jest", "coverage"],
  "playwright-e2e":           ["playwright", "e2e", "end-to-end", "browser test"],
  "clean-architecture":       ["clean architecture", "solid", "repository", "use case"],
  "solid-principles":         ["solid", "single responsibility", "open closed", "dependency"],
  "docker-containerization":  ["docker", "container", "dockerfile", "compose"],
  "github-actions-ci-cd":     ["ci/cd", "github actions", "pipeline", "workflow yaml"],
  "rag-implementation":       ["rag", "embeddings", "vector", "retrieval", "llm"],
  "openai-sdk":               ["openai", "gpt", "chatgpt", "completions"],
  "vercel-deployment":        ["vercel", "deploy", "edge function", "vercel.json"],
};

function buildKeywordRouting(installedSkills: RegistrySkill[]): string[] {
  return installedSkills
    .filter((s) => SKILL_KEYWORDS[s.id])
    .map((s) => {
      const keywords = SKILL_KEYWORDS[s.id]!.map((k) => `\`${k}\``).join(", ");
      return `| ${keywords} | \`${s.id}\` |`;
    });
}

/** Append text after a section header line */
function appendToSection(filePath: string, sectionHeader: string, text: string): void {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  const idx = content.indexOf(sectionHeader);
  if (idx === -1) {
    // Section not found — just append at end
    fs.writeFileSync(filePath, content + "\n" + text, "utf-8");
    return;
  }
  // Find the next blank line after "_(No ... yet)_" placeholder and replace
  const before = content.slice(0, idx + sectionHeader.length);
  const after = content.slice(idx + sectionHeader.length);
  // Remove the placeholder line if present
  const cleaned = after.replace(/\n_\(No .+?\)_\n?/, "\n");
  fs.writeFileSync(filePath, before + cleaned + text, "utf-8");
}

/** Append a checklist item to a section, removing placeholder if present */
function appendChecklistItem(filePath: string, sectionHeader: string, item: string): void {
  appendToSection(filePath, sectionHeader, "\n" + item);
}

/** Remove a line containing text from a section */
function removeFromSection(filePath: string, sectionHeader: string, text: string): void {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const filtered = lines.filter(
    (line) => !(line.includes(text) && line.includes("- [ ]"))
  );
  fs.writeFileSync(filePath, filtered.join("\n"), "utf-8");
}
