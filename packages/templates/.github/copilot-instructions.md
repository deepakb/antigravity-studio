# Nexus Studio — GitHub Copilot Instructions

> This project uses **Nexus Studio** — an enterprise AI agent orchestration system.
> The **authoritative rules** live in `.agent/`. This file is a lean entry point.

## Project: {{name}}
- **Profile**: `{{profile}}` | **Framework**: {{framework.name}}
- **Language**: TypeScript (strict — no `any`)

## Agent System — Read These Files First
Before every response, Copilot must read:
- `.agent/AGENT_SYSTEM.md` — operating directives, pipeline, and behavioral rules
- `.agent/AGENTS.md` — auto-routing table (which agent handles which request)
- `.agent/AGENT_FLOW.md` — 5-stage execution pipeline definition
- `.agent/context/PROJECT_STATE.md` — current sprint and what's in progress
- `.agent/context/DECISIONS.md` — architecture decisions (never contradict these)
- `.agent/context/GOTCHAS.md` — known traps (warn before writing code in these areas)

## Non-Negotiable Rules
1. Always define TypeScript types/interfaces **before** implementation
2. Follow the routing table in `.agent/AGENTS.md` — activate the right agent
3. All AI/LLM features **always** activate `@llm-security-officer` as co-reviewer
4. For requests spanning 3+ domains or files: run `/blueprint` first

## Quality Gates
Run before delivering any code:
```bash
studio run ts-check        # TIER 1 — TypeScript strict
studio run security-scan   # TIER 1 — OWASP
studio run accessibility-audit  # TIER 3 — WCAG 2.2 AA
```

{{#if (eq profile "nextjs-fullstack")}}
## Next.js Fullstack Rules
- Prefer React Server Components; minimize `'use client'` directives
- Place server-only code in `server/` or `app/api/` — never in components
- Use Server Actions for mutations; validate with Zod before DB operations
- Check auth inside every route handler — never rely on middleware alone

## File Conventions
```
app/          → App Router pages, layouts, route handlers
components/   → React components (Server by default, Client only when needed)
lib/          → Business logic, repositories, utilities
server/       → Server-only: DB access, auth, sensitive operations
types/        → Shared TypeScript interfaces
```
{{/if}}
{{#if (eq profile "nextjs-frontend")}}
## Next.js Frontend Rules
- Prefer React Server Components; minimize `'use client'` directives
- Data fetching in Server Components or route loaders — not `useEffect`

## File Conventions
```
app/          → App Router pages and layouts
components/   → React components (Server by default)
lib/          → Utilities, hooks, helpers
types/        → Shared TypeScript interfaces
```
{{/if}}
{{#if (eq profile "react-vite")}}
## React + Vite SPA Rules
- This is a **client-side SPA** — no Server Components, no server-side rendering
- Data fetching via React Router v7 `loader()` functions or React Query — not raw `useEffect`
- State: prefer React Router loaders for server data, Zustand for UI state
- No `server/` directory — backend concerns are handled by a separate API service

## File Conventions
```
src/pages/      → React Router page components + loaders
src/components/ → Reusable UI components (Radix primitives + CVA)
src/layouts/    → Shared layout wrappers
src/data/       → Build-time or runtime data access
src/lib/        → Utilities (cn, formatters, etc.)
src/hooks/      → Custom React hooks
src/types/      → Shared TypeScript interfaces
```
{{/if}}
{{#if (eq profile "node-api")}}
## Node.js API Rules
- Validate all inputs at the boundary (Zod) before passing to business logic
- Check auth inside every route handler — never rely solely on middleware
- Keep business logic in service layer, not in route handlers

## File Conventions
```
src/routes/   → Route handlers (thin — delegate to services)
src/services/ → Business logic
src/repos/    → Data access layer
src/types/    → Shared TypeScript interfaces
```
{{/if}}
