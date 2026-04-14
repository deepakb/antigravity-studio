---
description: motion-audit — measurement-driven animation quality audit covering performance profiling, jank detection, reduced motion compliance, and motion design review for React+Vite SPAs
agent: agent
tools: [search/codebase, terminal]
---

# /motion-audit Workflow

> **Purpose**: Diagnose and fix animation quality issues through measurement-first analysis. Covers 60fps profiling, jank detection, reduced-motion accessibility compliance, animation budget audit, and creative direction review of motion choreography.

## 🤖 Activation
```
🤖 Applying @motion-designer + @react-performance-guru + @creative-director
   Loading: gsap-animations, framer-motion, micro-interactions,
            lottie-animations, react-performance skills...
```

---

## 🎯 Motion Quality Targets

| Metric | Target | Tool |
|--------|--------|------|
| Frame rate | 60fps (120fps on ProMotion) | Chrome DevTools → Rendering |
| Paint time | < 2ms per frame | Chrome → Layers |
| Layout recalculation | 0 during animations | Chrome → Performance |
| Animation JS total | < 80KB gzipped | `animation-budget` gate |
| Reduced motion support | 100% of animations | `animation-budget` gate |
| Lottie JSON per file | < 50KB | Manual check |

---

## Phase 1: Establish Animation Baseline

```bash
# Run animation budget gate
studio run animation-budget

# Chrome DevTools — Performance Profile
# 1. Open DevTools → Performance
# 2. Enable CPU throttling: 4x slowdown (simulates mid-range mobile)
# 3. Record 5 seconds of animated interaction
# 4. Check: Long tasks > 50ms, Paint storms, Layout shifts during animation
```

**Baseline record:**
```
📊 ANIMATION BASELINE
  Frame rate (desktop):   [N] fps
  Frame rate (4x CPU):    [N] fps
  Heaviest animation:     [component name] — [N]ms paint
  Reduced motion support: [N/total] animations
  Animation JS budget:    [N]KB gzipped
  Lottie files:           [N] files, largest [N]KB
```

---

## Phase 2: Jank Detection & Root Cause

### Common Jank Causes (ordered by frequency):

**1. Animating non-compositor properties:**
```bash
# Detect in codebase
grep -r --include="*.tsx" --include="*.css" \
  "animate.*width\|animate.*height\|animate.*margin\|animate.*padding\|animate.*top\|animate.*left" \
  src/
```
**Fix**: Replace `width` → `scaleX`, `top` → `translateY`, `height` → `scaleY`

**2. Missing GSAP context cleanup:**
```bash
grep -r "useEffect.*gsap" src/ --include="*.tsx"
```
**Fix**: Migrate to `useGSAP()` from `@gsap/react`

**3. ScrollTrigger not refreshed after dynamic content:**
```bash
grep -r "ScrollTrigger.refresh" src/ --include="*.tsx"
```
**Fix**: Add `ScrollTrigger.refresh()` in React Router route change effect

**4. Multiple Lottie animations simultaneously:**
```bash
grep -r "lottie-react\|<Lottie" src/ --include="*.tsx" | wc -l
```
**Fix**: Lazy-load Lottie, limit concurrent animations to 2

---

## Phase 3: Reduced Motion Compliance Audit

```bash
# Check for reduced motion support
echo "=== Framer Motion ==="
grep -r "useReducedMotion" src/ --include="*.tsx" --include="*.ts"

echo "=== CSS Media Query ==="
grep -r "prefers-reduced-motion" src/ --include="*.css" --include="*.tsx"

echo "=== GSAP ==="
grep -r "prefersReduced\|prefers-reduced" src/ --include="*.tsx"
```

**Compliance checklist:**
```
✅ useReducedMotion() hook used in Framer Motion components
✅ GSAP checks window.matchMedia("(prefers-reduced-motion: reduce)")
✅ Lottie animations have static fallback (icon/SVG)
✅ CSS transitions: @media (prefers-reduced-motion: reduce) { transition: none }
✅ Page transitions: instant state change when reduced motion enabled
✅ Loading animations: accessible role="status" + aria-label
```

---

## Phase 4: Creative Direction Review

> `@creative-director` reviews all animations against these standards:

### Motion Quality Checklist
```
✅ Entrance animations:    slide-up + fade (NOT bounce, NOT zoom-in)
✅ Exit animations:        fade only (NOT slide-out — disappearance = fade)
✅ Hover effects:          scale(1.02) max (NOT scale(1.1) — too aggressive)
✅ Button press:           scale(0.97) — tactile press feedback
✅ Page transitions:       smooth, 400ms max
✅ List stagger:           60–100ms per item, not all-at-once
✅ Scroll animations:      start: "top 80%" — not "top 50%" (too late)
✅ Loading states:         skeleton screens matching content shape
✅ Success animations:     brief (< 1.5s), then static confirmation
✅ GSAP hero:              < 2s total timeline duration
```

### Motion Anti-patterns to Eliminate:
```
❌ Bounce animations on content (use spring physics instead)
❌ Rotation for entrance/exit (distracting, use translate)
❌ All-at-once reveals (stagger instead)
❌ Infinite looping decorative animations (costly, distracting)
❌ Simultaneous > 2 independent animations
❌ Hero animations delaying content > 500ms
```

---

## Phase 5: Performance Fixes

**GSAP Performance Fixes:**
```typescript
// ✅ Batch DOM reads before writes
gsap.context(() => {
  const positions = elements.map(el => el.getBoundingClientRect()); // All reads first
  elements.forEach((el, i) => gsap.set(el, { x: positions[i].x })); // Then writes
});

// ✅ Use will-change only on actively animating elements
gsap.to(".hero-image", {
  x: 100,
  onStart: () => gsap.set(".hero-image", { willChange: "transform" }),
  onComplete: () => gsap.set(".hero-image", { willChange: "auto" }) // Remove after
});
```

**Framer Motion Performance Fixes:**
```typescript
// ✅ Move variants outside component to prevent re-creation on render
const fadeInUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
};

// ✅ Use transform + opacity only
// ❌ Never animate: left, top, width, height, margin, padding
```

---

## Phase 6: Validate Fixes

```bash
# Re-run budget gate
studio run animation-budget

# Chrome DevTools after fix:
# → Frame rate should be stable at 60fps during all animations
# → No long tasks > 50ms triggered by animations
# → Layout: 0 recalculations during animation phase

# Full verification
studio run verify-all
```

**After-fix record:**
```
📊 POST-FIX METRICS
  Frame rate (4x CPU):    [N] fps (target: 55+)
  Paint time:             [N]ms (target: < 2ms)
  Animation JS budget:    [N]KB (target: < 80KB)
  Reduced motion:         [N/N] animations compliant (target: 100%)
  Creative review:        APPROVED / CHANGES NEEDED
```
