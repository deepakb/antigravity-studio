---
description: generate-tests — generate comprehensive unit and integration tests for existing code
---

# /generate-tests Workflow

> **Purpose**: Write comprehensive unit and integration tests for existing code, achieving minimum 80% branch coverage.

## Activate: @qa-engineer Agent

## Execution Steps

### Step 1: Analyze Code Under Test
Read the target file and identify:
- [ ] All exported functions and their signatures
- [ ] All branches (if/else, switch, ternary, guard clauses)
- [ ] All error conditions and thrown exceptions
- [ ] External dependencies to mock

### Step 2: Plan Test Cases
For every function, generate test cases:
```
Function: calculateDiscount(price, tier)
├── Happy paths:
│   ├── Premium tier → 20% discount
│   ├── Pro tier → 10% discount
│   └── Free tier → no discount
├── Edge cases:
│   ├── price = 0 → returns 0
│   ├── price < 0 → throws Error
│   └── invalid tier → returns price unchanged
└── Types:
    └── TypeScript ensures string/number types at compile time
```

### Step 3: Write Tests (Vitest + RTL)

```typescript
// [filename].test.ts — co-located with source
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('[FunctionName]', () => {
  // ✅ Each describe block = one function or component
  // ✅ Each it block = one behavior (not one line of code)

  describe('when user is premium', () => {
    it('applies 20% discount', () => { ... });
    it('returns 0 for zero-price items', () => { ... });
  });

  describe('when input is invalid', () => {
    it('throws for negative price', () => {
      expect(() => calculateDiscount(-10, 'premium')).toThrow('Price must be positive');
    });
  });
});
```

### Step 4: Mock Strategy
```typescript
// ✅ Mock at the boundary (DB, external APIs, time)
vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn().mockResolvedValue({ id: '1', name: 'Alice' }),
    },
  },
}));

// ✅ Use msw for HTTP mocking (not vi.mock of fetch)
// ✅ Mock time for date-dependent tests
vi.setSystemTime(new Date('2025-01-01'));
```

### Step 5: Run and Report Coverage
```bash
npm run test -- --coverage
```
Minimum thresholds: 80% lines, 80% functions, 70% branches

### Output
```
🧪 Tests Generated: [filename]
   Functions covered: N/M (X%)
   Branches covered: N/M (X%)
   Tests added: [count]
   Run: npm test [file]
```
