# SKILL: Accessibility (WCAG 2.2)

## Overview
Practical implementation guide for **WCAG 2.2 AA** accessibility compliance in TypeScript/React. This skill contains the most critical patterns with code-ready fixes.

## POUR Principles Checklist

### Perceivable
```tsx
// ✅ Non-text content: alt text
<Image src="/chart.png" alt="Bar chart showing sales growth of 34% from Q1 to Q2 2025" />
<Image src="/decorative-wave.svg" alt="" role="presentation" />

// ✅ Captions for video
<video controls>
  <track kind="captions" src="/captions-en.vtt" srclang="en" label="English" default />
</video>

// ✅ Color is NOT the sole indicator
// ❌ "Required fields are shown in red"
// ✅ "Required fields are marked with * and shown in red"
<label>Email <span aria-label="required" className="text-red-500">*</span></label>
```

### Operable
```tsx
// ✅ All interactive elements keyboard accessible
// ✅ Focus visible at all times
.focus-ring {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2;
}

// ✅ Skip navigation link
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded"
>
  Skip to main content
</a>
<main id="main-content">...</main>

// ✅ No keyboard trap (except modals — which intentionally trap)
// ✅ No time limits (or pauseable/extendable)
// ✅ Avoid flashing content (< 3 flashes per second)
```

### Understandable
```tsx
// ✅ Language declared on html element
<html lang="en">

// ✅ Error suggestion — tell users HOW to fix errors
// ❌ "Invalid input"
// ✅ "Email must include @. Example: user@example.com"
<p role="alert">Email must include @. Example: user@example.com</p>

// ✅ Consistent navigation — same menu, same order, on every page
// ✅ Predictable behavior — clicking a link navigates, not plays audio
```

### Robust
```tsx
// ✅ Valid HTML — won't crash assistive technology
// ✅ Name, Role, Value for all components
<button
  type="button"
  aria-label="Close notification"  // Name
  aria-pressed={isExpanded}        // State
  aria-expanded={isExpanded}       // Property
  role="button"                    // Role (implicit for <button>)
  onClick={handleClose}
>
  <X aria-hidden="true" />         // Hide icon from screen reader
</button>
```

## ARIA Patterns Quick Reference
```tsx
// Alert — urgent, interrupts screen reader
<div role="alert" aria-live="assertive">Error: Your session expired.</div>

// Status — non-urgent announcement
<div role="status" aria-live="polite">Your changes have been saved.</div>

// Form with complete ARIA
<form>
  <label htmlFor="email">Email <span aria-label="required">*</span></label>
  <input
    id="email"
    type="email"
    required
    aria-required="true"
    aria-describedby="email-hint email-error"
    aria-invalid={!!errors.email}
  />
  <p id="email-hint" className="text-sm text-muted">Enter your work email address</p>
  {errors.email && (
    <p id="email-error" role="alert" className="text-sm text-destructive">
      {errors.email}
    </p>
  )}
</form>
```
