````markdown
# animation-budget — Animation Performance Budget Gate

**Tier:** TIER 3 — ADVISORY (warn, do not block)
**Applies to:** React+Vite, Next.js, Angular, Vue frontend profiles
**Not applicable:** Backend-only APIs, CLI tools
**Trigger:** After adding new animation libraries or complex animated components

---

## What This Gate Checks

- GSAP plugin bundle weight (should be tree-shaken)
- Framer Motion bundle contribution (gzipped < 40KB)
- Lottie JSON file sizes (each < 50KB)
- Detection of animation on non-compositor properties (width, height, margin, top, left)
- `prefers-reduced-motion` media query usage in animation code
- Missing `will-change` on actively GPU-animated elements

---

## Budget Thresholds

| Library | Acceptable | Warning | Action |
|---------|-----------|---------|--------|
| Framer Motion (gzipped) | < 40KB | 40–60KB | Consider `motion/react` mini bundle |
| GSAP core (gzipped) | < 25KB | 25–45KB | Ensure tree-shaking plugins |
| Each GSAP plugin | < 15KB | 15–30KB | Only register plugins you use |
| Each Lottie JSON | < 50KB | 50–100KB | Compress at lottiefiles.com |
| Total animation JS | < 80KB | 80–120KB | Audit which libraries to keep |

---

## Blocking Behavior

| Result | Action |
|--------|--------|
| Within budget | PASS — no action |
| Warning threshold | WARN — deliver code + optimization note |
| Critical (> 120KB total) | WARN CRITICAL — strongly advise audit before production |
| Non-compositor properties detected | WARN — list the specific properties causing potential jank |
| No `prefers-reduced-motion` found | WARN — accessibility gap |

---

## Execution

```
All web frontend projects → bash .agent/scripts/animation-budget/node.sh
```

---

## Fix Guidance

1. **Framer Motion too large**: Import from `motion/react` (smaller) instead of `framer-motion` for simple use cases
2. **GSAP plugins not tree-shaken**: Only `gsap.registerPlugin()` the plugins actually used
3. **Lottie JSON too large**: Compress at LottieFiles.com optimizer (usually 40–60% size reduction)
4. **Animating non-compositor properties**: Replace `width` animation with `scaleX`, replace `top`/`left` with `translate`
5. **Missing reduced motion**: Add `useReducedMotion()` from Framer Motion or CSS `@media (prefers-reduced-motion: reduce)`

````
