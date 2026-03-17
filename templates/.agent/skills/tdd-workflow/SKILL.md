# SKILL: TDD Workflow (Test-Driven Development)

## Overview
A strict guide to **Test-Driven Development (TDD)** in TypeScript. The goal is to drive design through tests, ensuring code is decoupled exactly to the degree that makes it testable.

## The Testing Pyramid
```
   /\      E2E (Playwright) — 5%, Slow, Tests full user journeys
  /  \     Integration (Supertest/MSW) — 25%, Medium, Tests feature boundaries
 /____\    Unit (Vitest/RTL) — 70%, Fast, Tests logic and state
```

## The Red-Green-Refactor Cycle

### Phase 1: RED (Write the Test FIRST)
1. Write a failing test for the next smallest piece of functionality
2. It MUST fail (if it passes, either the code already does it, or the test is broken)
3. **DO NOT** write the whole test file at once. Write ONE test.

```typescript
// math.test.ts
import { test, expect } from 'vitest';
// ❌ Error: Cannot find module './math'
import { add } from './math';

test('adds two positive numbers', () => {
  expect(add(2, 3)).toBe(5);
});
```

### Phase 2: GREEN (Make it Pass)
1. Write the **minimum** amount of code to make the test pass
2. Do not generalize yet (hardcoding is okay if the test passes!)
3. Do not worry about design, speed, or elegance

```typescript
// math.ts
// ✅ Test passes!
export function add(a: number, b: number): number {
  return a + b;
}
```

### Phase 3: REFACTOR (Make it Better)
1. Improve the code structure without adding new features
2. Remove duplication, extract functions, improve names
3. The test ensures you didn't break anything during refactoring
4. Add the next test (e.g., negative numbers), repeat cycle.

## TDD Anti-Patterns

### ❌ The Ice Cream Cone (Inverted Pyramid)
Writing mostly E2E UI tests through Playwright, and very few unit tests. This leads to extremely slow, flaky CI pipelines that take 45+ minutes to run.

### ❌ Testing Implementation Details
Testing *how* something is done, rather than *what* it does.
```tsx
// ❌ BAD: Testing internal state
const { result } = renderHook(() => useCounter());
expect(result.current.state.count).toBe(0);

// ✅ GOOD: Testing public API
act(() => result.current.increment());
expect(result.current.count).toBe(1);
```

### ❌ Mocking Everything
If you mock the database, the network, the file system, and the child components, your test will pass, but production will crash.
- Prefer **In-Memory Fakes** (e.g., `InMemoryUserRepository`) over Jest mocks.
- Prefer **MSW** (Mock Service Worker) over mocking `fetch()`.

## TDD in React: The "Outside-In" Approach
When building a new React feature using TDD:

1. **Start at the Component Boundary:**
   Write an RTL test that asserts the UI renders correctly.
   *(Test fails: Component doesn't exist)*
2. **Build the Shell Component:**
   Create an empty component that returns the static text required.
   *(Test passes)*
3. **Add Interaction Requirements:**
   Write a test that clicks a button and expects a loading state.
   *(Test fails: Button doesn't do anything)*
4. **Implement Interaction:**
   Add state and event handlers.
   *(Test passes)*
5. **Add Data Fetching Requirements:**
   Write a test that expects data fetching via MSW mock.
   *(Test fails: MSW call not made)*
6. **Implement Data Fetching:**
   Add TanStack Query or `useEffect`.
   *(Test passes)*
7. **Refactor:**
   Extract complex logic into custom hooks. The component tests ensure the hooks work.
   *(Tests ensure safety)*
8. **Unit Test Edge Cases:**
   If the custom hook has complex math/logic, write isolated Vitest unit tests for the hook.

## The TDD "Ping Pong" Method (Pair Programming)
- Dev A writes a failing test.
- Dev B writes the code to make it pass.
- Dev B refactors.
- Dev B writes the next failing test.
- Dev A writes the code to pass it.
- Dev A refactors, and so on.
