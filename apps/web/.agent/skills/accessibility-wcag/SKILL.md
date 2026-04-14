---
name: accessibility-wcag
description: "High-integrity WCAG 2.2 AA implementation for enterprise TypeScript/React apps. Focuses on Keyboard Navigation, Screen Reader Efficiency, and Cogni..."
---

# SKILL: Enterprise Accessibility (WCAG 2.2)

## Overview
High-integrity **WCAG 2.2 AA** implementation for enterprise TypeScript/React apps. Focuses on **Keyboard Navigation**, **Screen Reader Efficiency**, and **Cognitive Inclusivity**.

## 1. Advanced Keyboard Navigation (Focus Management)
- **Focus Traps**: Must be used in Modals, Drawers, and Dialogs (use `Radix UI` or `React Focus Lock`).
- **Skip Links**: Always include a `Skip to Content` link as the first tabable element.
- **Visual Focus**: Never use `outline: none`. Use a high-contrast `:focus-visible` ring that respects the theme.

## 2. Screen Reader Orchestration (ARIA)
- **Landmarks**: Use `<header>`, `<nav>`, `<main>`, `<section>`, and `<footer>` correctly to allow easy navigation.
- **Dynamic Updates**: Use `aria-live="polite"` for non-disruptive notifications (e.g., "Item added to cart") and `aria-live="assertive"` for critical failures.
- **Descriptive Labels**: Use `aria-labelledby` and `aria-describedby` to link inputs with error messages and hints.

## 3. WCAG 2.2 Specifics (New Criteria)
- **Focus Appearance**: Ensure the focus indicator has a minimum area and contrast (2.4.11).
- **Target Size (Minimum)**: All interactive targets must be at least 24x24 CSS pixels (2.5.8).
- **Consistent Help**: Help mechanisms (Chat, Docs, Contact) must be in the same relative location (3.2.6).

## 4. Semantic Integrity & Form Safety
- **Native over ARIA**: Use `<button>` instead of `<div role="button">`.
- **Form Validation**: Errors must be announced immediately. The first invalid field should receive focus on failed submission.
- **Grouping**: Use `<fieldset>` and `<legend>` for groups of related inputs (e.g., Address, Credit Card info).

## 5. Automated vs Manual Testing
- **Automated**: Use `axe-core` or `Playwright` to catch 40% of issues.
- **Manual**: Verify "No Keyboard Trap", "Logical Tab Order", and "Zoom to 200%" manually.

## Skills to Load
- `design-tokens-accessibility`
- `react-testing-library-a11y`
- `shadcn-radix-ui`

---

## Verification Scripts (MANDATORY)

- **A11y Audit**: `studio run accessibility-audit`
