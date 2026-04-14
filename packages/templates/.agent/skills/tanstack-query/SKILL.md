---
name: tanstack-query
description: "TanStack Query (React Query v5) patterns — queries, mutations, optimistic updates, infinite queries, prefetching, query invalidation, and server state management best practices"
---

# SKILL: TanStack Query (React Query v5)

## Overview
**TanStack Query** is the canonical solution for async server state in React applications. It handles caching, background refetching, stale-while-revalidate, and synchronization — eliminating `useEffect` + manual loading/error state for all data fetching.

## 1. Setup

```tsx
// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 min — data is fresh for 1 min before background refetch
      retry: 2,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* app */}
    </QueryClientProvider>
  )
}
```

## 2. Query Keys — Factory Pattern

```ts
// lib/query-keys.ts
export const queryKeys = {
  users: {
    all: () => ['users'] as const,
    lists: () => [...queryKeys.users.all(), 'list'] as const,
    list: (filters: UserFilters) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all(), 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
  posts: {
    all: () => ['posts'] as const,
    byUser: (userId: string) => [...queryKeys.posts.all(), 'user', userId] as const,
  },
}
```

## 3. useQuery — Basic

```ts
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { api } from '@/lib/api'

function useUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => api.users.getById(userId),
    enabled: !!userId,           // only run when userId is truthy
    staleTime: 5 * 60 * 1000,   // override default: 5 min stale time
  })
}

// Usage
const { data: user, isPending, error } = useUser(userId)
```

## 4. useMutation with Optimistic Updates

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateUserDto) => api.users.update(data),

    // Optimistic update
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users.detail(newData.id) })

      // Snapshot previous value
      const previous = queryClient.getQueryData(queryKeys.users.detail(newData.id))

      // Optimistically update cache
      queryClient.setQueryData(queryKeys.users.detail(newData.id), (old: User) => ({
        ...old,
        ...newData,
      }))

      return { previous }
    },

    // Rollback on error
    onError: (_err, newData, context) => {
      queryClient.setQueryData(
        queryKeys.users.detail(newData.id),
        context?.previous,
      )
    },

    // Always refetch to sync
    onSettled: (_data, _error, newData) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(newData.id) })
    },
  })
}
```

## 5. Infinite Queries (Pagination)

```ts
import { useInfiniteQuery } from '@tanstack/react-query'

function usePosts() {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.all(),
    queryFn: ({ pageParam }) => api.posts.list({ cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}

// Usage
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = usePosts()
const allPosts = data?.pages.flatMap((page) => page.items) ?? []
```

## 6. Query Invalidation Patterns

```ts
const queryClient = useQueryClient()

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) })

// Invalidate all user queries
queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })

// Prefetch on hover
function onHover(userId: string) {
  queryClient.prefetchQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => api.users.getById(userId),
  })
}
```

## Rules
- **Never `useEffect` + fetch** for server state — always `useQuery`
- **Query key factory** always — no inline string arrays
- **`enabled` flag** when query depends on runtime values
- **Separate `staleTime` per query type** (user: 5m, list: 30s, static: Infinity)
- **`onSettled` invalidation** after mutations to ensure cache consistency
