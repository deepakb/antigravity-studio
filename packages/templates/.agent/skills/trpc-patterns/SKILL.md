---
name: trpc-patterns
description: "tRPC v11 patterns — router setup, procedures, input validation with Zod, middleware, context, React Query integration, and type-safe full-stack TypeScript API design"
---

# SKILL: tRPC Patterns

## Overview
**tRPC** eliminates the API contract surface between client and server. Types flow from server procedures to React hooks automatically — no code generation, no OpenAPI, no REST. The client can call server functions as if they were local.

## 1. Server Router Setup

```ts
// src/server/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server'
import { type Context } from './context'
import superjson from 'superjson'
import { z } from 'zod'

const t = initTRPC.context<Context>().create({
  transformer: superjson, // handles Date, Map, Set, undefined
})

export const router = t.router
export const publicProcedure = t.procedure

// Protected procedure — requires auth
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { ...ctx, user: ctx.session.user } })
})
```

## 2. Context

```ts
// src/server/context.ts
import type { inferAsyncReturnType } from '@trpc/server'
import { db } from '@/db'
import { getAuth } from '@/lib/auth'

export async function createContext(opts: { req: Request }) {
  const session = await getAuth(opts.req)
  return { db, session }
}

export type Context = inferAsyncReturnType<typeof createContext>
```

## 3. Feature Router

```ts
// src/server/routers/posts.ts
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { z } from 'zod'

export const postsRouter = router({
  list: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().uuid().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.post.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      })
      const nextCursor = items.length > input.limit ? items.pop()!.id : undefined
      return { items, nextCursor }
    }),

  byId: publicProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({ where: { id: input } })
      if (!post) throw new TRPCError({ code: 'NOT_FOUND' })
      return post
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      content: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.post.create({
        data: { ...input, authorId: ctx.user.id },
      })
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({ where: { id: input } })
      if (!post) throw new TRPCError({ code: 'NOT_FOUND' })
      if (post.authorId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN' })
      return ctx.db.post.delete({ where: { id: input } })
    }),
})
```

## 4. App Router (Root)

```ts
// src/server/routers/_app.ts
import { router } from '../trpc'
import { postsRouter } from './posts'
import { usersRouter } from './users'

export const appRouter = router({
  posts: postsRouter,
  users: usersRouter,
})

export type AppRouter = typeof appRouter
```

## 5. Client Setup (React + TanStack Query)

```ts
// src/lib/trpc.ts
import { createTRPCReact } from '@trpc/react-query'
import { httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import type { AppRouter } from '@/server/routers/_app'

export const trpc = createTRPCReact<AppRouter>()

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      transformer: superjson,
      headers: () => ({ 'x-trpc-source': 'react' }),
    }),
  ],
})
```

## 6. Client Usage

```tsx
// Fully typed — autocomplete on trpc.posts.*
function PostsList() {
  const { data } = trpc.posts.list.useQuery({ limit: 10 })

  const create = trpc.posts.create.useMutation({
    onSuccess: () => {
      // Invalidate list query after create
      utils.posts.list.invalidate()
    },
  })

  const utils = trpc.useUtils()

  return (/* ... */)
}
```

## Rules
- **Zod on every procedure input** — no `z.any()` or `z.unknown()` in procedure definitions
- **`protectedProcedure`** for all mutations and auth-required queries
- **`superjson`** transformer always — handles Date and undefined correctly
- **`httpBatchLink`** in production — batches multiple calls into one HTTP request
- **`TRPCError`** with correct code (`NOT_FOUND`, `FORBIDDEN`, `UNAUTHORIZED`) — not generic 500s
