---
description: enhance — improve, refactor, or extend existing code without breaking behavior
---

# /enhance Workflow

> **Purpose**: Improve existing code quality, performance, readability, or add capabilities while preserving all existing behavior. No regressions allowed.

## Execution Steps

### Step 1: Establish a Baseline
Before changing anything:
- [ ] Run existing tests → all must pass (record the count)
- [ ] Note current bundle size if performance-sensitive
- [ ] Capture current behavior with a brief description

### Step 2: Classify the Enhancement
Determine what category this is:
- **Performance** → profile first, optimize second, measure after
- **Readability** → rename, extract function, add types, remove magic numbers
- **Feature Extension** → add capability without breaking existing
- **Technical Debt** → remove dead code, simplify logic, modernize patterns
- **Type Safety** → add types, remove `any`, add Zod schemas

### Step 3: Enhance with Surgical Precision
Rules:
- Change ONE thing at a time (makes review easy and rollback possible)
- Never rename AND refactor logic in the same commit
- Preserve public API surface — internal refactors only
- Add JSDoc if the code isn't obviously self-documenting

### Step 4: Verify Zero Regressions
```bash
npm run test            # Same count as before, all green
npm run typecheck       # Zero new errors  
npm run lint            # Zero new warnings
```

### Step 5: Output Enhancement Report
```
🔧 Enhancement Summary: [file/feature]
   Before: [what the code did / metrics]
   After:  [what changed / metrics]
   Tests:  [added/modified]
   No behavioral changes: ✅
```
