````markdown
---
name: typography-system
description: "Enterprise fluid typography system — clamp-based responsive scale, Fontsource self-hosted fonts, font loading strategy (CLS prevention), optical sizing, and Tailwind v4 integration"
---

# SKILL: Typography System (Fluid)

## Overview
Enterprise **Fluid Typography** system using CSS `clamp()` for viewport-responsive type that needs **zero breakpoints**. Covers Fontsource self-hosted font loading, CLS prevention via `font-display: swap`, optical sizing, and integration with Tailwind v4 theme.

## 1. Font Stack Decision Matrix

```
Font Families for @nexus/web:
┌─────────────┬────────────────────────────┬─────────────────────────────┐
│ Role        │ Recommended                │ When to Use                 │
├─────────────┼────────────────────────────┼─────────────────────────────┤
│ Display     │ Cal Sans / Instrument Sans │ Hero headings, hero numbers │
│ Heading     │ Inter / Geist             │ Section headings h1–h3      │
│ Body        │ Inter / DM Sans           │ Paragraph, UI labels        │
│ Mono        │ Geist Mono / JetBrains    │ Code blocks, data tables    │
└─────────────┴────────────────────────────┴─────────────────────────────┘
```

## 2. Fluid Type Scale (clamp-based)

```css
/* src/design-system/tokens/typography.css */
:root {
  /* Display — Hero headings */
  --text-display-2xl: clamp(3rem,   5vw + 1rem, 5rem);     /* 48px → 80px */
  --text-display-xl:  clamp(2.5rem, 4vw + 1rem, 4rem);     /* 40px → 64px */
  --text-display-lg:  clamp(2rem,   3vw + 1rem, 3.25rem);  /* 32px → 52px */

  /* Headings */
  --text-h1: clamp(1.75rem, 2.5vw + 0.75rem, 2.5rem);     /* 28px → 40px */
  --text-h2: clamp(1.5rem,  2vw + 0.5rem,   2rem);        /* 24px → 32px */
  --text-h3: clamp(1.25rem, 1.5vw + 0.5rem, 1.5rem);      /* 20px → 24px */
  --text-h4: clamp(1.125rem, 1vw + 0.5rem, 1.25rem);      /* 18px → 20px */

  /* Body */
  --text-body-lg: clamp(1rem, 0.5vw + 0.875rem, 1.125rem); /* 16px → 18px */
  --text-body:    1rem;                                      /* 16px fixed */
  --text-body-sm: 0.875rem;                                  /* 14px fixed */
  --text-caption: 0.75rem;                                   /* 12px fixed */

  /* Line Heights */
  --leading-display:  1.1;
  --leading-heading:  1.25;
  --leading-body:     1.6;
  --leading-relaxed:  1.75;

  /* Letter Spacing */
  --tracking-display: -0.03em;
  --tracking-heading: -0.02em;
  --tracking-body:     0em;
  --tracking-caps:     0.08em;

  /* Measure (line length) */
  --measure-narrow: 45ch;
  --measure-normal: 65ch;   /* Optimal reading: 45–75ch */
  --measure-wide:   85ch;
}
```

## 3. Fontsource Installation & Loading

```bash
# Install Inter (body) + Geist Mono (code)
npm install @fontsource-variable/inter @fontsource-variable/geist-mono
```

```typescript
// src/main.tsx — import only the weights you use
import "@fontsource-variable/inter/wght.css";        // Variable weight axis
import "@fontsource-variable/geist-mono/wght.css";
```

```css
/* globals.css — font-face with CLS prevention */
@font-face {
  font-family: "Inter Variable";
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;          /* ← Prevents FOIT (Flash of Invisible Text) */
  src: url("/fonts/inter-variable.woff2") format("woff2");
  unicode-range: U+0000-00FF;  /* ← Only load Latin characters */
}
```

## 4. Tailwind v4 Integration

```css
/* globals.css */
@theme {
  --font-family-sans:    "Inter Variable", ui-sans-serif, system-ui, sans-serif;
  --font-family-display: "Cal Sans", "Inter Variable", sans-serif;
  --font-family-mono:    "Geist Mono Variable", ui-monospace, monospace;

  /* Map fluid tokens to Tailwind */
  --text-display-2xl: clamp(3rem, 5vw + 1rem, 5rem);
  --text-h1: clamp(1.75rem, 2.5vw + 0.75rem, 2.5rem);
}
```

## 5. Optical Sizing

```css
/* Enable optical sizing for variable fonts that support it */
.font-display {
  font-variation-settings: "opsz" 32;  /* Larger optical size for display */
}
.font-body {
  font-variation-settings: "opsz" 16;  /* Body optical size */
}
```

## 6. Prose Content (Long-form)

```tsx
// For article/blog/documentation content
<article className="
  max-w-prose
  mx-auto
  prose prose-gray dark:prose-invert
  prose-headings:font-display prose-headings:tracking-tight
  prose-a:text-[--color-brand-primary] prose-a:no-underline hover:prose-a:underline
  prose-code:bg-[--color-surface-raised] prose-code:rounded prose-code:px-1
">
  {content}
</article>
```

## 7. Font Loading Performance Rules
- **FOUT over FOIT**: Always `font-display: swap` — text is better than invisible text
- **Preload critical fonts**: `<link rel="preload" href="/fonts/inter-variable.woff2" as="font" crossorigin>`
- **Variable fonts only**: One file covers all weights — eliminates multiple font HTTP requests
- **Subset for performance**: Use `unicode-range` to only load Latin for English-primary apps
- **No Google Fonts CDN**: Use Fontsource (self-hosted) — avoids privacy concerns + removes third-party DNS lookup
````
