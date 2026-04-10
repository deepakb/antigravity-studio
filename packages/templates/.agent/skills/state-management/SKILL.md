---
name: state-management
description: "Strategic State Management for large-scale applications. Focuses on Zustand, Server-driven State, and URL Persistence."
---

# SKILL: Enterprise State Management

## Overview
Strategic **State Management** for large-scale applications. Focuses on **Zustand**, **Server-driven State**, and **URL Persistence**.

## 1. Modular Store Architecture (Zustand)
Avoid one giant "God Store". Split by domain.
- **Pattern**: `useAuthStore`, `useUiStore`, `useCartStore`.
- **Immutable Updates**: Use `set((state) => ({ ... }))` or `immer` for complex nested state.

## 2. URL as Source of Truth (`nuqs`)
For filters, pagination, and tabs, use the URL.
- **Tool**: `nuqs` (Next.js URL Query State).
- **Benefit**: Shareable state, functional "Back" button, and SEO-friendly filtering.

## 3. Server-First Thinking
- **Strategy**: If the data comes from a DB, the "State" should be managed by **Request Memoization** (`React.cache`) and **Server Components**, not a client-side store.
- **Client Sync**: Use `useEffect` sparingly to sync server data to a client store only when absolutely necessary (e.g., Real-time notifications).

## 4. Atomic State (Jotai)
For highly complex, cross-cutting UI states (e.g., nodes in a flowchart), use **Jotai**.
- **Atoms**: Composable units of state that don't trigger re-renders of unrelated components.

## 5. Persistence & Hydration
- **Middleware**: Use Zustand `persist` middleware for values that should survive refreshes (e.g., Theme, Cart items).
- **Hydration Safety**: Ensure components handle the "Hydration Mismatch" between server-render and client-persistence properly.

## Skills to Load
- `zustand-patterns`
- `url-state-nuqs`
- `server-components-architecture`
