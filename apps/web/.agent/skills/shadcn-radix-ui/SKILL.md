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

## 3. Theming & Sub-systems (shadcn/ui)
- **CSS Variables**: Use semantic variables (`--primary`, `--secondary`, `--accent`) for all colors to allow easy theme switching (Dark/Light/High-Contrast).
- **Custom Variants**: Use `cva` (Class Variance Authority) to define clean, typed variants for your components.

```typescript
const buttonVariants = cva("...", {
  variants: {
    variant: {
      primary: "bg-primary text-primary-foreground",
      ghost: "hover:bg-accent",
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
- **Individual Imports**: In Next.js, prefer importing from specific files if the barrel file becomes a bottleneck.

## 5. Accessibility Regression Testing
Every upgraded component must be verified with:
- **axe-core**: To catch ID collisions and missing labels.
- **Keyboard Tab Flow**: To ensure focus follows the visual order.

## Skills to Load
- `radix-ui-primitives`
- `design-tokens-governance`
- `accessibility-wcag`
