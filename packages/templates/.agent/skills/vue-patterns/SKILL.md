---
name: vue-patterns
description: "Vue 3 Composition API patterns: composables, reactivity system, Pinia state management, and performance optimization for enterprise apps."
---

# SKILL: Vue.js 3 Enterprise Patterns

## Overview
Production patterns for **Vue 3** using the **Composition API**, **Pinia** for state management, and **Nuxt 3** conventions where applicable.

## 1. Composition API — Script Setup
Always use `<script setup>` for new components:
```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

interface Props {
  userId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ userUpdated: [user: User] }>()

const store = useUserStore()
const user = computed(() => store.getUserById(props.userId))
</script>
```
- **Rule**: Never mix Options API and Composition API in the same component.
- Use `defineProps<T>()` with TypeScript generics — never the object syntax.

## 2. Composables — Reusable Logic
Extract reusable stateful logic into composables:
```typescript
// composables/useAsyncData.ts
export function useAsyncData<T>(fetcher: () => Promise<T>) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const loading = ref(false)

  async function execute() {
    loading.value = true
    error.value = null
    try {
      data.value = await fetcher()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  onMounted(execute)
  return { data: readonly(data), error: readonly(error), loading: readonly(loading), execute }
}
```
- **Rule**: Composables must be called at the top level of `setup()` — never inside conditionals.
- Name composables with `use` prefix.

## 3. Pinia State Management
```typescript
// stores/cart.ts
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const total = computed(() => items.value.reduce((s, i) => s + i.price, 0))

  function addItem(item: CartItem) {
    items.value.push(item)
  }

  return { items: readonly(items), total, addItem }
})
```
- Prefer the **Setup Store** syntax (function-style) over the Options Store — it's composable-compatible.
- Use `storeToRefs()` to destructure reactive state without losing reactivity.

## 4. Reactivity Rules
```typescript
// ✅ Reactive — ref/reactive
const count = ref(0)
const state = reactive({ name: '', age: 0 })

// ❌ Breaks reactivity — destructuring reactive without toRefs
const { name } = state // name is no longer reactive!
const { name } = toRefs(state) // ✅ correct
```
- Use `ref()` for primitives, `reactive()` for objects when you need destructuring via `toRefs()`.
- Use `shallowRef()` / `shallowReactive()` for large objects that don't need deep reactivity.

## 5. Performance Optimization
- `v-memo` for expensive list items that rarely change.
- `defineAsyncComponent` for code-splitting heavy components.
- `<Suspense>` with async `setup()` for server-side data fetching patterns.
- Use `v-once` for truly static content.

## 6. Feature-Based Folder Structure
```
src/
  features/
    products/
      components/
      composables/
      stores/
      types/
      ProductList.vue
  shared/
    components/
    composables/
  stores/
```

---

## Quality Gates

When this skill is active, the **Validator** agent runs these gates before delivering any output.

### 🔴 TIER 1 — HARD BLOCK
| Gate | Command | Checks |
|------|---------|--------|
| **Security Scan** | `studio run security-scan` | CVEs in Vue/Pinia/Nuxt dependencies |
| **TypeScript Check** | `studio run ts-check` | `<script setup lang="ts">` strict type inference |

### 🟡 TIER 2 — AUTO-FIX
| Gate | Command | Checks |
|------|---------|--------|
| **Dependency Audit** | `studio run dependency-audit` | npm audit for Vue ecosystem packages |
| **License Audit** | `studio run license-audit` | No GPL/AGPL dependencies |

### 🟢 TIER 3 — ADVISORY
| Gate | Command | Checks |
|------|---------|--------|
| **Accessibility Audit** | `studio run accessibility-audit` | ARIA in Vue templates, role attributes |
| **Type Coverage** | `studio run type-coverage` | Typed composables and Pinia stores |

```bash
# Run all gates at once
studio run verify-all
```
