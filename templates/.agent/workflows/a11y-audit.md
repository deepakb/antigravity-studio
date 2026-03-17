---
description: a11y-audit — WCAG 2.2 AA accessibility audit and remediation
---

# /a11y-audit Workflow

> **Purpose**: Perform a systematic WCAG 2.2 AA accessibility audit and produce a prioritized remediation plan.

## Activate: @accessibility-auditor Agent

## Execution Steps

### Step 1: Automated Scan
```bash
# Axe-core via Playwright
npx playwright test --grep "a11y"  # If a11y tests exist

# Or run axe directly:
npx axe http://localhost:3000 --stdout
npx axe http://localhost:3000/dashboard --stdout
```

### Step 2: Manual Keyboard Navigation Test
Walk through these manually:
- [ ] Tab through the page — does focus order make sense?
- [ ] Can you reach every interactive element with keyboard only?
- [ ] Is focus visible at all times? (never hidden by CSS)
- [ ] Do modals trap focus correctly? (can you Tab out? You shouldn't be able to)
- [ ] Skip navigation link present and functional?

### Step 3: Screen Reader Test
Test with:
- **macOS**: VoiceOver (Cmd+F5)
- **Windows**: NVDA (free) or Narrator
- **Mobile**: VoiceOver (iOS), TalkBack (Android)

Verify:
- [ ] All images announced (meaningful alt or "decorative" role)
- [ ] Form fields introduced by their label
- [ ] Errors announced when form submitted
- [ ] Dynamic content updates announced (aria-live)
- [ ] Page title changes on navigation

### Step 4: Color Contrast Check
```bash
# Use browser DevTools > Accessibility panel
# Or: https://webaim.org/resources/contrastchecker/
# Required ratios:
# - Normal text (< 18px / 14px bold): 4.5:1
# - Large text (≥ 18px / 14px bold): 3:1
# - UI components (inputs, icons): 3:1
```

### Step 5: Categorize Findings
```
CRITICAL (blocks users with disabilities)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ ] Interactive element not keyboard accessible
[ ] Form field with no label
[ ] Color used as sole means of communication

HIGH (significant barrier)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ ] Color contrast below 4.5:1 for body text
[ ] Missing error announcements
[ ] Modal does not trap or restore focus

MEDIUM (partial barrier)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ ] Missing alt text on decorative images
[ ] Poor focus indicator style
[ ] Missing page title

LOW (enhancement)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ ] Missing skip navigation link
[ ] Heading order skips levels (h2 → h4)
```

### Step 6: Remediate & Verify
After fixes:
- Re-run automated scan
- Re-test manually with keyboard
- Add axe-core assertions to existing E2E tests

```typescript
// Add to Playwright tests for regression prevention
import AxeBuilder from '@axe-core/playwright';

test('login page has no accessibility violations', async ({ page }) => {
  await page.goto('/login');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```
