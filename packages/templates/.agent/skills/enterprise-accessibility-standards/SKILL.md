---
name: enterprise-accessibility-standards
description: "Enterprise accessibility standards aligned with WCAG 2.2 AA, covering semantic HTML, ARIA usage, keyboard navigation, colour contrast, and screen reader testing protocols."
category: UX/UI Design
tokenBudget: 550
contributed: true
---

# SKILL: Enterprise Accessibility Standards

## Overview
Enterprise accessibility requirements aligned with **WCAG 2.2 Level AA**. Applicable to all client-facing products. Covers semantic markup, ARIA patterns, keyboard navigation, colour contrast, and screen reader QA protocols.

---

## 1. Semantic HTML First

Before reaching for ARIA, use the right HTML element:

| Purpose | ✅ Use | ❌ Avoid |
|---------|--------|---------|
| Navigation | `<nav>` | `<div role="navigation">` |
| Main content | `<main>` | `<div id="main">` |
| Page sections | `<section>`, `<article>` | generic `<div>` |
| Buttons | `<button>` | `<div onClick>`, `<a>` with click |
| Form labels | `<label for="...">` | placeholder as label |
| Data tables | `<table>` with `<th scope>` | CSS grid disguised as table |

> **Rule**: ARIA is a last resort. A native element with correct semantics always beats `role=` overrides.

---

## 2. ARIA Usage Guidelines

### When to Use ARIA
Only when a native HTML element cannot convey the required role, state, or property.

### Critical ARIA Patterns

**Live Regions (status updates)**
```html
<!-- For dynamic content that should be announced without focus change -->
<div role="status" aria-live="polite" aria-atomic="true">
  {{ statusMessage }}
</div>

<!-- For urgent error messages -->
<div role="alert" aria-live="assertive">
  {{ errorMessage }}
</div>
```

**Modal Dialog**
```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-desc"
>
  <h2 id="modal-title">Confirm Action</h2>
  <p id="modal-desc">This cannot be undone.</p>
  <!-- focus trap required inside dialog -->
</div>
```

**Custom Interactive Widgets**
```html
<!-- Tabs -->
<div role="tablist" aria-label="Account Settings">
  <button role="tab" aria-selected="true" aria-controls="panel-profile" id="tab-profile">Profile</button>
  <button role="tab" aria-selected="false" aria-controls="panel-security" id="tab-security" tabindex="-1">Security</button>
</div>
<div role="tabpanel" id="panel-profile" aria-labelledby="tab-profile">...</div>
```

---

## 3. Keyboard Navigation Requirements

Every interactive element must be operable by keyboard:

| Interaction | Required keys |
|-------------|--------------|
| Navigate to element | `Tab` / `Shift+Tab` |
| Activate button | `Enter` or `Space` |
| Close modal/dropdown | `Escape` |
| Navigate list/menu | `Arrow keys` |
| Select checkbox | `Space` |
| Submit form | `Enter` |

### Focus Management Rules
```typescript
// When a modal opens, move focus to it
useEffect(() => {
  if (isOpen) {
    modalRef.current?.focus();
  }
}, [isOpen]);

// When a modal closes, return focus to the trigger
useEffect(() => {
  if (!isOpen && triggerRef.current) {
    triggerRef.current.focus();
  }
}, [isOpen]);
```

### Focus Trap (required for modals and drawers)
Use a dedicated focus-trap library or implement:
- Focus cycles within the modal
- `Tab` from last focusable element returns to first
- `Shift+Tab` from first goes to last

---

## 4. Colour Contrast Requirements

| Text Type | Minimum Contrast Ratio |
|-----------|----------------------|
| Normal text (< 18px) | **4.5:1** |
| Large text (≥ 18px or 14px bold) | **3:1** |
| UI components & focus indicators | **3:1** |
| Decorative / disabled elements | No requirement |

### EPAM Brand Compliance
When using EPAM brand colours:
- Always verify accessible combinations using the `contrast-checker` script: `studio run contrast-checker`
- Never rely on colour alone to convey information (add icon, text, pattern)
- Dark mode must also meet contrast requirements

---

## 5. Form Accessibility

```tsx
// ✅ Fully accessible form field
<div>
  <label htmlFor="email">
    Email address
    <span aria-hidden="true" style={{ color: 'red' }}> *</span>
    <span className="sr-only"> (required)</span>
  </label>
  <input
    id="email"
    type="email"
    name="email"
    aria-required="true"
    aria-describedby={error ? "email-error" : "email-hint"}
    aria-invalid={error ? "true" : undefined}
  />
  <span id="email-hint" className="hint">We'll never share your email.</span>
  {error && (
    <span id="email-error" role="alert" className="error">
      {error}
    </span>
  )}
</div>
```

**Rules:**
- Every `<input>` must have a visible `<label>` — not just `placeholder`
- Error messages must be associated with the field via `aria-describedby`
- Required fields must be marked with both visual indicator and `aria-required="true"`
- Invalid fields must set `aria-invalid="true"` and show the error in a live region

---

## 6. Screen Reader Testing Protocol (EPAM QA Standard)

### Required Screen Reader Coverage
| Platform | Tool | Browser |
|---------|------|---------|
| Windows | NVDA (free) | Chrome |
| macOS | VoiceOver (built-in) | Safari |
| Mobile iOS | VoiceOver | Safari |
| Mobile Android | TalkBack | Chrome |

### Minimum QA Checklist
- [ ] Page title is descriptive and unique
- [ ] Skip navigation link present (`<a href="#main">Skip to content</a>`)
- [ ] All images have meaningful `alt` text (or `alt=""` if decorative)
- [ ] Form labels are announced correctly when field receives focus
- [ ] Error messages are announced without requiring focus change
- [ ] Modal/dialog traps focus and is announced correctly on open
- [ ] Dynamic content updates (load more, filter results) are announced via live region
- [ ] Reading order matches visual order

### Automated Testing Integration
```bash
# Run in CI via Nexus Studio
studio run accessibility-audit
```
This runs axe-core across all routes and fails on any WCAG AA violations.

---

## EPAM Accessibility Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] Colour contrast meets 4.5:1 for normal text
- [ ] All images have `alt` text
- [ ] Forms have proper labels and error association
- [ ] Focus management implemented in modals and route changes
- [ ] No content flashes more than 3 times per second
- [ ] `lang` attribute on `<html>` element
- [ ] Page title is unique per page
- [ ] Skip navigation link present

## Anti-Patterns to Avoid

- ❌ `<div role="button">` — use `<button>` 
- ❌ `onClick` on non-interactive elements without `onKeyDown`
- ❌ `aria-label` that duplicates visible text exactly (redundant)
- ❌ `tabindex="2"` or higher (breaks natural focus order)
- ❌ Removing focus outline with `outline: none` without a custom alternative
- ❌ Using `display: none` to hide content meant for screen readers (use `.sr-only`)

---

*Community contributed skill. To improve it: `studio contribute skill enterprise-accessibility-standards`*
