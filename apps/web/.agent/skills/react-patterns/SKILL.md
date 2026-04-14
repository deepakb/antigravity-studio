---
name: react-patterns
description: "Advanced patterns for React 19 across all environments — Vite SPA, React Router v7, Remix, and Next.js. Focuses on Composition, Data Fetching, Performance, and Clean Architecture."
---

# SKILL: Enterprise React Patterns

## Overview
Advanced patterns for **React 19** across all environments. Covers **Composition**, **Client-Side Data Fetching**, **Performance**, and **Clean Architecture**. Applies to Vite SPA, React Router v7, Remix, and Next.js.

> **⚠️ Framework Note**: If this project uses **Next.js App Router**, consult `@nextjs-expert` for
> RSC/CC boundary discipline and Server Action patterns. In **Vite/React Router SPAs**,
> all components are client components — `'use client'` does not exist and Server Component
> concepts do not apply. The patterns in this skill are fully compatible with all React stacks.

## 1. Composition over Inheritance
Avoid giant components with 20+ props.
- **Pattern**: Split into focused sub-components. Share state via `React.use()` + Context, or prop-passing for shallow trees.
- **Inversion of Control**: Design components that accept UI slots (`<Card header={<Button />} />`).
- **Compound Components**: Use Radix UI primitives as composition roots — `Dialog.Root`, `Tabs.Root`, `Accordion.Root`.

## 2. Client-Side Data Fetching (SPA / React Router)
For Vite + React Router v7, data flows through **loaders** — not `useEffect`:

```tsx
// ✅ React Router v7 loader — runs before render, no waterfall
export async function loader({ params }: LoaderFunctionArgs) {
  const data = await fetchSomething(params.id);
  return data;
}

export default function Page() {
  const data = useLoaderData<typeof loader>(); // always defined, no loading state needed
  return <div>{data.name}</div>;
}

// ✅ Parallel loaders — zero sequential waterfall
export async function loader() {
  const [agents, skills] = await Promise.all([fetchAgents(), fetchSkills()]);
  return { agents, skills };
}
```

**Rule**: Never use `useEffect + useState` for initial page data. Use a loader (React Router/Remix), a query hook (TanStack Query), or `React.use(promise)`.

## 3. React 19 Hooks (All Environments)
These work in Vite, React Router, Remix, and Next.js — no server required:

```tsx
// useActionState — form state without useEffect
const [state, dispatch] = useActionState(formAction, initialState);

// useOptimistic — immediate UI before mutation completes
const [optimisticItems, addOptimistic] = useOptimistic(
  items,
  (state, newItem) => [...state, newItem]
);

// use(Promise) — suspend on a promise inside a component
const data = use(dataPromise); // component suspends until resolved
```

## 4. Code Splitting (Vite / React Router)
```tsx
// Route-level lazy loading — Vite splits each into its own chunk
const AgentsPage = lazy(() => import('./pages/docs/agents/AgentsPage'));

// Wrap at router or layout level with a single Suspense boundary
<Suspense fallback={<PageSkeleton />}>
  <Outlet />
</Suspense>
```

```ts
// vite.config.ts — group stable vendor deps into named chunks
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        router: ['react-router'],
        radix:  ['@radix-ui/react-dialog', '@radix-ui/react-tabs'],
      },
    },
  },
},
```

## 5. Performance & Memoization
- **React Profiler**: DevTools → Profiler → find "Wasted Renders" (grey bars = no change).
- **`memo`**: Wrap only when a component re-renders with identical props > 10 times per interaction.
- **`useMemo` / `useCallback`**: For expensive computations or stable refs passed to memoized children.
- **React Compiler** (React 19): Reduces need for manual memoization for compatible components.
- **Strict Mode**: All components must be pure functions — no side effects during render.

## 6. Clean Architecture
- **Logic in hooks, not components**: Extract business logic into `useFeatureName()` custom hooks.
- **No raw fetch in components**: Use loaders (React Router), query functions (TanStack Query), or a service layer.
- **Co-locate by feature**: `AgentsPage.tsx`, `agents.loader.ts`, `agents.types.ts` together — not scattered by file type.
- **Path aliases**: Always use `@/` — never deep relative paths (`../../..`).

## Skills to Load
- `react-performance`
- `vitest-unit-tests`
- `responsive-patterns`
