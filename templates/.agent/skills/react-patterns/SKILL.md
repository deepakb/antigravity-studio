# SKILL: React Patterns

## Overview
Curated modern React patterns for TypeScript applications. Load for component architecture, hooks, and composition patterns.

## Component Composition Patterns

### Compound Components
```tsx
// Parent controls shared state; children access via context
const TabContext = createContext<{ active: string; setActive: (id: string) => void } | null>(null);

function Tabs({ children, defaultTab }: { children: React.ReactNode; defaultTab: string }) {
  const [active, setActive] = useState(defaultTab);
  return <TabContext.Provider value={{ active, setActive }}>{children}</TabContext.Provider>;
}

function Tab({ id, children }: { id: string; children: React.ReactNode }) {
  const ctx = use(TabContext);
  if (!ctx) throw new Error('Tab must be inside Tabs');
  return (
    <button
      role="tab"
      aria-selected={ctx.active === id}
      onClick={() => ctx.setActive(id)}
    >
      {children}
    </button>
  );
}

// Usage — clean, composable
<Tabs defaultTab="overview">
  <Tab id="overview">Overview</Tab>
  <Tab id="details">Details</Tab>
</Tabs>
```

### Render Props (when compound components can't work)
```tsx
function DataFetcher<T>({ url, children }: {
  url: string;
  children: (data: T | null, loading: boolean) => React.ReactNode;
}) {
  const { data, isLoading } = useQuery({ queryKey: [url], queryFn: () => fetch(url).then(r => r.json()) });
  return <>{children(data ?? null, isLoading)}</>;
}
```

### Custom Hook Patterns
```typescript
// ✅ Extract LOGIC, not just state — hook should be testable in isolation
function useOptimisticList<T extends { id: string }>(initialItems: T[]) {
  const [items, setItems] = useState(initialItems);

  const optimisticAdd = (item: T, serverAction: () => Promise<void>) => {
    setItems(prev => [...prev, item]);          // Optimistic update
    serverAction().catch(() => {
      setItems(prev => prev.filter(i => i.id !== item.id)); // Rollback
    });
  };

  const optimisticRemove = (id: string, serverAction: () => Promise<void>) => {
    setItems(prev => prev.filter(i => i.id !== id));
    serverAction().catch(() => setItems(initialItems)); // Rollback
  };

  return { items, optimisticAdd, optimisticRemove };
}
```

## Performance Patterns

### When to `memo`
```tsx
// ✅ Memoize when: parent re-renders frequently AND props don't change
const ExpensiveChart = memo(function Chart({ data }: { data: number[] }) {
  return <canvas>...</canvas>;
}, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data; // Custom equality
});

// ❌ Don't memo: cheap components, components that always get new props
```

### Context Performance Split
```tsx
// ❌ One big context = everything re-renders on any change
const AppContext = createContext({ user, theme, cart, notifications });

// ✅ Split by update frequency — stable state separate from volatile state
const UserContext = createContext<User | null>(null);       // Login/logout only
const CartContext = createContext<CartState | null>(null);  // Frequent changes
```

## React 19 Patterns

### `use()` for promises and context
```tsx
// In React 19, use() can unwrap promises in render
import { use, Suspense } from 'react';

async function fetchUser(id: string): Promise<User> {
  return fetch(`/api/users/${id}`).then(r => r.json());
}

function UserProfile({ promise }: { promise: Promise<User> }) {
  const user = use(promise); // Suspense-aware unwrapping
  return <h1>{user.name}</h1>;
}

// Usage
const userPromise = fetchUser('123');
<Suspense fallback={<Skeleton />}>
  <UserProfile promise={userPromise} />
</Suspense>
```

### `useActionState` for forms
```tsx
// React 19 — replaces the useFormState pattern
import { useActionState } from 'react';
import { createPost } from '@/actions/post.actions';

function PostForm() {
  const [state, action, isPending] = useActionState(createPost, { success: false });

  return (
    <form action={action}>
      <input name="title" />
      {state.error?.title && <p role="alert">{state.error.title[0]}</p>}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```
