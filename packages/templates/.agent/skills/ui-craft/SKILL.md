---
name: ui-craft
description: "Modern UI visual patterns — ambient backgrounds, glassmorphism, gradient text, dot grids, glow effects, animated borders, and contemporary design aesthetics for production-quality interfaces"
---

# SKILL: UI Craft & Visual Patterns

## Overview
A catalog of **production-ready visual patterns** for modern web UIs. Each pattern follows the design system token architecture — no hardcoded values. All patterns include reduced-motion variants and WCAG contrast compliance.

## 1. Gradient Text
```css
/* Token-driven gradient text */
.gradient-text {
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-secondary)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

## 2. Ambient Glow Background
```css
.ambient-glow {
  background:
    radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in srgb, var(--color-primary) 20%, transparent), transparent),
    radial-gradient(ellipse 60% 40% at 80% 100%, color-mix(in srgb, var(--color-secondary) 15%, transparent), transparent),
    var(--color-background);
}
```

## 3. Dot Grid Pattern
```css
.dot-grid {
  background-image: radial-gradient(
    circle,
    color-mix(in srgb, var(--color-foreground) 20%, transparent) 1px,
    transparent 1px
  );
  background-size: 24px 24px;
}
```

## 4. Glassmorphism Card
```css
.glass-card {
  background: color-mix(in srgb, var(--color-background) 60%, transparent);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid color-mix(in srgb, var(--color-foreground) 10%, transparent);
  border-radius: var(--radius-lg);
}
```

## 5. Animated Gradient Border
```css
@keyframes gradient-border {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.gradient-border {
  position: relative;
  border-radius: var(--radius-lg);
}
.gradient-border::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-primary));
  background-size: 200% 200%;
  animation: gradient-border 3s ease infinite;
  z-index: -1;
}
```

## 6. Noise Texture Overlay
```css
.noise-overlay {
  position: relative;
}
.noise-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* SVG noise filter */
  opacity: 0.03;
  pointer-events: none;
}
```

## 7. Typography Hierarchy Rules
- **Display headings**: `clamp(2.5rem, 5vw, 4.5rem)` — never fixed sizes for heroes
- **Body**: minimum `1rem` / `16px` — never smaller
- **Line height**: `1.5–1.7` for body, `1.1–1.2` for display
- **Measure**: `60–75ch` max line length for reading comfort

## 8. Reduced Motion Compliance
Every animated pattern must include:
```css
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    animation: none;
    transition: none;
  }
}
```

## Rules
- All colors via CSS custom properties — never hardcoded hex
- All patterns tested in both light and dark mode
- WCAG AA minimum contrast (4.5:1 text, 3:1 large/UI)
- `will-change` only on actively animating elements, removed after animation
