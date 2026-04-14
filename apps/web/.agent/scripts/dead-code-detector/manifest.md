````markdown
# dead-code-detector — Unused Code & Export Detector

**Tier:** TIER 3 — ADVISORY (warn, do not block)
**Applies to:** TypeScript projects (React+Vite, Next.js, Angular, Vue)
**Not applicable:** Python, Java, .NET (different tooling required)
**Trigger:** Weekly CI run + before major refactors

---

## What This Gate Checks

- Unused exported functions, classes, and interfaces (via `ts-prune` or `knip`)
- Unused imported files in the module graph
- Unused `dependencies` in `package.json` (vs `devDependencies`)
- Dead CSS classes (unreferenced in component files)
- Components exported but never imported in the app

---

## Budget Thresholds

| Type | Warning | Action |
|------|---------|--------|
| Unused exports | > 10 | List and advise removal |
| Unused imports | > 5 | List and advise cleanup |
| Unused packages | > 3 | List and advise `npm uninstall` |

---

## Blocking Behavior

| Result | Action |
|--------|--------|
| 0–10 unused items | PASS — advisory list only |
| 10+ unused items | WARN — output full list, advise cleanup sprint |
| 50+ unused items | WARN CRITICAL — project accumulating technical debt |

---

## Execution

```
TypeScript project → bash .agent/scripts/dead-code-detector/node.sh
```

---

## Fix Guidance

1. **Unused exports**: Either use the export or remove it. If it's a public API, mark `// @public` to suppress
2. **Unused packages**: `npm uninstall <package>` — verify removal doesn't break anything
3. **Dead CSS**: With Tailwind, PurgeCSS is automatic on build — audit is advisory only
4. **False positives**: Dynamic imports and reflection may appear unused — whitelist in `knip.config.ts`

````
