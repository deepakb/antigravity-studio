````markdown
---
name: color-system
description: "Enterprise color system using Radix Colors for perceptual balance and WCAG-guaranteed contrast — primitive palette, semantic layer, feedback colors, surface system, and light/dark theme switching"
---

# SKILL: Color System (Radix + Semantic)

## Overview
Enterprise **Color System** built on **Radix Colors** — a perceptually uniform 12-step palette that guarantees WCAG AA/AAA contrast ratios by construction. Covers the primitive palette, semantic token mapping, feedback color system, surface elevation model, and light/dark theme switching via CSS custom properties.

## 1. Why Radix Colors
- **Perceptual uniformity**: Each step is visually equidistant — step 9 is always the "solid color" for buttons
- **WCAG guaranteed**: Step 11 on step 1 background always passes AA (4.5:1)
- **12-step system**: Each scale has a consistent semantic meaning per step

```
Step 1-2:   App backgrounds
Step 3-5:   Component backgrounds (hover, active, selected)
Step 6-8:   Borders and separators  
Step 9-10:  Solid fills (buttons, badges)
Step 11-12: Text (accessible on steps 1-5)
```

## 2. Installation

```bash
npm install @radix-ui/colors
```

```css
/* globals.css — import only the scales you use */
@import "@radix-ui/colors/violet.css";
@import "@radix-ui/colors/violet-dark.css";
@import "@radix-ui/colors/gray.css";
@import "@radix-ui/colors/gray-dark.css";
@import "@radix-ui/colors/red.css";
@import "@radix-ui/colors/red-dark.css";
@import "@radix-ui/colors/green.css";
@import "@radix-ui/colors/green-dark.css";
@import "@radix-ui/colors/amber.css";
@import "@radix-ui/colors/amber-dark.css";
@import "@radix-ui/colors/blue.css";
@import "@radix-ui/colors/blue-dark.css";
```

## 3. Semantic Color Layer

```css
/* tokens/semantic-colors.css */
:root {
  /* Brand */
  --color-brand-subtle:   var(--violet-3);
  --color-brand-element:  var(--violet-5);
  --color-brand-border:   var(--violet-7);
  --color-brand-solid:    var(--violet-9);   /* Buttons, active states */
  --color-brand-text:     var(--violet-11);  /* Text on light bg */

  /* Surface (elevation system) */
  --color-surface-base:    var(--gray-1);    /* Page background */
  --color-surface-raised:  var(--gray-2);    /* Cards */
  --color-surface-overlay: var(--gray-3);    /* Hover states */
  --color-surface-sunken:  var(--gray-1);    /* Input wells */

  /* Text */
  --color-text-primary:   var(--gray-12);   /* High contrast */
  --color-text-secondary: var(--gray-11);   /* Supporting text */
  --color-text-muted:     var(--gray-10);   /* Placeholders, captions */
  --color-text-disabled:  var(--gray-8);

  /* Border */
  --color-border-subtle:  var(--gray-4);
  --color-border-default: var(--gray-6);
  --color-border-strong:  var(--gray-8);

  /* Feedback */
  --color-success-bg:     var(--green-2);
  --color-success-border: var(--green-6);
  --color-success-text:   var(--green-11);
  --color-success-solid:  var(--green-9);

  --color-warning-bg:     var(--amber-2);
  --color-warning-border: var(--amber-6);
  --color-warning-text:   var(--amber-11);
  --color-warning-solid:  var(--amber-9);

  --color-error-bg:       var(--red-2);
  --color-error-border:   var(--red-6);
  --color-error-text:     var(--red-11);
  --color-error-solid:    var(--red-9);

  --color-info-bg:        var(--blue-2);
  --color-info-border:    var(--blue-6);
  --color-info-text:      var(--blue-11);
  --color-info-solid:     var(--blue-9);
}

/* Dark mode — Radix dark scales automatically re-map via [data-theme="dark"] */
[data-theme="dark"] {
  --color-surface-base:    var(--gray-dark-1);
  --color-surface-raised:  var(--gray-dark-2);
  --color-surface-overlay: var(--gray-dark-3);
  --color-text-primary:    var(--gray-dark-12);
  --color-text-secondary:  var(--gray-dark-11);
  --color-text-muted:      var(--gray-dark-10);
  --color-border-default:  var(--gray-dark-6);
  --color-brand-solid:     var(--violet-dark-9);
  --color-brand-text:      var(--violet-dark-11);
  /* Feedback colors swap to dark variants automatically */
}
```

## 4. Theme Provider Pattern (React)

```typescript
// src/providers/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolved: "light" | "dark";
}>({ theme: "system", setTheme: () => {}, resolved: "light" });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) ?? "system"
  );

  const resolved = theme === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme;

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;  // ← Sets [data-theme="dark"]
    localStorage.setItem("theme", theme);
  }, [theme, resolved]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolved }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

## 5. WCAG Contrast Reference

| Pair | Contrast | WCAG Level |
|------|----------|-----------|
| gray-12 on gray-1 | ~17:1 | AAA ✅ |
| gray-11 on gray-2 | ~8:1  | AAA ✅ |
| violet-9 on white | ~4.8:1 | AA ✅ |
| gray-10 on gray-2 | ~3:1  | AA Large ✅ |

## 6. Color Usage Rules
- ✅ `bg-[--color-brand-solid]` — always use semantic tokens
- ✅ `text-[--color-text-primary]` — semantic text references
- ❌ `bg-violet-500` — never use Radix raw variable steps directly in components
- ❌ `text-gray-900` — never hardcode Tailwind primitive colors
- **Brand accent max 20%** of any screen — overuse dilutes the brand signal
````
