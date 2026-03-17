# SKILL: React Performance

## Overview
Focused React performance patterns — profiling tools, memoization decisions, concurrent features, and bundle optimization. Load when diagnosing slow UIs or optimizing rendering.

## Profiling First
```
Before optimizing ANYTHING, measure:
1. Open React DevTools → Profiler tab
2. Record interaction → find components with long render bars
3. Enable "Highlight updates" (blue flash = render)
4. Run: why-did-you-render for detailed logs
```

## Memoization Decision Tree
```
Should I use React.memo?
  → Does parent re-render frequently?     NO  → skip
  → Do the props actually change often?   YES → skip  
  → Is the component expensive to render? NO  → skip
  All YES above? → Add React.memo

Should I use useMemo?
  → Is the calculation expensive (> 5ms)? NO  → skip
  → Is the result used in deps array?     YES → add useMemo
  → Is it in a hot render path?           NO  → skip

Should I use useCallback?
  → Is the function passed to a memoized child? NO → skip
  → Is it in a dependency array?               YES → add useCallback
```

## Stable Reference Patterns
```typescript
// ❌ Creates new array/object every render → breaks memo
function ParentComponent() {
  const filters = { status: 'active', page: 1 };  // New object!
  return <FilteredList filters={filters} />;       // Child ALWAYS re-renders
}

// ✅ Stable reference with useMemo
function ParentComponent() {
  const [status, setStatus] = useState('active');
  const filters = useMemo(() => ({ status, page: 1 }), [status]);
  return <FilteredList filters={filters} />;
}
```

## Expensive List Virtualization
```tsx
// For ANY list > 50 items — virtualize (only renders visible items)
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

function VirtualList({ items }: { items: Item[] }) {
  return (
    <AutoSizer>
      {({ height, width }) => (
        <FixedSizeList
          height={height}
          width={width}
          itemCount={items.length}
          itemSize={60}              // Row height in px (must be known)
        >
          {({ index, style }) => (
            <div style={style}>     {/* MUST pass style for positioning */}
              <ItemRow item={items[index]!} />
            </div>
          )}
        </FixedSizeList>
      )}
    </AutoSizer>
  );
}
```

## Code Splitting
```tsx
// Route-level splitting (Next.js does this automatically)
// Component-level splitting for heavy features:
import dynamic from 'next/dynamic';

// ✅ Split chart libraries (recharts, d3 etc.)
const RevenueChart = dynamic(() => import('./charts/RevenueChart'), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false,  // Charts often need browser APIs
});

// ✅ Split heavy editor components
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  loading: () => <Textarea placeholder="Loading editor..." />,
  ssr: false,
});
```

## React 18 Concurrent APIs
```tsx
// useTransition — keep input responsive during expensive state updates
const [isPending, startTransition] = useTransition();

// Fast update (immediate): update search input
setValue(e.target.value);

// Deferred update (interruptible): filter list
startTransition(() => setFilteredItems(filter(allItems, value)));

// useDeferredValue — defer re-renders without setTiming
const deferredQuery = useDeferredValue(searchQuery);
// deferredQuery lags behind searchQuery — OK for derived computed lists
const results = useMemo(() => search(allPosts, deferredQuery), [allPosts, deferredQuery]);
```
