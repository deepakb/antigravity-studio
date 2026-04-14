# Architecture Decisions — {{name}}
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

## ADR-004: Publish packages/templates as @nexus/templates npm package
- **Date**: 2026-04-12
- **Status**: ⚠️ TODO — not yet implemented
- **Decision**: Publish `packages/templates/` as its own independently versioned npm package `@nexus/templates`, and declare it as a runtime dependency of `@nexus/studio`.
- **Why**: Currently `apps/studio` needs a build-time `cpSync` (tsup `onSuccess`) to copy `packages/templates/` into `apps/studio/templates/` so that standalone npm installs can find templates. This is a build artifact that must be gitignored and regenerated manually. Publishing `@nexus/templates` separately eliminates the copy entirely — `getTemplatesDir()` would resolve via `require.resolve('@nexus/templates')` from `node_modules`, which works in both the monorepo and standalone installs.
- **Why NOT (today)**: Requires splitting the publish pipeline into two separately versioned packages and setting up a release workflow for `@nexus/templates`. Adds coordination overhead when templates and studio CLI need to ship together.
- **Consequences when done**:
  - Remove `onSuccess` cpSync hook from `apps/studio/tsup.config.ts`
  - Remove Priority 2 path from `getTemplatesDir()` in `template-engine.ts`
  - Remove `"templates"` from `apps/studio/package.json` `files` array
  - `apps/studio/templates/` gitignore entry becomes irrelevant
  - Templates can be updated and published independently of the CLI binary
- **Reference**: `apps/studio/src/core/template-engine.ts` — `getTemplatesDir()` TODO comment
<!-- Nexus Studio will append decisions below via `studio context log decision` -->

_(No decisions recorded yet. Add your first with `studio context log decision "..."`)_

---

*Project: {{name}} | Initialized: {{timestamp}}*
