---
description: debug — systematic root cause analysis using evidence-based debugging protocol
agent: agent
tools: [search/codebase, terminal]
---

# /debug Workflow

> **Purpose**: Identify the true root cause of a bug — not just suppress the symptom. Use structured investigation before touching any code.

## 🎯 When to Use

Invoke `/debug` when:
- There's an error message, stack trace, or unexpected behavior
- Something that worked before is now broken
- A user reports a bug
- Test is failing for unclear reasons

---

## Phase 1: Evidence Collection (No Guessing)

**Activates**: `@debugger` + relevant domain specialist

```
🔍 DEBUG SESSION: {{name}}

SYMPTOMS:
  Error: [exact error message + stack trace]
  Behavior: [what happens vs. what was expected]
  Reproduction: [steps to reliably reproduce]
  Environment: [dev / staging / production? Browser? Node version?]

CONTEXT:
  When did it start? [after which change / deploy]
  What changed recently? [git log, recent PRs]
  Is it consistent or intermittent?
```

Do NOT propose a fix until all evidence is collected.

---

## Phase 2: Root Cause Analysis

Apply the **5-Why Method** — ask "why" until you reach the systemic root:

```
Why 1: Why is the error occurring?
  → [immediate cause]

Why 2: Why is [immediate cause] happening?
  → [underlying cause]

Why 3: Why does [underlying cause] exist?
  → [system-level reason]

Root Cause: [The actual thing to fix]
Category:   [ ] Type error  [ ] Logic bug  [ ] Race condition
            [ ] Missing null check  [ ] Wrong assumption  [ ] External dependency
```

If root cause is unclear after 5-Why → apply **Binary Search**: comment out half the code path and narrow the failing scope.

---

## Phase 3: Hypothesis & Verification Plan

Before changing code, state the hypothesis:

```
HYPOTHESIS:
  Root cause: [specific statement]
  Fix: [one-line description of change needed]
  
VERIFICATION PLAN:
  1. Make the fix
  2. Reproduce the original bug scenario → confirm it no longer occurs
  3. Run related tests → confirm nothing else breaks
  4. Check edge cases: [list 2-3]
```

---

## Phase 4: Fix (Minimal Scope)

Implement the fix as surgically as possible:
- Change **only what is needed** to fix the root cause
- Do not refactor unrelated code during a debug session
- Add a comment explaining WHY the fix works (not just what it does)

```typescript
// FIX: [brief explanation of what root cause was and why this resolves it]
// Previously: [what the code was doing wrong]
```

---

## Phase 5: Test & Prevent Regression

```
1. [ ] Reproduce the original bug scenario → no longer occurs
2. [ ] Existing tests still pass
3. [ ] Add a specific test for this bug (regression test)
4. [ ] Check adjacent code for the same pattern (don't fix just one instance)
```

Regression test naming:
```typescript
it('should not [bug behavior] when [condition]', () => { ... });
// e.g.: it('should not throw when user is null', () => { ... })
```

---

## Delivery Format

```markdown
## 🐛 Bug Fixed: [Short Description]

### Root Cause
[One clear sentence describing the actual root cause]

### Fix Applied
| File | Lines Changed | What Changed |
|------|---------------|--------------|

### Why This Works
[Brief explanation connecting the fix to the root cause]

### Regression Test Added
`[test file path]` — test name: "[test description]"

### How to Verify
[Steps to confirm the bug is gone]
```

> **Principle**: A bug fixed without a regression test is a bug that can return.
