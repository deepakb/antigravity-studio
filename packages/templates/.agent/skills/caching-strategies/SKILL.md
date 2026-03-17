# SKILL: Caching Strategies

## Overview
Multi-layer caching patterns for Next.js 15 applications using React cache, fetch cache, unstable_cache, and Redis (Upstash). Load when designing data fetching or improving performance.

## Next.js 15 Caching Model (Simplified)
```
Request → Next.js Server
  ↓
  1. Request Memoization (React cache) — per-request dedup
  2. Data Cache (fetch/unstable_cache) — persistent across requests
  3. Full Route Cache — pre-rendered static pages
  4. Router Cache — client-side navigation cache
```

## Layer 1: Request Memoization (React cache)
```typescript
// Deduplicates identical DB calls within one request
import { cache } from 'react';
import { db } from '@/lib/db';

export const getUser = cache(async (id: string) => {
  return db.user.findUnique({ where: { id } });
});

// ✅ This is called 3 times in one request but only executes ONCE
// In Layout → calls getUser(userId)
// In Header → calls getUser(userId)
// In Page → calls getUser(userId)
// → Database hit: 1 (React cache deduplicates)
```

## Layer 2: Data Cache (unstable_cache)
```typescript
// Persists across requests — like Redis but built-in
import { unstable_cache } from 'next/cache';

export const getPopularPosts = unstable_cache(
  async () => {
    return db.post.findMany({ orderBy: { viewCount: 'desc' }, take: 10 });
  },
  ['popular-posts'],          // Cache key
  {
    revalidate: 3600,         // Seconds until stale (1 hour)
    tags: ['posts', 'popular-posts'],  // Tags for on-demand revalidation
  }
);

// Invalidate on-demand (e.g., after new post created)
import { revalidateTag, revalidatePath } from 'next/cache';
revalidateTag('posts');           // Invalidate by tag
revalidatePath('/blog');          // Invalidate by path
```

## Layer 3: fetch() Cache
```typescript
// In Server Components and Route Handlers
// ✅ Cached (default in Next.js — persists across requests)
const data = await fetch('https://api.example.com/posts', {
  next: { revalidate: 3600, tags: ['posts'] }
});

// ✅ No cache (for real-time data or POST requests)
const data = await fetch('https://api.example.com/posts', {
  cache: 'no-store'
});
```

## Layer 4: Redis with Upstash
```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis';
export const redis = Redis.fromEnv(); // UPSTASH_REDIS_REST_URL + TOKEN

// Generic cache wrapper
export async function withCache<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached !== null) return cached;
  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}

// Cache invalidation helpers
export async function invalidatePattern(pattern: string) {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) await redis.del(...keys);
}

// Usage
const stats = await withCache(
  `user:${userId}:stats`,
  300, // 5 minutes
  () => computeUserStats(userId)
);
```

## Cache Strategy Decision Guide
| Data Type | Freshness Need | Solution |
|---|---|---|
| User profile | Medium (minutes) | `unstable_cache` + revalidateTag on update |
| Posts list | Low (hours) | `unstable_cache` with 1h revalidate |
| Current user | High (per request) | `react cache` (no persistence) |
| Real-time data | Very high | `cache: 'no-store'` |
| Session | Per-request | `auth()` → NextAuth handles this |
| Computed stats | Medium | Redis with 5min TTL |
| Popular content | Low | Redis with 1h TTL + cron revalidation |

## Edge Caching (CDN)
```typescript
// Route Segments can set cache headers for CDN
export const revalidate = 3600; // Cache this page for 1 hour at CDN
export const dynamic = 'force-static'; // Always statically generate
export const runtime = 'edge'; // Run at CDN edge
```
