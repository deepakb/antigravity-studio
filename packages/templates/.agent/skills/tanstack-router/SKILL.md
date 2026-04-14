---
name: tanstack-router
description: "TanStack Router v1 patterns — file-based routing, type-safe route params/search params, loader data, route context, code splitting, and navigation patterns for React SPAs"
---

# SKILL: TanStack Router v1

## Overview
**TanStack Router** is the type-safe router for React SPAs. Every route param, search param, and loader return is 100% TypeScript-inferred — no runtime surprises. It handles code splitting, pending states, and route preloading out of the box.

## 1. Route File Structure

```
src/
  routes/
    __root.tsx          ← Root layout route
    index.tsx           ← / (home)
    posts/
      index.tsx         ← /posts
      $postId.tsx       ← /posts/:postId (dynamic)
      $postId.edit.tsx  ← /posts/:postId/edit
    -components/        ← Non-route files (prefixed with -)
```

## 2. Root Route

```tsx
// src/routes/__root.tsx
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <div>
      <Header />
      <Outlet />
      <Footer />
    </div>
  ),
})
```

## 3. Dynamic Route with Loader

```tsx
// src/routes/posts/$postId.tsx
import { createFileRoute } from '@tanstack/react-router'
import { queryKeys } from '@/lib/query-keys'
import { api } from '@/lib/api'

export const Route = createFileRoute('/posts/$postId')({
  // Loader runs before component renders
  loader: async ({ context: { queryClient }, params }) => {
    // Prefetch and cache via React Query
    await queryClient.ensureQueryData({
      queryKey: queryKeys.posts.detail(params.postId),
      queryFn: () => api.posts.getById(params.postId),
    })
  },

  component: PostPage,
})

function PostPage() {
  // params is fully typed: { postId: string }
  const { postId } = Route.useParams()
  const { data: post } = useQuery({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: () => api.posts.getById(postId),
  })

  return <article><h1>{post?.title}</h1></article>
}
```

## 4. Search Params — Type-Safe

```tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'

const searchSchema = z.object({
  page: z.number().int().positive().catch(1),
  q: z.string().optional(),
  sort: z.enum(['latest', 'popular']).catch('latest'),
})

export const Route = createFileRoute('/posts')({
  validateSearch: searchSchema,
  component: PostsListPage,
})

function PostsListPage() {
  // Fully typed search params
  const { page, q, sort } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  function nextPage() {
    navigate({ search: (prev) => ({ ...prev, page: prev.page + 1 }) })
  }

  return (/* ... */)
}
```

## 5. Router Setup with React Query

```tsx
// src/router.tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen' // auto-generated
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient()

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent', // prefetch on hover
  defaultPreloadStaleTime: 0,
})

// Declare router type for useNavigate, Link, etc.
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
```

## 6. Type-Safe Link and Navigate

```tsx
import { Link, useNavigate } from '@tanstack/react-router'

// Fully typed — TypeScript errors on invalid routes or missing params
<Link to="/posts/$postId" params={{ postId: post.id }}>
  {post.title}
</Link>

// Navigate programmatically
const navigate = useNavigate()
navigate({ to: '/posts/$postId', params: { postId: newPost.id } })
```

## Rules
- **File-based routing only** — no `createRoute` inline in app code
- **`validateSearch` with Zod** on every route with search params
- **`loader` for data prefetching** — integrate with `queryClient.ensureQueryData`
- **`defaultPreload: 'intent'`** in router config for instant navigation feel
- **Never `useNavigate` in useEffect** for redirects — use `loader` with `redirect()`
