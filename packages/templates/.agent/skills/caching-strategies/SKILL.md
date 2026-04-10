---
name: caching-strategies
description: "Strategic Multi-layer Caching for high-performance enterprise applications. Focuses on Memory, Cloud (Redis), and Edge (CDN) caching."
---

# SKILL: Enterprise Caching Strategies

## Overview
Strategic **Multi-layer Caching** for high-performance enterprise applications. Focuses on **Memory**, **Cloud (Redis)**, and **Edge (CDN)** caching.

## 1. Cache-Aside Pattern (Distributed)
The primary pattern for data-heavy applications.
- **Logic**: Check Cache → If Hit, return → If Miss, fetch from DB, update Cache, then return.
- **Tooling**: Use `Redis` or `KeyDB` for low-latency, shared caching across server instances.

## 2. Cache Invalidation Strategies
A stale cache is worse than no cache.
- **TTL (Time-To-Live)**: Set short TTLs for high-volatility data.
- **Tag-based Revalidation**: Next.js 15 `revalidateTag` — invalidate specific data groups across the whole app.
- **Write-Through**: Update the cache at the same time as the database.

## 3. CDN & Edge Caching (Next.js/Vercel)
Cache static content and ISR pages close to the user.
- **Stale-While-Revalidate**: Serve stale data quickly while updating the background cache.
- **Cache-Control Headers**: Set `s-maxage` for CDN and `maxage` for browser cache.

## 4. Thundering Herd Avoidance
Prevent 1000 simultaneous requests from hitting the DB at once on a cache miss.
- **Locking**: The first request "locks" the key, fetches the data, and updates the cache. Other requests wait or receive the stale value.

## 5. Memory Caching (Next.js Request Cache)
In Next.js 15, `React.cache()` caches data per-request.
- **Benefit**: No need to pass props down 10 levels; just fetch the same data twice in two components — Next.js will only call the DB/API once.

## Skills to Load
- `redis-distributed-caching`
- `cdn-edge-optimization`
- `stale-while-revalidate-swr`
