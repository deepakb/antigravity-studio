---
description: a11y-audit — WCAG 2.2 AA accessibility audit with axe-core analysis, keyboard testing, and ARIA pattern fixes
---

# /a11y-audit Workflow

> **Purpose**: Audit the UI for WCAG 2.2 AA accessibility compliance. Every user, regardless of ability, should be able to use {{name}} fully. Accessibility is a legal requirement and a quality standard.

## 🤖 Activation
```
🤖 Applying @accessibility-auditor + @ux-designer + loading wcag-2.2, aria-patterns skills...
```

---

## WCAG 2.2 Levels

| Level | Requirement | Impact |
|-------|-------------|--------|
| **A** | Minimum — must not exclude users | Legal risk |
| **AA** | Standard — our target for all features | Legal compliance |
| **AAA** | Enhanced — aspirational for key flows | Excellence |

---

## Phase 1: Automated Scan

```bash
# Run built-in a11y script
studio run accessibility-audit

# Manual axe-core in browser:
# Install axe DevTools Chrome extension → Run on each page
# OR run in Playwright:
```

```typescript
// tests/a11y/[pagename].a11y.test.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility — [Page Name]', () => {
  test('should have no WCAG 2.2 AA violations', async ({ page }) => {
    await page.goto('/your-page');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
```

---

## Phase 2: Manual Checklist (Automated tools miss ~40% of issues)

### 2.1 Keyboard Navigation
```
TEST: Unplug mouse → navigate using Tab, Shift+Tab, Enter, Space, Arrow keys only

  [ ] Can you reach every interactive element via Tab?
  [ ] Is tab order logical (matches visual/reading order)?
  [ ] Is there a visible focus indicator on every focused element?
  [ ] Can you operate all controls (buttons, links, dropdowns, modals) with keys?
  [ ] Does Tab inside a modal stay within the modal? (focus trap)
  [ ] When modal closes, does focus return to the trigger element?
  [ ] Are skip links present? ("Skip to main content" appears on first Tab)
```

### 2.2 Semantic HTML & ARIA
```tsx
// ❌ WRONG — div used for interaction (no semantics, no keyboard access)
<div onClick={handleClick} className="button">Submit</div>

// ✅ RIGHT — semantic element (keyboard, role, name all automatic)
<button type="submit" onClick={handleClick}>Submit</button>

// ❌ WRONG — icon button with no accessible name
<button onClick={toggleMenu}><MenuIcon /></button>

// ✅ RIGHT — aria-label provides accessible name
<button onClick={toggleMenu} aria-label="Open navigation menu">
  <MenuIcon aria-hidden="true" />
</button>

// ❌ WRONG — form field with no label
<input type="email" placeholder="Enter email" />

// ✅ RIGHT — associated label
<label htmlFor="email">Email address</label>
<input id="email" type="email" autoComplete="email" />

// ✅ RIGHT — fieldset + legend for grouped inputs
<fieldset>
  <legend>Notification preferences</legend>
  <label><input type="checkbox" name="email" /> Email</label>
  <label><input type="checkbox" name="sms" /> SMS</label>
</fieldset>
```

### 2.3 Color & Contrast
```
Minimum requirements (WCAG 2.2 AA):
  Normal text (< 18pt regular / < 14pt bold): contrast ratio ≥ 4.5:1
  Large text (≥ 18pt regular / ≥ 14pt bold):  contrast ratio ≥ 3:1
  UI components and icons:                     contrast ratio ≥ 3:1
  
Tools:
  - Chrome DevTools → CSS Overview → Colors (shows contrast failures)
  - https://contrast.tools/
  - axe DevTools browser extension

  [ ] Test all text colors against their backgrounds
  [ ] Never use color alone to convey meaning (error states, status)
  [ ] Error state: use color + icon + text message
```

### 2.4 Images & Media
```tsx
// ❌ WRONG — missing alt text
<img src="/hero.jpg" />
<Image src="/hero.jpg" alt="" />  // empty is wrong for informational images

// ✅ RIGHT — descriptive alt for informational images
<Image src="/hero.jpg" alt="Team working in modern office" />

// ✅ RIGHT — empty alt for decorative images (screen readers skip)
<Image src="/decoration.png" alt="" role="presentation" />

// ✅ RIGHT — complex charts/graphs need text alternative
<figure>
  <Image src="/chart.png" alt="Bar chart showing sales growth" />
  <figcaption>
    Q4 2024 sales: $1.2M (+23% vs Q3). Detailed data in table below.
  </figcaption>
</figure>
```

### 2.5 Forms & Error Handling
```tsx
// ✅ RIGHT — form with proper error association
<div>
  <label htmlFor="password">Password</label>
  <input
    id="password"
    type="password"
    aria-describedby="password-hint password-error"
    aria-invalid={!!errors.password}
    aria-required="true"
  />
  <p id="password-hint" className="hint">Must be 8+ characters</p>
  {errors.password && (
    <p id="password-error" role="alert" className="error">
      {errors.password.message}
    </p>
  )}
</div>
```

### 2.6 Dynamic Content & Announcements
```tsx
// Status messages announced to screen readers
// ✅ Toast / notification
<div role="status" aria-live="polite" aria-atomic="true">
  {message && <span>{message}</span>}
</div>

// ✅ Loading state
<div aria-live="polite">
  {isLoading ? (
    <span role="status">Loading results, please wait...</span>
  ) : (
    <span role="status">{results.length} results found</span>
  )}
</div>
```

---

## Phase 3: Report Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
♿ Accessibility Audit — {{name}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Automated (axe-core):
  Violations:  N (N critical, N serious, N moderate)
  Passes:      N

Manual Findings:
  Critical (must fix): N
  Serious:             N
  Moderate:            N

FINDING #1 — Missing focus indicator
  Severity: 🔴 Critical (keyboard users cannot see where they are)
  WCAG:     2.4.11 Focus Appearance (AA)
  Element:  .btn-primary
  Fix:      Add focus-visible ring (CSS: outline: 2px solid #0070f3)

FINDING #2 — [description]
  ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall: ✅ Pass (0 critical) | ⚠️ Needs work | ❌ Fail
```
