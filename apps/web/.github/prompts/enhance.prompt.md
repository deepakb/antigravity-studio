---
description: enhance — strategic code improvement with measurement, surgical precision, and zero regression guarantee
agent: agent
tools: [search/codebase, terminal]
---

# /enhance Workflow

> **Purpose**: Improve existing code — quality, performance, readability, type safety, or capability — while preserving all existing behavior. Every enhancement must leave the codebase measurably better.

## 🎯 When to Use

Use `/enhance` when:
- Existing code works but has quality problems
- Performance is measurable and can be improved
- Technical debt is accumulating
- Type safety is inconsistent
- A feature needs extension without adding new behavior

> For adding new capabilities: use `/create`. For fixing broken behavior: use `/debug`.

---

## Enhancement Categories

Classify before starting — each type has a different execution approach:

| Category | Trigger | Approach |
|----------|---------|----------|
| **Performance** | Slow renders, large bundle, high TTFB | Measure first, optimize second, measure again |
| **Type Safety** | `any` types, missing types, runtime crashes that types would catch | Add types, then Zod schemas |
| **Readability** | Hard to understand, magic numbers, misleading names | Rename → extract → document |
| **Technical Debt** | Dead code, duplicated logic, outdated patterns | Audit → plan → remove incrementally |
| **Feature Extension** | Add new capability to existing abstraction | Follow open/closed — extend, don't modify |
| **DX Improvement** | Developer experience: better errors, clearer APIs | API-first: design the ideal interface, then implement |

---

## Phase 1: Establish Baseline (Never Skip)

Record current state before touching anything:

```
📊 BASELINE — [File/Feature]

Tests:      [N] passing, [N] failing
TypeScript: [N] errors, [N] warnings
Coverage:   [N]% lines, [N]% branches
Bundle:     [Nkb] (if performance-sensitive)
Performance: LCP [Nms] / INP [Nms] / CLS [N] (if UI)

Key behavior to preserve:
1. [Behavior A]
2. [Behavior B]
```

---

## Phase 2: Classify & Plan

State your enhancement plan (no code yet):

```
🔧 ENHANCEMENT PLAN — [Category]

Target: [file or module]
Problem: [specific issue — be precise]
Approach: [how you will fix it]

Files affected: [list]
Risk: Low / Medium / High
Reason for risk level: [why]

Behavioral guarantee: [what will NOT change]
```

> **Rule**: Never rename AND refactor logic in the same step. One change per step.

---

## Phase 3: Execute with Surgical Precision

### For Performance Enhancements:
```tsx
// Step 1: Identify the bottleneck (measure first)
// React DevTools Profiler → find expensive renders
// Lighthouse → find LCP, CLS, INP issues
// bundle-analyzer → find large chunks

// Step 2: Apply targeted fix
// ❌ WRONG — premature optimization
const memoized = useMemo(() => value, []); // non-expensive value

// ✅ RIGHT — profiles confirmed this is expensive
const memoized = useMemo(() => expensiveDerive(largeDataset), [largeDataset]);

// Step 3: Verify the improvement with the same measurement tool
```

### For Type Safety Enhancements:
```typescript
// Progression: any → unknown → specific type → Zod-validated

// Step 1: Find all any types
// Step 2: Replace with unknown + type narrowing
// Step 3: Extract Zod schemas for external data boundaries

// ❌ Before
function process(data: any) {
  return data.name.toUpperCase();
}

// ✅ After
const DataSchema = z.object({ name: z.string() });
type Data = z.infer<typeof DataSchema>;

function process(data: Data): string {
  return data.name.toUpperCase();
}
```

### For Readability Enhancements:
```typescript
// Order: rename → extract → document (never all at once)

// ❌ Before — magic numbers, long function, unclear intent
function calc(x: number, t: string) {
  if (t === 'p') return x * 0.8;
  if (t === 'pr') return x * 0.9;
  return x;
}

// ✅ After — one change at a time
const DISCOUNT_RATES = {
  premium: 0.8,   // 20% discount
  pro: 0.9,       // 10% discount
  free: 1.0,      // no discount
} as const;

type Tier = keyof typeof DISCOUNT_RATES;

function calculateDiscountedPrice(price: number, tier: Tier): number {
  return price * DISCOUNT_RATES[tier];
}
```

---

## Phase 4: Verify Zero Regressions

```bash
# Must pass: exact same test count, all green
npm run test

# Must have: zero new TypeScript errors
npm run typecheck

# Must have: zero new lint warnings
npm run lint

# If performance enhancement: re-run the measurement
studio run bundle-analyzer        # or Lighthouse
```

If any of these fail → **revert the change** before proceeding.

---

## Delivery Format

```markdown
## 🔧 Enhanced: [File/Feature]

**Category**: [Performance / Type Safety / Readability / Technical Debt / Feature Extension]
**Agent**: @[agent-name]

### Before vs After
| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Test count | N | N | +0 (no regressions) |
| TypeScript errors | N | 0 | -N |
| Bundle size | Nkb | Nkb | -Δkb |

### Changes Made
| File | Change | Rationale |
|------|--------|-----------|
| ... | ... | ... |

### What Did NOT Change
[List preserved behaviors to confirm no regressions]
```
