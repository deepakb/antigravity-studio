# SKILL: Next.js App Router

## Overview
This skill provides curated, production-grade knowledge for building full-stack applications with **Next.js 15 App Router**. Load this skill whenever working on routing, rendering, data fetching, or caching in a Next.js application.

## Rendering Decision Matrix

| Requirement | Component Type | Directive |
|---|---|---|
| Interactive (onClick, useState) | Client Component | `'use client'` |
| Browser APIs (window, localStorage) | Client Component | `'use client'` |
| WebSockets / real-time | Client Component | `'use client'` |
| Data fetching (DB, API) | Server Component | none (default) |
| Sensitive secrets (tokens, keys) | Server Component | none (default) |
| Static UI, headers, footers | Server Component | none (default) |

**Rule**: Push `'use client'` as far down the tree as possible.

## File Conventions (App Router)

| File | Purpose |
|---|---|
| `layout.tsx` | Persistent UI wrapper (does not re-render on navigation) |
| `page.tsx` | Route-specific UI (always a Server Component) |
| `loading.tsx` | Suspense fallback for the route |
| `error.tsx` | Error boundary for the route (`'use client'`) |
| `not-found.tsx` | 404 UI for the route |
| `route.ts` | API Route Handler (GET, POST, PUT, DELETE, PATCH) |
| `middleware.ts` | Edge middleware (runs before requests) |

## Data Fetching (Next.js 15)

```typescript
// Next.js 15: fetch() is NOT cached by default
// Must be explicit about caching strategy

// Static (cached forever, or until revalidated manually)
const data = await fetch(url, { cache: 'force-cache' });

// Time-based revalidation (ISR)
const data = await fetch(url, { next: { revalidate: 3600 } });

// Dynamic (never cached — user-specific data)
const data = await fetch(url, { cache: 'no-store' });

// Deduplication within a single request lifecycle
import { cache } from 'react';
export const getUser = cache(async (id: string) => {
  return prisma.user.findUnique({ where: { id } });
});
```

## Caching Invalidation (On-Demand)

```typescript
// In a Server Action or Route Handler after mutation:
import { revalidatePath, revalidateTag } from 'next/cache';

// Revalidate a specific page URL
revalidatePath('/dashboard');
revalidatePath('/posts/[slug]', 'page'); // all dynamic pages for this route

// Revalidate by tag (must tag the fetch first)
const data = await fetch(url, { next: { tags: ['posts'] } });
// ...later after mutation:
revalidateTag('posts');
```

## Server Actions (Mutations)

```typescript
// app/actions/post.actions.ts
'use server';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const postSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
});

export type ActionState = {
  success: boolean;
  error?: Record<string, string[]>;
};

export async function createPost(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session) return { success: false, error: { root: ['Unauthorized'] } };

  const parsed = postSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  await prisma.post.create({ data: { ...parsed.data, userId: session.user.id } });
  revalidatePath('/posts');
  return { success: true };
}
```

## Middleware (Edge — Optimistic Only)

```typescript
// middleware.ts — NEVER use for security-critical auth
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  // ✅ Redirect unauthenticated users from protected paths
  if (!req.auth && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
});

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
};
// ⚠️ ALWAYS re-check auth inside Route Handlers too
// Middleware can be bypassed (CVE-2025-29927)
```

## Image & Font Optimization

```tsx
import Image from 'next/image';
import { Inter } from 'next/font/google';

// Font: zero layout shift, self-hosted
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Image: LCP image needs priority
<Image
  src="/hero.png"
  alt="Hero image description"
  width={1200}
  height={600}
  priority  // Add for LCP image
  placeholder="blur"
  blurDataURL="data:..."
/>
```

## Performance Quick Wins

- `dynamic(() => import('./HeavyComponent'), { ssr: false, loading: () => <Skeleton /> })` for large client libs
- `<Link prefetch>` for critical paths
- Route Groups `(marketing)/`, `(app)/` for separate layouts without URL segments
- Parallel Routes `@modal` for context-preserving modals
