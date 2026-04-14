---
description: redesign — upgrade existing flat or basic UI to 2026 visual quality using the three-layer model (ambient + surface + motion). Use when UI is functional but visually underwhelming.
---

# /redesign Workflow

> **Purpose**: Take an existing, working UI component or page and upgrade it to 2026 visual quality — without breaking functionality, accessibility, or TypeScript. This is a targeted visual upgrade, not a rewrite.

## 🤖 Activation
```
🤖 Applying @ui-design-engineer + @creative-director
   Loading: ui-visual-patterns-2026, tailwind-design-system,
            color-system, typography-system, responsive-patterns skills...
```

---

## When to Use `/redesign`

| ✅ Use `/redesign` when… | ❌ Don't use it when… |
|---|---|
| UI works but looks flat/basic | Building something from scratch (use `/create`) |
| Stats bar looks like a debug readout | Full design system overhaul needed (use `/design-system`) |
| Hero has no atmosphere or depth | The component is broken or has logic bugs |
| Docs sidebar has no icons or active pill | You need new features added, not visual upgrades |
| Pages have no prev/next navigation | |
| Code blocks look like plain `<pre>` tags | |

---

## Phase 1: Three-Layer Audit

Before touching any code, `@creative-director` audits which layers are present or missing:

```
🔍 Auditing: [component/page name]

Layer 1 — Ambient:
  □ Background atmosphere (dot grid, radial glow, gradient, noise)?
  □ Section transitions (gradient fades between sections)?
  → STATUS: MISSING / PRESENT

Layer 2 — Surface:
  □ Cards/containers have border + bg lift?
  □ Hover state changes surface elevation?
  □ Glassmorphism where appropriate (on gradient bg)?
  → STATUS: MISSING / PARTIAL / PRESENT

Layer 3 — Motion:
  □ Entrance animation (slide-up + fade on first visible)?
  □ Hover micro-interactions (border, bg, icon color)?
  □ Active state transitions (sidebar active pill)?
  → STATUS: MISSING / PARTIAL / PRESENT
```

**Scoring:**
- 0 layers present → Full redesign (apply all three)
- 1 layer present → Add the missing two
- 2 layers present → Add motion layer only
- All 3 present → Run `@creative-director` quality checklist only

---

## Phase 2: Prescription

`@creative-director` generates the specific prescription — what to add, exact classes:

```
🎨 Prescription for [component]:

Ambient layer:
  ADD: <HeroAmbient /> behind hero section
  ADD: dot grid via backgroundImage CSS on wrapper
  ADD: radial glow at brand color, top-center, blur-[120px]

Surface layer:
  CHANGE: plain div → bordered card  (border border-(--color-border) bg-(--color-surface))
  ADD: hover elevation (hover:bg-(--color-surface-raised) hover:border-(--color-border-strong))
  ADD: group + per-card hover glow (opacity-0 group-hover:opacity-20)

Motion layer:
  ADD: Framer Motion entrance (y: 20 → 0, opacity: 0 → 1, duration: 0.4)
  ADD: staggerChildren: 0.1 on grid container
  ADD: hover transition-colors duration-150 on all interactive elements

Typography adjustments:
  CHANGE: stat numbers — add tracking-tight, text-3xl → text-4xl
  CHANGE: section labels — text-xs uppercase tracking-widest text-(--color-muted)
  ADD: letter-spacing: -0.02em on all h2/h3 headings

Estimated impact: ★★★★☆ — significant visual improvement, zero functionality change
```

---

## Phase 3: Confirm Scope

Stop here and confirm with the user:

```
📋 Redesign scope for [page/component]:

Changes proposed:
  • [list each concrete change]

Files affected:
  • [file paths]

Estimated lines changed: ~N
Functionality impact: None (visual only)
Accessibility impact: None (no ARIA changes)
Bundle impact: [None / +X kb for new icons]

Proceed? (Type "yes" to implement, or adjust scope)
```

---

## Phase 4: Implementation

`@ui-design-engineer` implements, strictly following `ui-visual-patterns-2026` recipes:

### Implementation Rules
1. **One layer at a time** — ambient first, then surface, then motion
2. **Never break TypeScript** — all props stay typed, no `any`
3. **Preserve all existing Radix ARIA** — don't remove accessibility attributes
4. **Check reduced motion** — Framer Motion animations must check `useReducedMotion()`
5. **Token-only colors** — `bg-(--color-surface-raised)`, never `bg-[#1a1a24]`
6. **No new dependencies** — redesign with what's in `package.json`. If new lib needed, flag it.

### Reduced Motion Guard (required for all animations)
```tsx
import { useReducedMotion } from 'framer-motion';

function AnimatedCard({ children }: React.PropsWithChildren) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.4 }}
    >
      {children}
    </motion.div>
  );
}
```

---

## Phase 5: Creative Director Review

After implementation, `@creative-director` runs the visual checklist:

```
✅ Post-Implementation Review

Typography
  □ All headings have correct tracking (-0.02em display, -0.01em h1-h3)
  □ Body text line-length ≤ 75ch
  □ No heading levels skipped

Color & Contrast
  □ All text passes WCAG AA (4.5:1 normal, 3:1 large)
  □ Brand primary used ≤ 2 times per screen
  □ No hardcoded hex — all via CSS vars

Spacing & Rhythm
  □ All spacing on 4px grid
  □ Card padding: p-6 (24px) default
  □ Touch targets ≥ 44×44px

Motion Quality
  □ Entrance: slide-up + fade (NOT bounce or zoom)
  □ Exit: fade only
  □ Hover: scale ≤ 1.02 (NOT 1.1)
  □ useReducedMotion respected

Ambient Quality
  □ Glow opacity ≤ 0.25 (NOT fluorescent)
  □ Dot grid opacity ≤ 0.15 (NOT distracting)
  □ All glow elements: aria-hidden + pointer-events-none
  □ Bottom fade-out prevents hard section edge

Issues found: N
```

---

## Phase 6: Dark Mode Verification

```
□ Ambient glows visible but not overwhelming in dark mode
□ Card borders visible: border at ≥ 6% opacity on dark surface
□ Text contrast passes in dark mode (re-check — light pass ≠ dark pass)
□ Focus rings visible on dark backgrounds
□ No hardcoded `#ffffff` or `#000000`
```

---

## 🚀 Quick Redesign Commands

| Command | What it does |
|---|---|
| `/redesign hero` | Upgrades the hero section — ambient bg + terminal + glow |
| `/redesign sidebar` | Adds icons, active pill, section labels |
| `/redesign stats` | Upgrades stats bar with gradient wash + better typography |
| `/redesign cards` | Adds hover elevation + per-card glow to any card grid |
| `/redesign docs` | Full docs page: TOC column + prev/next + sidebar upgrade |
| `/redesign full` | All surfaces — runs audit → prescription → implement in sequence |
