---
name: react-performance
description: "Framework-agnostic React performance — bundle analysis (Vite + Next.js), render profiling, Core Web Vitals, code splitting, and INP optimization."
---

# SKILL: Enterprise React Performance

## Overview
Framework-agnostic **React Performance** patterns for **Vite** and **Next.js** stacks. Covers **Bundle Auditing**, **Render Profiling**, **Core Web Vitals**, and **INP**.

## 1. Bundle & Dependency Auditing

**Vite projects — `rollup-plugin-visualizer`:**
```bash
npm i -D rollup-plugin-visualizer
```
```ts
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';
export default defineConfig({
  plugins: [visualizer({ open: true, gzipSize: true, brotliSize: true })],
});
// Run: npm run build — interactive HTML treemap opens automatically
```

**Next.js projects — `@next/bundle-analyzer`:**
```bash
ANALYZE=true npm run build  # opens bundle map in browser
```

**Rules for both stacks:**
- No single client-side chunk > 100kb gzipped in the initial load.
- Swap heavy libs: `moment` → `date-fns`, `lodash` → native ES6, use `lodash-es` named imports.
- Audit new packages with `bundlephobia.com` before committing.

## 2. LCP & Core Web Vitals

**Font loading (universal — self-hosted, zero CDN):**
```ts
import '@fontsource-variable/inter'; // tree-shakeable, ~20kb, no CLS
```
```html
<!-- Or: preload in <head> for critical fonts -->
<link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossorigin>
```
> **Next.js**: Use `next/font` instead — it inlines critical CSS and eliminates CLS automatically.

**LCP image priority (universal):**
```html
<!-- Vite/HTML: fetchpriority hint on the LCP image -->
<img src="hero.webp" fetchpriority="high" decoding="async" alt="Hero" />
```
> **Next.js**: Use `<Image priority />` which applies `fetchpriority="high"` + automatic sizing.

**Lazy loading below-the-fold (universal React pattern):**
```tsx
// React.lazy + Suspense — works in ALL React environments
const HeavyChart = lazy(() => import('./HeavyChart'));

<Suspense fallback={<Skeleton />}>
  <HeavyChart />
</Suspense>
```
> **Next.js only**: `dynamic(() => import('./Component'), { ssr: false })` — use only when you need SSR control; prefer `React.lazy` otherwise.

## 3. Render Profiling & Memoization
- **React Profiler**: DevTools Profiler → record an interaction → grey bars = wasted renders.
- **Rule**: Component re-rendering > 10 times identically per interaction → add `React.memo`.
- **`useMemo`**: Memoize expensive computed values (heavy sorts, complex filters).
- **`useCallback`**: Stabilize function refs passed to `memo`-wrapped children only.
- **Client-side logic offloading**: Move expensive transforms into loaders (React Router) or query functions (TanStack Query) — runs once at data-fetch time, not on every render.

## 4. Code Splitting & Parallel Data Loading

**Route-level splitting (Vite + React Router):**
```tsx
const AgentsPage = lazy(() => import('./pages/docs/agents/AgentsPage'));
const SkillsPage = lazy(() => import('./pages/docs/skills/SkillsPage'));
// Each gets its own chunk — only loaded when route is visited
```

**`manualChunks` for stable vendor deps (Vite):**
```ts
// vite.config.ts
manualChunks: {
  vendor: ['react', 'react-dom'],
  router: ['react-router'],
  radix:  ['@radix-ui/react-dialog', '@radix-ui/react-tabs'],
}
```

**Parallel loaders — no sequential waterfall:**
```ts
export async function loader() {
  const [agents, skills] = await Promise.all([fetchAgents(), fetchSkills()]);
  return { agents, skills };
}
```

## 5. Interaction to Next Paint (INP)
- **Long Tasks**: Break up synchronous JS > 50ms with `scheduler.postTask` or `setTimeout(fn, 0)`.
- **Debouncing**: `scroll`, `resize`, `onInput` → 150–300ms debounce; RAF-locked animations → 16ms.
- **Event Delegation**: Never attach per-item listeners in large lists — delegate to the container.
- **Virtualization**: Lists > 100 items → use `@tanstack/react-virtual` to render only visible rows.

## Skills to Load
- `react-patterns`
- `seo-core-web-vitals`
- `vitest-unit-tests`
