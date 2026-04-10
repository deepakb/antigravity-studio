# Antigravity Studio — GitHub Copilot Instructions

> This repository uses **Antigravity Studio** — an enterprise-grade AI agent orchestration system.
> Full rules are in `.agent/`. This file provides Copilot with essential context.

## Project: {{name}}
- **Profile**: {{profile}} | **Framework**: {{framework.name}}
- **Language**: TypeScript (strict — no `any`)

## Agent System
Before suggesting code, consult:
- `.agent/AGENTS.md` — to understand which agent handles this type of request
- `.agent/AGENT_FLOW.md` — for the execution pipeline protocol
- `.agent/AGENT_SYSTEM.md` — for project-specific behavioral rules

## Code Generation Rules
1. Always define TypeScript types/interfaces before implementation
2. Use established patterns from existing code (repository pattern, service layer)
3. Validate all user inputs with Zod before passing to DB or business logic
4. Check auth inside every route handler — never rely on middleware alone
5. Prefer Server Components; minimize `'use client'` usage
6. All AI/LLM features require security review (prompt injection, PII)

## File Conventions
```
app/          → Next.js App Router pages and layouts
components/   → React components (Server by default)
lib/          → Business logic, repositories, utilities
types/        → Shared TypeScript interfaces
server/       → Server-only code (DB, auth, sensitive operations)
```

## Quality Standards
- TypeScript: strict, no `any`, `exactOptionalPropertyTypes`
- Security: OWASP Top 10, input validation, auth in every handler
- Testing: Vitest + React Testing Library + Playwright
- Accessibility: WCAG 2.2 AA
- Performance: Core Web Vitals targets (LCP < 2.5s, CLS < 0.1)
