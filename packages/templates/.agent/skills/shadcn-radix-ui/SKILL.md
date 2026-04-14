---
name: shadcn-radix-ui
description: "Advanced patterns for building Accessible Component Libraries with shadcn/ui and Radix UI primitives. Focuses on Composition, Themeability, and Str..."
---

# SKILL: Enterprise shadcn/ui & Radix UI

## Overview
Advanced patterns for building **Accessible Component Libraries** with **shadcn/ui** and **Radix UI** primitives. Focuses on **Composition**, **Themeability**, and **Strict Type Safety**.

## 1. Radical Composition Pattern
Avoid "God Components" with too many props. Use **Radix primitives** to expose sub-components.
- **Pattern**: `Modal.Root`, `Modal.Trigger`, `Modal.Content`, `Modal.Close`.
- **Benefit**: Maximum flexibility for the consumer without breaking encapsulation.

## 2. Advanced Component Hardening (Zod + ARIA)
Every form-related component (Input, Select, Checkbox) must be linked to its error state.
- **State**: Use `aria-invalid={!!error}` and `aria-describedby={errorId}`.
- **Validation**: Ensure components are compatible with `react-hook-form` and `zod`.

## 3. Theming & Design Tokens
- **CSS Variables**: Use semantic variables (e.g. `--color-primary`, `--color-surface`) for all colors to enable easy theme switching (Dark/Light/High-Contrast).
- **Tailwind v4 format**: Define tokens as actual color values in `@theme {}` — NOT as bare HSL numbers. Bare HSL (`--primary: 221.2 83.2% 53.3%`) is a shadcn/Tailwind v3 pattern that does NOT work in v4 without explicit `hsl()` wrapping and Tailwind v3 color-channel plugins.
- **Dark mode**: Override tokens via `[data-theme="dark"]` attribute selector (not `.dark` class).
- **Custom Variants**: Use `cva` (Class Variance Authority) to define clean, typed variants for your components.

```css
/* globals.css — Tailwind v4 @theme (correct format) */
@theme {
  --color-primary:            oklch(0.62 0.21 290);  /* ✅ actual value */
  --color-primary-foreground: #ffffff;
  --color-surface:            #ffffff;
  --color-border:             #e2e8f0;
}

/* Dark mode: use [data-theme] attribute, NOT .dark class */
[data-theme="dark"] {
  --color-primary:  oklch(0.72 0.18 290);
  --color-surface:  #0a0a0f;
  --color-border:   #1e1e2e;
}

/* System preference fallback */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-surface: #0a0a0f;
    --color-border:  #1e1e2e;
  }
}
```

```typescript
const buttonVariants = cva("...", {
  variants: {
    variant: {
      primary: "bg-(--color-primary) text-(--color-primary-foreground)",
      ghost: "hover:bg-(--color-surface)",
    },
    size: {
      sm: "h-8 px-3",
      lg: "h-11 px-8",
    },
  },
});
```

## 4. Performance: Tree Shaking & Barrel Exports
- **Barrel Exports**: Use `index.ts` only at the package boundary.
- **Individual Imports**: Prefer importing from specific files if the barrel file becomes a bottleneck in any bundler (Vite, webpack, etc.).

## 5. Accessibility Regression Testing
Every upgraded component must be verified with:
- **axe-core**: To catch ID collisions and missing labels.
- **Keyboard Tab Flow**: To ensure focus follows the visual order.

## Skills to Load
- `radix-ui-primitives`
- `design-tokens-governance`
- `accessibility-wcag`
