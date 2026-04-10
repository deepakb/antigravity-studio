---
name: nextjs-app-router
description: "Scalable, performance-first patterns for Next.js 15 App Router. Focuses on Partial Prerendering, Streaming, and high-integrity data flow."
---

# SKILL: Next.js 15 Enterprise Architecture

## Overview
Scalable, performance-first patterns for Next.js 15 App Router. Focuses on Partial Prerendering, Streaming, and high-integrity data flow.

## 1. Partial Prerendering (PPR)
Next.js 15 experimental feature that combines static and dynamic rendering in a single request:
- **Pattern**: Wrap dynamic components in `<Suspense>`.
- **Config**: `experimental: { ppr: 'incremental' }` in `next.config.ts`.
- **Benefit**: Instant FCP (First Contentful Paint) for the shell + streaming dynamic data.

## 2. Advanced Streaming Strategies
- **Slots & Parallel Routes**: Use `@modal`, `@dashboard` slots to stream independent sections of a page in parallel.
- **Micro-Skeletons**: Use specific skeleton loaders for each component to prevent "pop-in" layout shift.

## 3. Server Action Persistence & Idempotency
- **Optimistic UI**: Use `useOptimistic` to show the expected state immediately.
- **Idempotency Keys**: Pass a unique `requestId` to Server Actions to prevent double-submissions (e.g., double billing).

## 4. Global Error & Loading Boundaries
- **error.tsx**: Implement custom "Reset" logic to allow users to recover from transient failures without refreshing.
- **not-found.tsx**: Provide contextual "Return to Home" or search suggestions.

## 5. Asset Optimization (LCP)
- **next/image**: Preload hero images using `priority`.
- **next/font**: Use variable fonts to reduce the number of font files downloaded.

---

## Verification Scripts (MANDATORY)

- **Environment Check**: `studio run env-validator`
