---
description: generate-tests — full testing pyramid with unit, integration, and component tests using Vitest and React Testing Library
agent: agent
tools: [search/codebase, terminal]
---

# /generate-tests Workflow

> **Purpose**: Generate a comprehensive, meaningful test suite that gives real confidence — not just coverage numbers. Tests should validate behavior, not implementation details.

## 🤖 Activation
```
🤖 Applying @qa-engineer + loading testing-patterns, tdd-workflow skills...
```

---

## Testing Philosophy (Non-Negotiable)

```
Testing Trophy (from bottom):
  Static Analysis (TypeScript, ESLint)    ← Cheapest, highest ROI
  Unit Tests (business logic, utilities)  ← Fast, isolated
  Integration Tests (API routes, DB)      ← Most important for confidence
  E2E Tests (critical user flows)         ← See /generate-e2e
```

> **Rule**: Test behavior, not implementation. A test that breaks when you rename a variable is a bad test. A test that breaks when behavior changes is a good test.

---

## Phase 1: Analyze Code Under Test

Before writing a single test:

```
📋 TEST PLAN — [target file/module]

EXPORTS TO TEST:
  ├── [functionA(args)] → [return type]  [complexity: simple/complex]
  ├── [functionB(args)] → [return type]  [complexity: simple/complex]
  └── [ComponentC]                       [interactions to test]

DEPENDENCIES TO MOCK:
  ├── Database (Prisma) → mock at module level
  ├── External API (fetch) → use msw handlers
  ├── Auth session → mock the auth() function
  └── Time (Date.now) → vi.useFakeTimers()

BRANCHES TO COVER:
  ├── Happy path: [describe]
  ├── Error path: [describe]
  ├── Edge cases: [list nulls, empty arrays, boundary values]
  └── Auth states: [authenticated / unauthenticated / unauthorized role]
```

---

## Phase 2: Unit Tests — Business Logic & Utilities

```typescript
// [module-name].test.ts — co-located with source
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateDiscount, applyPromoCode } from './pricing';

describe('calculateDiscount', () => {
  describe('when user is on premium tier', () => {
    it('applies 20% discount to positive prices', () => {
      expect(calculateDiscount(100, 'premium')).toBe(80);
    });

    it('returns 0 for zero-price items', () => {
      expect(calculateDiscount(0, 'premium')).toBe(0);
    });
  });

  describe('when input is invalid', () => {
    it('throws for negative prices', () => {
      expect(() => calculateDiscount(-10, 'premium')).toThrow('Price must be positive');
    });

    it('throws for unknown tier', () => {
      // @ts-expect-error — testing runtime invalid input
      expect(() => calculateDiscount(100, 'unknown')).toThrow('Invalid tier');
    });
  });
});
```

---

## Phase 3: Integration Tests — API Routes

```typescript
// app/api/posts/__tests__/route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '../route';
import { NextRequest } from 'next/server';

// Mock at module boundary — not at implementation detail
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));
vi.mock('@/lib/db', () => ({
  db: {
    post: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

describe('POST /api/posts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null);
    const req = new NextRequest('http://localhost/api/posts', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test Post' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('creates post for authenticated user', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any);
    vi.mocked(db.post.create).mockResolvedValue({
      id: 'post-1', title: 'Test Post', userId: 'user-1'
    } as any);

    const req = new NextRequest('http://localhost/api/posts', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test Post' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(await res.json()).toMatchObject({ id: 'post-1', title: 'Test Post' });
  });

  it('returns 400 for invalid body', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as any);
    const req = new NextRequest('http://localhost/api/posts', {
      method: 'POST',
      body: JSON.stringify({ title: '' }), // empty title — should fail Zod
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
```

---

## Phase 4: Component Tests — React Testing Library

```typescript
// components/PostCard/__tests__/PostCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PostCard } from '../PostCard';

describe('PostCard', () => {
  const post = { id: '1', title: 'Test Post', author: 'Alice', publishedAt: new Date('2025-01-01') };

  it('renders title and author', () => {
    render(<PostCard post={post} />);
    expect(screen.getByRole('heading', { name: 'Test Post' })).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<PostCard post={post} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith('1');
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('shows formatted date', () => {
    render(<PostCard post={post} />);
    // Test what the user sees, not implementation details
    expect(screen.getByText(/January 1, 2025/i)).toBeInTheDocument();
  });
});
```

---

## Phase 5: Mock Strategy Reference

```typescript
// ─── Database (Prisma) ───────────────────────────────────
vi.mock('@/lib/db', () => ({
  db: { user: { findUnique: vi.fn(), create: vi.fn() } }
}));

// ─── HTTP (external APIs) with msw ──────────────────────
// setup-msw.ts
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const server = setupServer(
  http.get('https://api.stripe.com/v1/customers', () => {
    return HttpResponse.json({ data: [{ id: 'cus_123' }] });
  })
);

// ─── Authentication ──────────────────────────────────────
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
// Then per-test: vi.mocked(auth).mockResolvedValue({ user: { id: 'u1', role: 'admin' } });

// ─── Time ────────────────────────────────────────────────
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());
vi.setSystemTime(new Date('2025-06-01T12:00:00Z'));

// ─── Next.js Router ──────────────────────────────────────
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
}));
```

---

## Phase 6: Coverage & Quality Check

```bash
npx vitest run --coverage
```

Coverage targets (minimum):
| Metric | Target |
|--------|--------|
| Statements | 80% |
| Branches | 70% |
| Functions | 80% |
| Lines | 80% |

> Coverage is a floor, not a ceiling. 100% coverage with bad assertions is worse than 70% with strong behavioral assertions.

---

## Delivery Format

```markdown
## 🧪 Tests Generated: [Module Name]

**Agent**: @qa-engineer

### Coverage Summary
| Layer | Tests | Statements | Branches |
|-------|-------|------------|---------|
| Unit | N | N% | N% |
| Integration | N | N% | N% |
| Component | N | N% | N% |

### Key Behaviors Tested
- [Behavior 1 — how tested]
- [Behavior 2 — how tested]

### Mocks Used
- [What was mocked and why]

### Run Tests
\`\`\`bash
npx vitest [test-file-pattern]
npx vitest run --coverage
\`\`\`
```
