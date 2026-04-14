---
name: dark-mode-theming
description: "Standards for Dark Mode and Thematic Transitions in enterprise React apps. Focuses on CSS Variables, Theme Persistence, and Accessibility."
---

# SKILL: Enterprise Dark Mode & Theming

## Overview
Standards for **Dark Mode** and **Thematic Transitions** in enterprise React apps. Focuses on **CSS Variables**, **Theme Persistence**, and **Accessibility**.

## 1. CSS Variable Architecture
- **Protocol**: Use semantic variables (`--background`, `--foreground`, `--primary`) in your global CSS.
- **Implementation**: Define light/dark values using `@media (prefers-color-scheme: dark)` or a `.dark` class on the body.

## 2. Theme Persistence (`next-themes`)
- **Strategy**: Use `next-themes` to handle system settings, manual overrides, and flash-free hydration.
- **Standard**: Always default to `system` for the first-time user experience.

## 3. High-Contrast & Accessibility
- **AA Standards**: Ensure contrast ratios are met in both Light and Dark modes.
- **High-Contrast Mode**: Support the OS-level high-contrast setting by providing clear borders and outlines where colors alone might fail.

## 4. Sub-theming & Section Shifting
- **Pattern**: Apply a different theme to a specific section (e.g., a "Dark Sidebar" in a "Light App") by nesting CSS variables or using a local `.dark` class.

## 5. Performance: Zero-Flash Hydration
- **Rule**: Never use `useEffect` to set the theme on mount. Use a blocking script (like `next-themes` provides) in the `<head>` to prevent the "white flash" on page load.

## Skills to Load
- `design-tokens-governance`
- `accessibility-wcag`
- `tailwind-design-system`
