/**
 * Cross-IDE: AGENTS.md generator
 *
 * Generates root-level AGENTS.md — a cross-IDE convention recognized by
 * Claude Code, GitHub Copilot CLI, and Google Antigravity.
 * This is the entry-point shortcut that references the full .agent/ system.
 */

import path from "path";
import { writeFile, type IdeConfigContext } from "./types.js";

export function generateRootAgentsFile(
  cwd: string,
  ctx: IdeConfigContext
): void {
  // Pure pointer — NO content duplicated from .agent/ here.
  // Agent lists, skill lists, workflow lists, and protocol details all live in
  // .agent/AGENTS.md (source of truth). This file satisfies the cross-IDE
  // boot convention (Claude Code, GitHub Copilot CLI, Google Antigravity) and
  // immediately hands off to .agent/.
  const { projectName, profile, framework, force = false } = ctx;

  const content = [
    `# Agent Instructions — ${projectName}`,
    "",
    `<!-- Cross-IDE bootstrap pointer — DO NOT ADD CONTENT HERE -->`,
    `<!-- Source of truth: .agent/ — never duplicate agent/skill/workflow lists here -->`,
    `<!-- Recognized by: Claude Code, GitHub Copilot CLI, Google Antigravity -->`,
    "",
    "## Project",
    "",
    "| Property | Value |",
    "|----------|-------|",
    `| Name | ${projectName} |`,
    `| Profile | ${profile} |`,
    `| Framework | ${framework.name} |`,
    "",
    "## ⚡ Boot Sequence",
    "",
    "Before doing **anything** — read these files in order:",
    "",
    "1. `.agent/AGENT_SYSTEM.md` — master behavioral directives",
    "2. `.agent/AGENTS.md` — agent routing & coalition patterns",
    "3. `.agent/AGENT_FLOW.md` — 5-stage execution pipeline",
    "",
    "## Why This File Exists",
    "",
    "Claude Code, GitHub Copilot CLI, and Google Antigravity scan the repo root",
    "for `AGENTS.md` as their boot convention. This file satisfies that convention",
    "and immediately hands off to `.agent/` — the single source of truth for all",
    "agent definitions, skills, workflows, and orchestration protocols.",
  ].join("\n") + "\n";

  writeFile(
    path.join(cwd, "AGENTS.md"),
    content,
    "AGENTS.md (cross-IDE pointer)",
    force
  );
}
