---
name: vite-build-system
description: "Deep reference for Vite 6 build system — configuration patterns, chunking strategy, env variables, plugin ordering, dev server, bundle analysis, and library mode. Authoritative for react-vite profile projects."
---

# SKILL: Vite Build System (v6)

## Overview
Comprehensive reference for **Vite 6** in production React projects. Covers **Configuration Architecture**, **Chunk Strategy**, **Environment Variables**, **Plugin Ecosystem**, **Dev Server**, and **Bundle Analysis**. This is the canonical skill for any `vite.config.ts` question on the `react-vite` profile.

> **Profile scope**: This skill applies to **`react-vite`** projects. Next.js projects do **not** use Vite — they have their own build pipeline (`next build` via webpack/Turbopack). Do not apply these patterns to Next.js projects.

---

## 1. Configuration Architecture

Every `vite.config.ts` follows this structure — never deviate from the ordering:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  // 1. plugins  — framework first, then tools, then build-only
  plugins: [react()],

  // 2. resolve   — aliases, extensions
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  // 3. build     — output, chunks, targets
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) { /* ... */ },
      },
    },
  },

  // 4. server    — port, proxy, HMR
  server: { port: 3000, open: true },
});
```

**Key rules:**
- `@vitejs/plugin-react` must always be the **first plugin** in the array.
- `build.target: 'es2020'` covers all modern browsers — avoids unnecessary polyfills.
- `chunkSizeWarningLimit` should only be raised for known-large deps (WASM, syntax highlighters). The default 500kb is correct for app code.

---

## 2. manualChunks — Function vs Object

This is the single most impactful build config decision in any Vite project.

```ts
// ❌ Object form — catastrophic for dynamic imports
// Any library that uses internal dynamic imports (Shiki, icon sets, etc.)
// produces one chunk per dynamically-imported module → 250+ output files
manualChunks: {
  vendor: ['react', 'react-dom'],
  shiki: ['shiki'],                // Shiki uses dynamic imports internally → explodes
}

// ✅ Function form — Rollup calls this for EVERY module ID
// Returning the same string groups modules; returning undefined = Rollup decides
manualChunks(id: string) {
  if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
    return 'vendor';
  }
  if (id.includes('node_modules/react-router')) return 'router';
  if (id.includes('node_modules/@radix-ui'))    return 'radix';
  if (id.includes('node_modules/shiki') || id.includes('node_modules/@shikijs')) return 'shiki';
  if (id.includes('.wasm'))                     return 'wasm';
  // undefined → Rollup groups by route/lazy boundary automatically
},
```

**Why this matters for Shiki specifically:**
`shiki`'s `codeToHtml()` function is a barrel that lazy-imports every language grammar. Using `manualChunks` as an object cannot intercept these dynamic imports, so Rollup emits a separate chunk for each of the 200+ languages. The function form intercepts them all and groups them under the `shiki` chunk.

---

## 3. Environment Variables

**File loading order** (higher = higher priority):
```
.env.local > .env.[mode].local > .env.[mode] > .env
```

```bash
# .env — committed, safe defaults for all environments
VITE_APP_NAME="My App"
VITE_API_URL=https://api.production.com

# .env.development — overrides for `vite` (dev server)
VITE_API_URL=http://localhost:8080

# .env.production — overrides for `vite build`
VITE_API_URL=https://api.production.com

# .env.local — machine-local, always git-ignored
VITE_DEV_TOKEN=my-personal-dev-token
```

```ts
// Runtime access — only VITE_ prefixed vars reach the browser bundle
import.meta.env.VITE_APP_NAME   // → string value
import.meta.env.DEV             // → true in dev server
import.meta.env.PROD            // → true after `vite build`
import.meta.env.MODE            // → 'development' | 'production' | custom mode name
import.meta.env.BASE_URL        // → value of `base` in vite.config.ts

// TypeScript — augment in src/vite-env.d.ts
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_API_URL: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

> **Security rule**: `VITE_` vars are **inlined at build time** — they appear as string literals in the output bundle. Never store tokens, secret keys, or credentials with this prefix. Only public, client-safe values belong here.

---

## 4. Plugin Ecosystem

**Plugin ordering** — Vite applies `transform` hooks in array order:

```ts
plugins: [
  // FIRST: framework plugin — must run before any code transform
  react(),

  // Dev overlay for TypeScript errors (excluded from prod build automatically)
  checker({ typescript: true }),

  // SVG imports as React components
  svgr(),

  // Bundle visualization — build-only, conditional
  process.env.ANALYZE === 'true' && visualizer({
    open: true,
    gzipSize: true,
    brotliSize: true,
    filename: 'dist/stats.html',
  }),
].filter(Boolean),
```

**Plugin reference table:**
| Plugin | Package | When to Use |
|---|---|---|
| React + Fast Refresh | `@vitejs/plugin-react` | Always — every react-vite project |
| React (SWC) | `@vitejs/plugin-react-swc` | Swap in for faster transforms on large codebases |
| Bundle treemap | `rollup-plugin-visualizer` | When auditing bundle size |
| TS/ESLint overlay | `vite-plugin-checker` | When you want errors in the browser HMR overlay |
| SVG as components | `vite-plugin-svgr` | When importing SVGs as React components |
| DTS generation | `vite-plugin-dts` | Library mode only — generates `.d.ts` files |
| Legacy browsers | `@vitejs/plugin-legacy` | Avoid unless explicitly required — adds ~30kb |

---

## 5. Dev Server Configuration

```ts
server: {
  port: 3000,
  strictPort: true,    // Fail fast if port is taken — no silent port increment

  // API proxy — eliminates local CORS issues entirely
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
    // WebSocket proxy for real-time features
    '/ws': {
      target: 'ws://localhost:8080',
      ws: true,
    },
  },
},

// Mirrors production asset serving — always test with `npm run preview` before deploy
preview: {
  port: 4173,
  strictPort: true,
},
```

---

## 6. Path Aliases — Vite + TypeScript in Sync

Aliases must be set in **both** places or TypeScript will show errors even though the build works:

```ts
// vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@components': path.resolve(__dirname, './src/components'),
    '@lib': path.resolve(__dirname, './src/lib'),
  },
},
```

```json
// tsconfig.json — must mirror vite.config.ts aliases exactly
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@lib/*": ["./src/lib/*"]
    }
  }
}
```

---

## 7. Library Mode

For packages meant to be published to npm:

```ts
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [react(), dts({ insertTypesEntry: true })],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'MyLib',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      // Peer deps MUST be external — never bundle React into your library
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
```

---

## 8. Sub-path Deployment

```ts
// GitHub Pages, CDN prefixes, or any non-root deployment
export default defineConfig({
  // Must match the path where the app is served
  base: process.env.NODE_ENV === 'production' ? '/repo-name/' : '/',
});
```

Without this, all `<script src="/assets/...">` tags will 404 on a sub-path server because they point to the root `/` instead of `/repo-name/`.

---

## 9. Gotcha Reference (Discovered in Production)

| Symptom | Root Cause | Fix |
|---|---|---|
| 250+ chunks in `dist/assets/` | `manualChunks` is an object | Switch to function form |
| `import.meta.env.X` is `undefined` in browser | Missing `VITE_` prefix | Rename variable |
| HMR triggers full page reload instead of hot-patch | Module-level side effects (timers, subscriptions outside hooks) | Move into `useEffect` / hooks |
| `> 500 kB` warning on WASM chunk | Oniguruma WASM is always ~622kb raw | `chunkSizeWarningLimit: 700` — this is expected |
| Shiki `codeToHtml` → 250 micro-chunks | Barrel import triggers dynamic lang loading | Use `createHighlighterCore` + explicit static lang imports |
| `@/` works in build but TS shows red | `tsconfig.paths` not updated to match `resolve.alias` | Sync both configs |
| Build passes, but `npm run preview` shows blank page | Assets use absolute `/` paths on a sub-path deploy | Set `base` in vite.config |
| `process.env.X` is undefined | Vite uses `import.meta.env`, not `process.env` | Replace with `import.meta.env.VITE_X` |
| Plugin not applying in production build | Plugin uses `apply: 'serve'` (dev only) | Check plugin docs for `apply` option |

## Skills to Load
- `react-performance`
- `react-patterns`
