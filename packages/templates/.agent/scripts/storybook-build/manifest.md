````markdown
# storybook-build — Storybook Build Integrity Gate

**Tier:** TIER 2 — REQUIRED (blocks on build failure)
**Applies to:** React+Vite, Next.js frontend profiles with Storybook
**Not applicable:** Backend APIs, projects without Storybook
**Trigger:** Every PR — validates Storybook compiles before Chromatic visual tests

---

## What This Gate Checks

- `npm run build-storybook` exits with code 0 (no compilation errors)
- All story imports resolve correctly (no missing component imports)
- All MDX documentation pages compile without errors
- Storybook addon configuration is valid
- No TypeScript errors within story files

---

## Blocking Behavior

| Result | Action |
|--------|--------|
| Build succeeds (exit 0) | PASS — proceed to Chromatic |
| Build fails (exit 1) | BLOCK — fix story compilation errors before merge |
| No Storybook found | SKIP — advisory note only |
| Story file missing import | BLOCK — broken story blocks CI |

---

## Execution

```
Projects with Storybook → bash .agent/scripts/storybook-build/node.sh
```

---

## Common Fix Scenarios

| Error | Fix |
|-------|-----|
| `Cannot find module './Component'` | Verify component file path and named exports |
| `Type error in *.stories.tsx` | Fix Meta/StoryObj types — check `typeof Component` matches |
| `addon not found` | Run `npm install -D @storybook/addon-<name>` |
| `MDX syntax error` | Check MDX file for unclosed JSX tags or invalid frontmatter |
| `Default export is not a valid story` | Ensure `meta` export has `component` property set |

---

## Story Quality Requirements

Every story file MUST have:
1. `export default` with `component` field
2. At least one named story export
3. `tags: ['autodocs']` for component documentation
4. Proper `Meta<typeof Component>` typing

````
