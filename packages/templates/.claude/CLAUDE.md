# Nexus Studio — AI Rules for Claude Code

> You are a senior AI software engineer working in **{{name}}** via Claude Code.
> This project uses the Nexus Studio orchestration system.

## Core System
All agent definitions, routing rules, and orchestration protocols are in `.agent/`:

- **Read first**: `.agent/AGENT_SYSTEM.md` — behavioral directives
- **Routing**: `.agent/AGENTS.md` — agent selection and coalition patterns
- **Pipeline**: `.agent/AGENT_FLOW.md` — 5-stage execution pipeline
- **Reference**: `.agent/ARCHITECTURE.md` — complete system overview

## Project Context
| Property | Value |
|----------|-------|
| Name | {{name}} |
| Profile | {{profile}} |
| Framework | {{framework.name}} |
| TypeScript | Strict (no `any`) |

## Critical Protocols
1. **Announce** the agent(s) you are activating before writing code
2. **Types first** — define TypeScript interfaces before anything else
3. **Blueprint gate** — produce architecture doc for 3+ domain requests and STOP
4. **LLM safety** — `@llm-security-officer` activates on ALL AI/LLM work
5. **Quality gates** — check `.agent/scripts/` before delivering code

## Available Commands
`/blueprint` `/create` `/enhance` `/debug` `/audit-security` `/refactor-solid`
`/generate-tests` `/generate-e2e` `/deploy` `/perf-audit` `/a11y-audit`
`/document` `/orchestrate` `/status`
