````markdown
# lighthouse-ci — Lighthouse CI Core Web Vitals Gate

**Tier:** TIER 2 — REQUIRED (blocks on critical failures)
**Applies to:** React+Vite, Next.js frontend profiles
**Not applicable:** Backend-only APIs, mobile apps
**Trigger:** On every PR to main, before production deploy

---

## What This Gate Checks

- **LCP** (Largest Contentful Paint): target < 2.5s
- **INP** (Interaction to Next Paint): target < 200ms
- **CLS** (Cumulative Layout Shift): target < 0.1
- **TTFB** (Time to First Byte): target < 800ms
- **Total Blocking Time**: target < 200ms
- **Lighthouse Performance Score**: target ≥ 85
- **Accessibility Score**: target ≥ 90
- **Best Practices Score**: target ≥ 90
- **SEO Score**: target ≥ 85

---

## Budget Thresholds

| Metric | Pass | Warning | FAIL (block) |
|--------|------|---------|------|
| LCP | < 2.5s | 2.5–4s | > 4s |
| CLS | < 0.1 | 0.1–0.25 | > 0.25 |
| INP | < 200ms | 200–500ms | > 500ms |
| Perf Score | ≥ 85 | 70–84 | < 70 |
| a11y Score | ≥ 90 | 80–89 | < 80 |

---

## Blocking Behavior

| Result | Action |
|--------|--------|
| All scores pass | PASS — CI continues |
| Warning thresholds | WARN — deliver + performance note |
| Critical threshold breached | BLOCK — must fix before merge |

---

## Execution

```
React+Vite / Next.js → bash .agent/scripts/lighthouse-ci/node.sh
```

---

## Fix Guidance

1. **LCP too high**: Preload hero image, use `loading="eager"` on above-fold images, optimize image format (WebP/AVIF)
2. **CLS high**: Reserve space for images (`aspect-ratio`), avoid injecting content above fold, use `font-display: swap`
3. **INP high**: Break up long tasks, use `scheduler.yield()`, defer heavy third-party scripts
4. **Low Performance Score**: Run bundle analyzer, code-split large routes, lazy-load below-fold content
5. **Low a11y Score**: Fix specific audit items in Lighthouse panel — usually missing labels, contrast, or ARIA

````
