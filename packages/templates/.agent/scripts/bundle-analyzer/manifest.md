# bundle-analyzer — JavaScript Bundle Size Check

**Tier:** TIER 3 — ADVISORY (warn, do not block)
**Applies to:** Web stacks only (Node/React/Angular/Vue/Next.js)
**Not applicable:** Python, Java, .NET, Flutter (different performance model)
**Trigger:** After adding new dependencies, after generating large components, after build

---

## What This Gate Checks

- Total bundle size vs budget thresholds
- Large individual chunks (>250kb warning, >500kb error)
- Duplicate modules in bundle
- Non-tree-shakeable imports (e.g., `import _ from 'lodash'` vs `import debounce from 'lodash/debounce'`)
- Images not using next/image or optimized format
- Missing code splitting on route-level components

---

## Budget Thresholds

| Asset | Warning | Critical |
|-------|---------|---------|
| Initial JS bundle | >200kb gzipped | >500kb gzipped |
| Per-route chunk | >100kb | >250kb |
| Total page weight | >1MB | >2MB |
| Single image | >200kb | >500kb |

---

## Blocking Behavior

| Result | Action |
|--------|--------|
| Under budget | PASS — no action |
| Warning threshold | Deliver code + note bundle impact |
| Critical threshold | Deliver code + **strongly recommend optimization before shipping to production** |

---

## Execution

```
Next.js project   → bash .agent/scripts/bundle-analyzer/node.sh
Vite project      → bash .agent/scripts/bundle-analyzer/node.sh
Other web stack   → bash .agent/scripts/bundle-analyzer/node.sh
```

---

## Fix Guidance

1. Use dynamic imports for large components: `const Chart = dynamic(() => import('./Chart'))`
2. Replace full library imports: `import { debounce } from 'lodash-es'` not `import _ from 'lodash'`
3. Move large dependencies to CDN or lazy load
4. Use `next/image` for automatic optimization
5. Enable compression (gzip/brotli) in production build
