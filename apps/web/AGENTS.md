# Agent Instructions — @nexus/web

<!-- Cross-IDE bootstrap pointer — DO NOT ADD CONTENT HERE -->
<!-- Source of truth: .agent/ — never duplicate agent/skill/workflow lists here -->
<!-- Recognized by: Claude Code, GitHub Copilot CLI, Google Antigravity -->

## Project

| Property | Value |
|----------|-------|
| Name | @nexus/web |
| Profile | react-vite |
| Framework | React + Vite |

## ⚡ Boot Sequence

Before doing **anything** — read these files in order:

1. `.agent/AGENT_SYSTEM.md` — master behavioral directives
2. `.agent/AGENTS.md` — agent routing & coalition patterns
3. `.agent/AGENT_FLOW.md` — 5-stage execution pipeline

## Why This File Exists

Claude Code, GitHub Copilot CLI, and Google Antigravity scan the repo root
for `AGENTS.md` as their boot convention. This file satisfies that convention
and immediately hands off to `.agent/` — the single source of truth for all
agent definitions, skills, workflows, and orchestration protocols.
