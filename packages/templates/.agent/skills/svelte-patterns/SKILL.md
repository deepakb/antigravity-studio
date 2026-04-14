---
name: svelte-patterns
description: "Svelte 5 and SvelteKit architecture patterns — runes reactivity, store patterns, component design, transitions, animations, accessibility, and production SvelteKit best practices"
---

# SKILL: Svelte / SvelteKit Patterns

## Overview
**Svelte 5** with runes is a compile-time reactive framework — no virtual DOM, no runtime overhead. **SvelteKit** is the full-stack framework built on top. Together they deliver exceptional performance with a minimal mental model.

## 1. Runes Reference Card

| Rune | Purpose | Old Equivalent |
|------|---------|---------------|
| `$props()` | Receive component props | `export let` |
| `$state()` | Reactive local state | `let x = ...` (reactive) |
| `$derived()` | Computed from state | `$: derived = ...` |
| `$effect()` | Side effects after state changes | `$: { ... }` (with side effects) |
| `$bindable()` | Two-way bindable prop | `export let` + bind |
| `$inspect()` | Debug reactive values (dev only) | `$: console.log(...)` |

## 2. Component Composition Patterns

### Compound Component (Context API)

```svelte
<!-- Tabs.svelte (parent) -->
<script lang="ts">
  import { setContext, type Snippet } from 'svelte'

  interface Props {
    defaultValue: string
    children: Snippet
  }
  const { defaultValue, children }: Props = $props()

  let active = $state(defaultValue)

  setContext('tabs', {
    get active() { return active },
    setActive: (value: string) => { active = value },
  })
</script>
{@render children()}

<!-- TabTrigger.svelte (child) -->
<script lang="ts">
  import { getContext } from 'svelte'

  const { label, value }: { label: string; value: string } = $props()
  const tabs = getContext<TabsContext>('tabs')
</script>
<button
  class:active={tabs.active === value}
  onclick={() => tabs.setActive(value)}
>{label}</button>
```

### Snippet-Based Composition

```svelte
<!-- Table.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props<T> {
    items: T[]
    row: Snippet<[T, number]>  // Snippet receiving item + index
    empty?: Snippet
  }
  const { items, row, empty }: Props<unknown> = $props()
</script>

<table>
  {#each items as item, i}
    {@render row(item, i)}
  {:else}
    {#if empty}
      {@render empty()}
    {/if}
  {/each}
</table>
```

## 3. Svelte Stores (Global State)

```ts
// stores/auth.ts — Writable store for shared state
import { writable, derived, get } from 'svelte/store'

function createAuthStore() {
  const user = writable<User | null>(null)
  const isAuthenticated = derived(user, ($user) => $user !== null)

  return {
    subscribe: user.subscribe,
    isAuthenticated,

    async login(credentials: LoginDto) {
      const result = await api.auth.login(credentials)
      user.set(result.user)
    },

    logout() {
      user.set(null)
    },

    // Current value without subscription
    getUser: () => get(user),
  }
}

export const auth = createAuthStore()
```

## 4. Transitions and Animations

```svelte
<script lang="ts">
  import { fade, fly, slide } from 'svelte/transition'
  import { flip } from 'svelte/animate'
  import { quintOut } from 'svelte/easing'

  let visible = $state(true)
  let items = $state(['a', 'b', 'c'])
</script>

<!-- Element transition -->
{#if visible}
  <div
    in:fly={{ y: 20, duration: 300, easing: quintOut }}
    out:fade={{ duration: 200 }}
  >
    Content
  </div>
{/if}

<!-- List animation (FLIP) -->
{#each items as item (item)}
  <div animate:flip={{ duration: 300 }}>
    {item}
  </div>
{/each}
```

## 5. Action Directives (Reusable DOM Behaviors)

```ts
// lib/actions/clickOutside.ts
export function clickOutside(node: HTMLElement, callback: () => void) {
  function handleClick(event: MouseEvent) {
    if (!node.contains(event.target as Node)) {
      callback()
    }
  }
  document.addEventListener('click', handleClick)

  return {
    destroy() {
      document.removeEventListener('click', handleClick)
    },
  }
}

// Usage: <div use:clickOutside={closeMenu}>...</div>
```

## 6. SvelteKit Error Handling

```ts
// src/hooks.server.ts
import type { HandleServerError } from '@sveltejs/kit'

export const handleError: HandleServerError = ({ error, event }) => {
  console.error('Unhandled error:', error)
  return {
    message: 'An unexpected error occurred',
    code: 'INTERNAL_ERROR',
  }
}
```

```svelte
<!-- +error.svelte (per-layout error page) -->
<script lang="ts">
  import { page } from '$app/stores'
</script>

<h1>{$page.status}: {$page.error?.message}</h1>
```

## 7. TypeScript in Svelte

```svelte
<script lang="ts">
  // Generic component in Svelte 5
  type T = $$Generic
  interface Props {
    items: T[]
    keyFn: (item: T) => string
    selected?: T
  }
  const { items, keyFn, selected }: Props = $props()
</script>
```

## Rules
- **Runes everywhere** in Svelte 5 — never legacy `export let` or `$:` syntax in new code
- **`setContext` / `getContext`** for cross-component communication (not stores for component-local state)
- **`use:` actions** for reusable DOM behaviors (click outside, focus trap, tooltip)
- **`flip` for list reordering**, `in:` / `out:` for conditional elements
- **`prefers-reduced-motion`** check inside `$effect()` before starting animations
- **`.server.ts` hooks** for server-side error handling and request logging
