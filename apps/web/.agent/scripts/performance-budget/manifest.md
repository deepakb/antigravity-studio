# performance-budget — Core Web Vitals & Performance Gate

**Tier:** TIER 3 — ADVISORY (warn, do not block)
**Applies to:** Web stacks with public-facing pages (Next.js, Vue/Nuxt, Angular, Django templates)
**Not applicable:** Pure backend APIs, Flutter (use Flutter performance profiler instead)
**Trigger:** After generating pages, after layout changes, after adding above-the-fold content

---

## What This Gate Checks

### Core Web Vitals Targets (Google/EPAM Standard)
| Metric | Good | Needs Work | Poor |
|--------|------|-----------|------|
| LCP (Largest Contentful Paint) | ≤2.5s | 2.5–4s | >4s |
| CLS (Cumulative Layout Shift) | ≤0.1 | 0.1–0.25 | >0.25 |
| INP (Interaction to Next Paint) | ≤200ms | 200–500ms | >500ms |
| FCP (First Contentful Paint) | ≤1.8s | 1.8–3s | >3s |
| TTFB (Time to First Byte) | ≤800ms | 800ms–1.8s | >1.8s |

### Code-Level Checks
- Render-blocking resources in `<head>`
- Images without `width`/`height` (causes CLS)
- Fonts loaded without `font-display: swap`
- No `loading="lazy"` on below-fold images
- Missing `priority` on above-fold Next.js images

---

## Blocking Behavior

| Result | Action |
|--------|--------|
| All metrics Good | PASS |
| Needs Work | Warn developer. Attach recommendations. |
| Poor | Warn + escalate. Flag for performance sprint before production. |

---

## Execution

```
Next.js project   → bash .agent/scripts/performance-budget/node.sh
Other web stack   → bash .agent/scripts/performance-budget/node.sh
```

---

## Fix Guidance

1. **LCP slow**: Preload hero image. Use `priority` on `next/image`. Reduce server response time.
2. **CLS high**: Set explicit `width`/`height` on all images and embeds. Avoid inserting content above existing content.
3. **INP slow**: Break up long tasks. Use `startTransition`. Debounce event handlers.
4. **FCP slow**: Reduce critical CSS. Remove render-blocking scripts. Use `<link rel="preconnect">` for origins.
