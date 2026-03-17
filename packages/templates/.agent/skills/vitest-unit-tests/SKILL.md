# SKILL: Vitest Unit Tests

## Overview
Advanced **Vitest** configuration and patterns for TypeScript unit and integration testing across React (frontend) and Node.js (backend) applications. The successor to Jest — faster, ESM-native, and Vite-powered.

## Setup & Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,          // No need to import describe/it/expect
    environment: 'jsdom',   // For React tests; use 'node' for pure Node.js
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e/**'],

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      thresholds: { lines: 80, functions: 80, branches: 70 },
      exclude: ['**/*.d.ts', '**/types/**', '**/*.config.ts', 'src/test/**'],
    },

    // Aliases (match tsconfig paths)
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## Setup File
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'; // Custom DOM matchers: toBeInTheDocument()
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { server } from './mocks/server'; // MSW mock server

// Clean up DOM after each test
afterEach(() => cleanup());

// MSW Server lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock global browser APIs not available in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })),
});
```

## Core Testing Patterns

### Spies and Mocks
```typescript
import { vi, expect, describe, it, beforeEach } from 'vitest';

describe('NotificationService', () => {
  // ✅ Module mock — replace before importing the module
  vi.mock('@/lib/db', () => ({
    db: {
      notification: {
        create: vi.fn().mockResolvedValue({ id: '1', type: 'EMAIL' }),
        findMany: vi.fn().mockResolvedValue([]),
      },
    },
  }));

  // ✅ Spy on implementation — doesn't replace, just monitors
  it('logs a warning when rate-limited', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    triggerRateLimit();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('rate limit'));
    consoleSpy.mockRestore();
  });

  // ✅ Mock external HTTP calls via MSW (not vi.mock of fetch)
});
```

### Time-Dependent Tests
```typescript
import { vi, beforeEach, afterEach } from 'vitest';

describe('TokenExpiry', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('marks token as expired after 1 hour', () => {
    const token = createToken({ expiresIn: '1h' });
    vi.advanceTimersByTime(61 * 60 * 1000); // Advance 61 minutes
    expect(isTokenExpired(token)).toBe(true);
  });

  it('freezes time for date tests', () => {
    vi.setSystemTime(new Date('2025-01-15T12:00:00Z'));
    expect(formatRelativeDate(new Date('2025-01-14'))).toBe('yesterday');
  });
});
```

### Snapshot Testing
```typescript
// ✅ Good for: utility output, generated strings, large object structures
it('generates correct email template', () => {
  const html = generateWelcomeEmail({ name: 'Alice', planName: 'Pro' });
  expect(html).toMatchSnapshot(); // First run creates; subsequent runs compare

  // Inline snapshot (preferred for small values — avoids separate .snap file)
  expect(formatCurrency(1234.56, 'USD')).toMatchInlineSnapshot(`"$1,234.56"`);
});
```

### Test Data Factories
```typescript
// src/test/factories.ts — create consistent test data
import { faker } from '@faker-js/faker';

export function createUser(overrides: Partial<User> = {}): User {
  return {
    id: faker.string.cuid(),
    name: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,   // ← Easy to customize specific fields in tests
  };
}

export function createPost(overrides: Partial<Post> = {}): Post {
  return {
    id: faker.string.cuid(),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(3),
    published: false,
    authorId: faker.string.cuid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// Usage in tests:
const adminUser = createUser({ role: 'ADMIN' });
const publishedPost = createPost({ published: true, authorId: adminUser.id });
```

### In-Memory Repository (for Use Case Tests)
```typescript
// src/test/repositories/InMemoryUserRepository.ts
type MockUser = User & { _deleted?: boolean };

export class InMemoryUserRepository implements IUserRepository {
  private store = new Map<string, MockUser>();

  async findById(id: string) {
    const user = this.store.get(id);
    return user && !user._deleted ? user : null;
  }

  async save(user: User) {
    this.store.set(user.id, user);
    return user;
  }

  async delete(id: string) {
    const user = this.store.get(id);
    if (user) this.store.set(id, { ...user, _deleted: true });
  }

  // Test utilities
  clear() { this.store.clear(); }
  all() { return [...this.store.values()].filter(u => !u._deleted); }
}
```

## Running Tests
```bash
npm run test                  # Watch mode
npm run test:coverage         # With coverage report
npm run test -- --reporter=verbose  # Verbose output
npm run test -- UserService   # Filter by name
npm run test -- --run         # Single run (no watch — for CI)
```
