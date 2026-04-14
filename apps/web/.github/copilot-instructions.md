# Nexus Studio — GitHub Copilot Instructions

> This project uses **Nexus Studio** — an enterprise AI agent orchestration system.
> The **authoritative rules** live in `.agent/`. This file is a lean entry point.

## Project: @nexus/web
- **Profile**: `react-vite` | **Framework**: React + Vite
- **Language**: TypeScript (strict — no `any`)

## Agent System — Read These Files First
Before every response, Copilot must read:
- `.agent/AGENT_SYSTEM.md` — operating directives, pipeline, and behavioral rules
- `.agent/AGENTS.md` — auto-routing table (which agent handles which request)
- `.agent/AGENT_FLOW.md` — 5-stage execution pipeline definition
- `.agent/context/PROJECT_STATE.md` — current sprint and what is in progress
- `.agent/context/DECISIONS.md` — architecture decisions (never contradict these)
- `.agent/context/GOTCHAS.md` — known traps (warn before writing code in these areas)

## Non-Negotiable Rules
1. Always define TypeScript types/interfaces **before** implementation
2. Follow the routing table in `.agent/AGENTS.md` — activate the right agent
3. All AI/LLM features **always** activate `@llm-security-officer` as co-reviewer
4. For requests spanning 3+ domains or files: run `/blueprint` first

## Quality Gates
Run before delivering any code:
- studio run ts-check (TIER 1 - TypeScript strict)
- studio run security-scan (TIER 1 - OWASP)
- studio run accessibility-audit (TIER 3 - WCAG 2.2 AA)

## React + Vite SPA Rules
- This is a **client-side SPA** - no Server Components, no server-side rendering
- Data fetching via React Router v7 loader() functions - not raw useEffect
- State: prefer React Router loaders for server data, Zustand for UI state
- No server/ directory - backend concerns handled by a separate API service

## File Conventions
- src/pages/      - React Router page components + loaders
- src/components/ - Reusable UI components (Radix primitives + CVA)
- src/layouts/    - Shared layout wrappers
- src/data/       - Build-time or runtime data access
- src/lib/        - Utilities (cn, formatters, etc.)
- src/hooks/      - Custom React hooks
- src/types/      - Shared TypeScript interfaces
