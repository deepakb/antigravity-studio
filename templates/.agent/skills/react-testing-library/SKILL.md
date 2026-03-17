# SKILL: React Testing Library

## Overview
Production-grade **React Testing Library (RTL) v16** + **user-event v14** + **MSW** patterns. The goal: test behavior from the user's perspective, not implementation details.

## Core Philosophy
```
✅ Test what users SEE and DO (find by role, label, text)
✅ Test BEHAVIORS (submit form → shows success message)
❌ DON'T test implementation (don't assert on state, refs, or method calls)
❌ DON'T find by className or data-testid (last resort only)
```

## Query Priority (Most to Least Preferred)
```
1. getByRole          → getByRole('button', { name: 'Submit' })  ← Best — tests a11y too
2. getByLabelText     → getByLabelText('Email address')          ← For form inputs
3. getByPlaceholderText → getByPlaceholderText('Search...')      ← If no label
4. getByText          → getByText('Welcome back!')               ← For static text
5. getByDisplayValue  → getByDisplayValue('Alice')               ← Current form value
6. getByAltText       → getByAltText('Company logo')             ← For images
7. getByTitle         → getByTitle('Close modal')                ← Last resort
8. getByTestId        → getByTestId('submission-id')             ← Absolute last resort
```

## Component Test Pattern (Complete)
```tsx
// UserProfile.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from './UserProfile';
import { QueryWrapper } from '@/test/QueryWrapper';

// ✅ Shared test wrapper to provide QueryClient, theme, etc.
const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: QueryWrapper });
};

describe('UserProfile', () => {
  it('renders user information', () => {
    renderWithProviders(<UserProfile user={{ name: 'Alice', email: 'alice@example.com' }} />);

    expect(screen.getByRole('heading', { name: 'Alice' })).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('shows edit mode when Edit button clicked', async () => {
    const user = userEvent.setup();  // ✅ Always use userEvent.setup() for v14+
    renderWithProviders(<UserProfile user={{ name: 'Alice', email: 'alice@example.com' }} />);

    await user.click(screen.getByRole('button', { name: 'Edit profile' }));

    // Input should now be visible
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('submits updated profile', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    renderWithProviders(<UserProfile user={{ name: 'Alice', email: 'alice@example.com' }} onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: 'Edit profile' }));
    await user.clear(screen.getByRole('textbox', { name: 'Name' }));
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Alicia');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Alicia' }));
    });
  });

  it('shows validation error for empty name', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserProfile user={{ name: 'Alice', email: 'alice@example.com' }} />);

    await user.click(screen.getByRole('button', { name: 'Edit profile' }));
    await user.clear(screen.getByRole('textbox', { name: 'Name' }));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Name is required');
  });
});
```

## Async Testing Patterns
```tsx
describe('PostList', () => {
  it('shows loading skeleton then posts', async () => {
    renderWithProviders(<PostList />);

    // Loading state
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();

    // Wait for data to load
    await screen.findByRole('list');  // ✅ findBy* = waitFor + getBy (returns Promise)
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('shows empty state when no posts', async () => {
    // MSW handler override for this specific test
    server.use(
      http.get('/api/posts', () => HttpResponse.json({ data: [] }))
    );

    renderWithProviders(<PostList />);
    await screen.findByText('No posts yet');
    expect(screen.getByRole('link', { name: 'Create your first post' })).toBeInTheDocument();
  });

  it('shows error state on API failure', async () => {
    server.use(
      http.get('/api/posts', () => new HttpResponse(null, { status: 500 }))
    );

    renderWithProviders(<PostList />);
    await screen.findByRole('alert');
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
```

## MSW (Mock Service Worker) Setup
```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Default handlers — used unless overridden in specific tests
  http.get('/api/posts', () => {
    return HttpResponse.json({
      data: [
        { id: '1', title: 'First Post', published: true },
        { id: '2', title: 'Draft Post', published: false },
      ]
    });
  }),

  http.post('/api/posts', async ({ request }) => {
    const body = await request.json() as CreatePostInput;
    return HttpResponse.json({
      data: { id: '3', ...body, createdAt: new Date().toISOString() }
    }, { status: 201 });
  }),

  http.get('/api/users/me', () => {
    return HttpResponse.json({
      data: { id: '1', name: 'Alice Chen', email: 'alice@example.com', role: 'USER' }
    });
  }),
];

// src/test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
export const server = setupServer(...handlers);
```

## Testing Hooks with renderHook
```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCounter } from './useCounter';

test('increments count', () => {
  const { result } = renderHook(() => useCounter(0));

  act(() => result.current.increment());
  expect(result.current.count).toBe(1);

  act(() => result.current.decrement());
  expect(result.current.count).toBe(0);
});

// For hooks that use React Query, TanStack Query, etc.:
test('fetches user data', async () => {
  const { result } = renderHook(() => useUser('user-1'), {
    wrapper: QueryWrapper, // Wrap with providers
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.name).toBe('Alice Chen');
});
```

## TestProvider Pattern
```tsx
// src/test/QueryWrapper.tsx — shared provider for all tests
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';

export function QueryWrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },  // Disable retry + caching in tests
      mutations: { retry: false },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```
