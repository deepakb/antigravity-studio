---
description: design-system — structured workflow for building, extending, and auditing the enterprise design system in React+Vite projects
agent: agent
tools: [search/codebase, terminal]
---

# /design-system Workflow

> **Purpose**: Build and maintain a pixel-perfect, enterprise-grade design system end-to-end — from token architecture through component library to visual regression CI. This workflow covers new design system setup, component additions, and full audits.

## 🤖 Activation
```
🤖 Applying @design-system-architect + @ui-design-engineer + @creative-director
   Loading: design-token-architecture, color-system, typography-system,
            tailwind-design-system, shadcn-radix-ui, storybook-driven-development skills...
```

---

## 🎯 Design System Health Targets

| Metric | Target | Gate |
|--------|--------|------|
| Token coverage | 100% — zero hardcoded values | `contrast-checker` |
| Component story coverage | 100% — every component has stories | `storybook-build` |
| WCAG AA compliance | 100% | `accessibility-audit` + `contrast-checker` |
| Dark mode parity | 100% — all components work in dark | `chromatic-visual-test` |
| Visual regression | 0 unreviewed changes | `chromatic-visual-test` |
| TypeScript coverage | 100% — no `any` in design system | `ts-check` + `type-coverage` |

---

## Phase 1: Token Foundation Audit

```bash
# 1. Check current token status
ls src/design-system/tokens/

# 2. Validate style-dictionary config
npx style-dictionary build

# 3. Check for hardcoded values (should be zero)
studio run contrast-checker
```

**Deliverables:**
- [ ] `tokens/primitive/*.json` — raw values defined
- [ ] `tokens/semantic/*.json` — intent-based mapping complete
- [ ] `tokens/component/*.json` — component-scoped tokens defined
- [ ] `tokens.css` generated with all CSS custom properties
- [ ] `tokens.ts` generated for TypeScript consumption
- [ ] Tailwind `@theme` block connected to generated tokens

---

## Phase 2: Color System

> `@design-system-architect` leads. `@creative-director` reviews.

**Checklist:**
```
✅ Primitive palette (Radix Colors scales imported)
✅ Semantic layer: brand, surface, text, border, feedback
✅ Light mode: all semantic tokens defined
✅ Dark mode: [data-theme="dark"] overrides defined
✅ ThemeProvider connected to document.documentElement
✅ Theme toggle works (light / dark / system)
✅ WCAG AA: all text/bg pairs pass 4.5:1 (run contrast-checker)
```

**Color pairs to validate (minimum):**
| Pair | Expected Ratio |
|------|---------------|
| `--color-text-primary` on `--color-surface-base` | ≥ 7:1 |
| `--color-text-secondary` on `--color-surface-base` | ≥ 4.5:1 |
| `--color-text-muted` on `--color-surface-base` | ≥ 4.5:1 |
| White text on `--color-brand-solid` | ≥ 4.5:1 |
| `--color-feedback-error` text on error bg | ≥ 4.5:1 |

---

## Phase 3: Typography System

> `@design-system-architect` leads. `@creative-director` reviews line-length, rhythm.

**Checklist:**
```
✅ Font families defined: display, heading, body, mono
✅ Fontsource installed (no Google Fonts CDN)
✅ Font preloaded in index.html: <link rel="preload" ... as="font">
✅ font-display: swap on all @font-face declarations
✅ Fluid type scale: clamp() for display + heading sizes
✅ Fixed sizes: body (1rem), body-sm (0.875rem), caption (0.75rem)
✅ Tailwind @theme connected to type tokens
✅ Prose component configured for long-form content
✅ CLS validated: no layout shift on font load
```

---

## Phase 4: Component Library Build

> For each new component, follow the **Component-Driven Workflow**:

```
1. Figma spec review (Creative Director approval)
     ↓
2. Define CVA variants (Button.variants.ts)
     ↓
3. Implement component (Button.tsx)
     ↓
4. Write all stories (Button.stories.tsx):
   - Default, AllVariants, AllSizes, States, DarkMode, a11y
     ↓
5. Write RTL unit tests (Button.test.tsx)
     ↓
6. studio run storybook-build (verify compilation)
     ↓
7. Chromatic baseline accepted
     ↓
8. Integrate into app
```

**Priority component order for a new design system:**
```
Atoms:      Button, Input, Badge, Avatar, Spinner, Icon
Molecules:  FormField, SearchBar, DatePicker, Select, Toast
Organisms:  DataTable, NavigationMenu, Modal, CommandPalette
Patterns:   PageHeader, EmptyState, ErrorBoundary, Skeleton
```

---

## Phase 5: Design System Audit

Run the full audit suite:

```bash
# Full gate sweep
studio run ts-check
studio run type-coverage
studio run accessibility-audit
studio run contrast-checker
studio run storybook-build
studio run chromatic-visual-test
```

**Audit report format:**
```markdown
## Design System Audit — {{timestamp}}

### Token Coverage
- Total semantic tokens: N
- Hardcoded values detected: N (target: 0)

### Component Coverage
- Total components: N
- Components with stories: N (target: 100%)
- Components with tests: N (target: 100%)

### Accessibility
- WCAG AA passes: N/N color pairs
- a11y story audit: N issues found

### Visual Regression
- Chromatic baseline: APPROVED / PENDING
- Unreviewed changes: N
```

---

## Phase 6: Dark Mode Validation

```bash
# In Storybook: toggle to dark mode using themes addon
# Verify every component in both themes

# Checklist:
# ✅ ThemeProvider wraps Storybook preview.ts
# ✅ [data-theme="dark"] overrides all semantic tokens
# ✅ No hardcoded white/black values in components
# ✅ Shadow strategy: solid → transparent in dark mode
# ✅ Image treatment: bg images with mix-blend-mode fallback
```

---

## 🚀 Quick Commands

| Intent | Command |
|--------|---------|
| Add a new component | `/design-system add Button` |
| Audit token coverage | `/design-system audit tokens` |
| Validate contrast | `studio run contrast-checker` |
| Build Storybook | `npm run build-storybook` |
| Chromatic review | `npx chromatic --project-token=<TOKEN>` |
| Run all gates | `studio run verify-all` |
