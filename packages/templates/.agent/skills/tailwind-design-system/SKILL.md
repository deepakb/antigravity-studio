---
name: tailwind-design-system
description: "Advanced patterns for Tailwind CSS v4 in production. Focuses on Design Token Governance, Container Queries, and Zero-Runtime Performance."
---

# SKILL: Enterprise Tailwind CSS (v4)

## Overview
Advanced patterns for **Tailwind CSS v4** in production. Focuses on **Design Token Governance**, **Container Queries**, and **Zero-Runtime Performance**.

## 1. Design Token Governance (Theme)
Move away from ad-hoc hex codes. Use a centralized theme logic.
- **Pattern**: Map semantic names (primary, secondary, accent) to CSS variables.
- **Config**: Use the new v4 `@theme` directive in your CSS entry file.

```css
@theme {
  --color-brand: oklch(0.6 0.2 260);
  --spacing-4: 1rem;
}
```

## 2. Container Queries (@container)
Stop relying solely on Viewport Media Queries. Use **Container Queries** for modular components.
- **Pattern**: `<div class="@container"> <div class="grid grid-cols-1 @lg:grid-cols-2">`.
- **Benefit**: Components adapt to the space *provided* to them, enabling true reusability across sidebars, grids, and main areas.

## 3. Dynamic States & Grouping
- **Group States**: Use `group` and `peer` sparingly to manage complex parent-child relationship styling.
- **Arbitrary Variants**: Use `[&_p]:mb-4` to style nested children safely without polluting them with classes.

## 4. Performance & Bundle Optimization
- **Scanning**: Tailwind v4 scans files automatically for classes.
- **Arbitrary Values**: Avoid overusing `-[24px]` values. Map them to your theme spacing tokens instead.

## 5. Plugin Ecosystem & Typography
- **Forms**: Use the `@tailwindcss/forms` plugin for reset consistency.
- **Typography**: Use `@tailwindcss/typography` (`prose`) for user-generated content (Markdown).

## Skills to Load
- `design-system-tokens`
- `responsive-design-strategies`
- `accessibility-wcag`
