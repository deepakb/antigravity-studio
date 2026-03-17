---
description: debug — systematic reproduction, diagnosis, fix, and prevention of bugs
---

# /debug Workflow

> **Purpose**: Systematically find and fix the root cause of a bug. Never guess. Always verify. Always add a regression test.

## Activate: @debugger Agent

## Execution Steps

### Step 1: Reproduce (Before Anything Else)
- [ ] Can you reproduce the bug consistently? If not, gather more info first.
- [ ] What is the minimum input to trigger it?
- [ ] Does it happen in dev? Prod? Both?

### Step 2: Isolate
Narrow down where the bug lives:
```
Browser?    → Open DevTools → Console tab → Network tab
Server?     → Check server logs → Check database state
Rendering?  → Add React DevTools → Check component props
TypeScript? → Run `npm run typecheck` → Find type errors
Build?      → Run `npm run build` → Find build errors
```

### Step 3: Form Hypotheses (3 Max)
State 3 causes ranked by likelihood. For each:
- Evidence supporting it
- The single cheapest test to confirm/deny

### Step 4: Test Hypothesis (Binary Search)
Add targeted debug output — never scatter logs everywhere:
```typescript
// Targeted debug — remove before committing
console.log('[DEBUG auth]', { session, userId, hasAccess });
```

### Step 5: Fix Root Cause
Fix only what caused the bug. Do NOT:
- Refactor adjacent code
- Add workarounds (`setTimeout`, `try/catch` hiding errors)
- Suppress TypeScript errors with `// @ts-ignore`

### Step 6: Write Regression Test
```typescript
// ✅ This test MUST have failed before the fix
describe('edge case that caused the bug', () => {
  it('returns null for empty user', () => {
    expect(formatUser(null)).toBeNull(); // not throw
  });
});
```

### Step 7: Report
```
🐛 Bug Fix Report
   Symptom: [what the user observed]
   Root Cause: [exact cause]
   Files Changed: [list]
   Fix: [brief description]
   Test Added: [test name]
```
