# Architecture Decisions — @nexus/web
<!-- ──────────────────────────────────────────────────────────────────────────
  Record every significant architecture or technology decision here.
  Quick log: studio context log decision "chose X over Y because Z"
  Or add entries manually following the format below.

  WHY this matters: The AI reads this before every response. It will NEVER
  suggest an alternative that contradicts a recorded decision here.
──────────────────────────────────────────────────────────────────────────── -->

> **AI Instruction**: Read ALL decisions before making any suggestions.
> Never recommend an approach that contradicts a decision marked ✅ Final.
> If a decision is marked ⚠️ Revisit, you may surface alternatives.

---

## Decision Template

```
## ADR-NNN: [Short Title]
- **Date**: YYYY-MM-DD
- **Status**: ✅ Final | ⚠️ Revisit | ❌ Reversed
- **Decision**: [What was decided]
- **Why**: [The reason — constraints, trade-offs, team preference]
- **Why NOT**: [Alternatives considered and rejected]
- **Consequences**: [What this means for the codebase going forward]
```

---

## Decisions

## ADR-001: React + Vite over Next.js for docs site
- **Date**: 2026-04-10
- **Status**: ✅ Final
- **Decision**: Use React 19 + Vite 6 as the SPA stack for `apps/web`
- **Why**: antigravity-kit already uses Next.js; differentiation proves Nexus works across stacks. Static SPA perfect for GitHub Pages. `react-vite` profile already exists in studio registry — dogfoods the system.
- **Why NOT**: Next.js would duplicate antigravity-kit; SSR adds complexity for a pure docs site.
- **Consequences**: No Server Components, no server-side rendering. All data via React Router v7 loaders or build-time JSON import.

## ADR-002: Registry data via build-time static JSON import
- **Date**: 2026-04-10
- **Status**: ✅ Final
- **Decision**: Import `packages/templates/registry.json` directly as a build-time Vite asset — no runtime fetch.
- **Why**: Zero latency, works offline, no CORS, no API needed. Registry only changes at build time.
- **Why NOT**: Runtime fetch from GitHub raw would mean stale data on cached pages and network dependency.
- **Consequences**: Rebuilding `apps/web` is required when registry changes. This is acceptable — CI handles it.

## ADR-003: Radix UI primitives directly (no shadcn CLI)
- **Date**: 2026-04-10
- **Status**: ✅ Final
- **Decision**: Use `@radix-ui/*` packages directly, not via shadcn CLI.
- **Why**: Direct Radix gives full control over component internals; validates the `shadcn-radix-ui` skill for raw Radix usage (not just shadcn wrapper). shadcn CLI adds opinionated file scaffolding we don't need.
- **Why NOT**: shadcn is faster for initial setup but hides the Radix layer we want to test.
- **Consequences**: We write CVA wrapper components ourselves — validates `ui-component-architect` agent patterns.

---

*Project: @nexus/web | Initialized: 2026-04-10*
