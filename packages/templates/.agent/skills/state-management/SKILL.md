# SKILL: State Management

## Overview
Decision framework and patterns for choosing and implementing state management in TypeScript/React applications. Load when deciding on or implementing state management strategy.

## State Classification Matrix
```
                    LOCAL          SERVER          GLOBAL         URL
Source         Component-owned  Database/API   Cross-component  Browser URL
───────────────────────────────────────────────────────────────────────────
Tool           useState         TanStack Query   Zustand         nuqs
               useReducer       SWR              Jotai           useSearchParams
               useRef           Server Actions   Context API
───────────────────────────────────────────────────────────────────────────
Examples       form input        user profile    auth session    filters/sort
               modal open/close  posts list      theme           pagination
               hover state       notifications   cart            search query
```

## Decision Guide
```
Does the state come from the server?
  YES → TanStack Query (smart caching, background sync, stale-while-revalidate)
  
Is it URL-shareable? (filters, search, pagination)
  YES → nuqs (type-safe URL search params for Next.js)
  
Does it affect 3+ unrelated components?
  YES → Zustand (lightweight, no context hell)
  
Is it only used by one component or its direct children?
  YES → useState / useReducer
```

## TanStack Query Setup
```typescript
// app/providers.tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,    // 1 minute before refetch
        gcTime: 10 * 60 * 1000, // 10 minutes before garbage collected
        retry: 1,
        refetchOnWindowFocus: false, // Adjust per app needs
      },
    },
  }));
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## Zustand Store (Global Client State)
```typescript
// lib/stores/ui.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: Notification[];
}

interface UIActions {
  toggleSidebar: () => void;
  setTheme: (theme: UIState['theme']) => void;
  addNotification: (n: Notification) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState & UIActions>()(
  persist(               // Persist theme to localStorage
    immer((set) => ({    // Immer for safe mutations
      sidebarOpen: false,
      theme: 'system',
      notifications: [],

      toggleSidebar: () => set((state) => { state.sidebarOpen = !state.sidebarOpen; }),
      setTheme: (theme) => set((state) => { state.theme = theme; }),
      addNotification: (n) => set((state) => { state.notifications.push(n); }),
      removeNotification: (id) => set((state) => {
        state.notifications = state.notifications.filter(n => n.id !== id);
      }),
    })),
    { name: 'ui-preferences', partialize: (s) => ({ theme: s.theme }) }
  )
);

// ✅ Use selectors to prevent unnecessary re-renders
const theme = useUIStore((s) => s.theme); // Only re-renders when theme changes
const toggleSidebar = useUIStore((s) => s.toggleSidebar);
```

## URL State with nuqs (Next.js)
```typescript
// ✅ URL-synced filters — shareable, browser-navigable, SSR-compatible
import { useQueryState, parseAsInteger, parseAsString } from 'nuqs';

function ProductFilters() {
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''));
  const [category, setCategory] = useQueryState('category');

  // URL: /products?q=shoes&category=running&page=2
}
```
