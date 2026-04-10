---
name: react-performance
description: "Hardened, data-driven Performance Auditing for React/Next.js applications. Focuses on Bundle Optimization, Render Profiling, and LCP Orchestration."
---

# SKILL: Enterprise React Performance

## Overview
Hardened, data-driven **Performance Auditing** for React/Next.js applications. Focuses on **Bundle Optimization**, **Render Profiling**, and **LCP Orchestration**.

## 1. Bundle & Dependency Auditing
Don't ship what you don't use.
- **Audit**: Use `@next/bundle-analyzer` to identify bloated libraries.
- **Standard**: No client-side library > 50kb without justification.
- **Replacement**: Swap heavy libs (e.g., `moment` → `date-fns`, `lodash` → `native ES6`).

## 2. LCP & Core Web Vitals (CWV)
Monitor the real user experience.
- **Image Priority**: Use `priority` on the Largest Contentful Paint (LCP) image.
- **Font Optimization**: Use `next/font` with `display: swap` to prevent layout shifts.
- **Dynamic Imports**: Use `dynamic(() => import(...), { ssr: false })` for components below the fold.

## 3. Render Profiling & Memoization
- **React Profiler**: Use the DevTools Profiler to find "Wasted Renders".
- **Rule**: If a component renders > 10 times in a single interaction, investigate `memo` or `useMemo`.
- **Logic Offloading**: Move heavy filtering or data transformation into the **Server Component** layer to save client CPU.

## 4. Network Optimization (Streaming)
- **Suspense Boundaries**: Wrap slow fetching areas in `<Suspense>`.
- **Pre-loading**: Use `<Link prefetch>` for high-probability navigation paths.
- **Parallel Fetching**: Fetch data in parallel using `Promise.all()` in Server Components.

## 5. Interaction to Next Paint (INP)
Next.js 15 focuses on responsiveness.
- **Pattern**: Break up long-running JS tasks into small chunks using `requestIdleCallback` or `Scheduler.postTask`.
- **Debouncing**: Always debounce/throttle high-frequency events like `scroll`, `resize`, or `onSearchChange`.

## Skills to Load
- `nextjs-perf-optimization`
- `core-web-vitals`
- `bundle-analysis-strategies`
