# SKILL: Tailwind CSS Design System

## Overview
Production-grade **Tailwind CSS v4** design system patterns for TypeScript/React applications. Load for styling, theming, component variants, or design token work.

## Tailwind v4 Configuration
```typescript
// tailwind.config.ts — v4 (CSS-first config)
// In Tailwind v4, most config moves to CSS
// Keep this file minimal

import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
} satisfies Config;
```

```css
/* globals.css — Tailwind v4 CSS-first config */
@import "tailwindcss";

/* Design tokens as CSS custom properties */
@theme {
  --color-brand-50: oklch(97% 0.01 264);
  --color-brand-500: oklch(53% 0.2 264);
  --color-brand-900: oklch(27% 0.12 264);

  --font-sans: 'Inter Variable', ui-sans-serif, system-ui;
  --font-mono: 'JetBrains Mono', ui-monospace;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  --shadow-card: 0 1px 3px oklch(0% 0 0 / 0.1), 0 1px 2px oklch(0% 0 0 / 0.06);
}

/* Semantic color tokens for dark mode */
:root {
  --bg: var(--color-white);
  --fg: var(--color-neutral-900);
  --muted: var(--color-neutral-500);
  --border: var(--color-neutral-200);
}

.dark {
  --bg: var(--color-neutral-950);
  --fg: var(--color-neutral-50);
  --muted: var(--color-neutral-400);
  --border: var(--color-neutral-800);
}
```

## Class Variance Authority (CVA) Patterns

### Button Variants (Production-Ready)
```typescript
import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary:   'bg-brand-500 text-white shadow-sm hover:bg-brand-600',
        secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100',
        outline:   'border border-neutral-200 bg-transparent hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800',
        ghost:     'hover:bg-neutral-100 dark:hover:bg-neutral-800',
        danger:    'bg-red-500 text-white hover:bg-red-600',
        link:      'text-brand-500 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        xs: 'h-7 rounded px-2 text-xs',
        sm: 'h-8 px-3',
        md: 'h-9 px-4',
        lg: 'h-11 px-6 text-base',
        icon: 'h-9 w-9 rounded-md',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
```

## Responsive Design Patterns
```tsx
// Mobile-first — min-width breakpoints
// xs: 0px, sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px

<div className="
  grid grid-cols-1           /* mobile: 1 column */
  sm:grid-cols-2             /* 640px+: 2 columns */
  lg:grid-cols-3             /* 1024px+: 3 columns */
  xl:grid-cols-4             /* 1280px+: 4 columns */
  gap-4 lg:gap-6
">

// Container with sensible padding
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
```

## Dark Mode
```tsx
// Always use `dark:` variants for both bg and text
<div className="
  bg-white text-neutral-900
  dark:bg-neutral-900 dark:text-neutral-100
  border border-neutral-200 dark:border-neutral-800
">
```

## Animation Utilities
```css
/* globals.css — custom animations */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@utility animate-fade-in {
  animation: fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}
```
```tsx
// Usage
<div className="animate-fade-in">Content appears smoothly</div>
```

## Utility: cn() Helper
```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merges Tailwind classes correctly (handles conflicts)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
