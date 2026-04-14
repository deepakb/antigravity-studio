---
name: nuxt-patterns
description: "Nuxt 3 architecture patterns — composables, Pinia stores, Nuxt modules, hybrid rendering, server-side auth, content management, and production deployment patterns"
---

# SKILL: Nuxt.js Patterns

## Overview
**Nuxt 3** is the full-stack framework for Vue. Built on Nitro server and Vite, it handles SSR, SSG, hybrid rendering, and edge deployment. This skill covers the patterns for building production Nuxt applications correctly.

## 1. Directory Structure

```
nuxt-app/
  app.vue                   ← App shell (or layouts/)
  pages/                    ← File-based routing
    index.vue
    about.vue
    users/
      index.vue
      [id].vue              ← Dynamic route
  layouts/
    default.vue
    auth.vue
  components/               ← Auto-imported components
    AppHeader.vue
    ui/
      Button.vue            ← Usage: <UiButton />
  composables/              ← Auto-imported composables
    useAuth.ts
  stores/                   ← Pinia stores (auto-imported with @pinia/nuxt)
    useUserStore.ts
  server/
    api/
      users/
        index.get.ts        ← GET /api/users
        [id].get.ts         ← GET /api/users/:id
        [id].patch.ts       ← PATCH /api/users/:id
    middleware/             ← Server middleware (runs on every request)
    utils/                  ← Server utilities (auto-imported in server/)
  middleware/               ← Route middleware
    auth.ts
  plugins/                  ← Nuxt plugins
    analytics.client.ts     ← .client = browser only
    prisma.server.ts        ← .server = server only
```

## 2. Composable Patterns

```ts
// composables/useApi.ts
export function useApi() {
  // $fetch is globally available in Nuxt
  async function get<T>(url: string): Promise<T> {
    return $fetch<T>(url)
  }

  async function post<T>(url: string, body: unknown): Promise<T> {
    return $fetch<T>(url, { method: 'POST', body })
  }

  return { get, post }
}

// composables/useAuth.ts
export function useAuth() {
  const user = useState<User | null>('auth.user', () => null)
  const isAuthenticated = computed(() => user.value !== null)

  async function login(credentials: LoginDto) {
    const result = await $fetch<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: credentials,
    })
    user.value = result.user
    navigateTo('/dashboard')
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    navigateTo('/login')
  }

  return { user: readonly(user), isAuthenticated, login, logout }
}
```

## 3. Server Utils — Shared Auth Helper

```ts
// server/utils/auth.ts
import { H3Event } from 'h3'

export async function requireAuth(event: H3Event) {
  const session = await getUserSession(event) // nuxt-auth-utils
  if (!session.user) {
    throw createError({ statusCode: 401, message: 'Authentication required' })
  }
  return session.user
}

// Usage in server routes:
// const user = await requireAuth(event)
```

## 4. Pinia Store with Nuxt

```ts
// stores/useCartStore.ts
export const useCartStore = defineStore('cart', () => {
  // SSR-safe state with useState is NOT needed in Pinia stores
  // Pinia automatically handles SSR hydration in Nuxt
  const items = ref<CartItem[]>([])
  const total = computed(() => items.value.reduce((sum, i) => sum + i.price, 0))

  function addItem(item: CartItem) {
    items.value.push(item)
  }

  function removeItem(id: string) {
    items.value = items.value.filter((i) => i.id !== id)
  }

  // Persisted store (with pinia-plugin-persistedstate)
  return { items, total, addItem, removeItem }
}, {
  persist: { storage: persistedState.localStorage },
})
```

## 5. Hybrid Rendering

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },              // SSG at build time
    '/blog/**': { swr: 3600 },             // ISR: revalidate every hour
    '/dashboard/**': { ssr: false },        // SPA for authenticated pages
    '/api/**': { cors: true },             // CORS on API routes
    '/docs/**': { prerender: true },        // Static docs
  },
})
```

## 6. Nuxt Plugins

```ts
// plugins/toast.client.ts — browser only
import { Toaster, toast } from 'vue-sonner'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      toast, // use as $toast in Options API or useNuxtApp().$toast
    },
  }
})

// Usage in component:
// const { $toast } = useNuxtApp()
```

## 7. Error Handling

```vue
<!-- error.vue (root level — replaces default layout on error) -->
<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number; message: string } }>()
const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div>
    <h1>{{ error.statusCode }}</h1>
    <p>{{ error.message }}</p>
    <button @click="handleError">Go home</button>
  </div>
</template>
```

## Rules
- **`useState`** for SSR-safe shared state between components (not `ref` at module level)
- **`defineStore`** from Pinia — auto-imported with `@pinia/nuxt`
- **`server/utils/`** for shared server helpers (auto-imported in all `server/` files)
- **`.server.ts` suffix** for plugin files that must NOT run in browser
- **`routeRules`** for fine-grained rendering strategy (not `fetchOnServer: false` in components)
- **Never `process.env`** in components — use `useRuntimeConfig().public`
