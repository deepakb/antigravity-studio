---
name: react-patterns
description: "Advanced patterns for React 19 and Next.js 15 Server Components (RSC). Focuses on Architecture Boundaries, Composition, and Data Coupling."
---

# SKILL: Enterprise React & RSC Patterns

## Overview
Advanced patterns for **React 19** and **Next.js 15 Server Components (RSC)**. Focuses on **Architecture Boundaries**, **Composition**, and **Data Coupling**.

## 1. RSC/CC Boundary Discipline
The most critical skill in modern React is knowing where to draw the line.
- **RSC (Default)**: Use for Data Fetching, DB calls, and Static Layouts.
- **CC ('use client')**: Use only for Interactivity (onClick), Browser APIs (localStorage), and Real-time updates.
- **Optimization**: Pass RSCs as `children` or `props` to CCs to keep the main tree server-rendered.

## 2. Composition over Inheritance
Avoid giant components with 20+ props.
- **Pattern**: Split into focused sub-components. Access shared context via `React.use()` or `Context.Provider`.
- **Inversion of Control**: Design components that accept UI slots (e.g., `<Card header={<Button />} />`).

## 3. Action-Driven State (React 19)
- **useActionState**: Leverage the new React 19 hook for managing form state without `useEffect`.
- **useOptimistic**: Provide sub-100ms feedback for database mutations.

## 4. Performance & Memoization
- **React Compiler**: Note that manual `useMemo` and `useCallback` are becoming less necessary, but still critical for heavy libraries that don't support the compiler yet.
- **Strict Mode**: Ensure all components are "Pure functions" — no side effects during the render cycle.

## 5. Clean Architecture in React
- **Logic Isolation**: Extract complex `useEffect` or mathematical logic into custom hooks (`useDomainLogic`).
- **Data Fetching**: Use a **Data Access Layer (DAL)** pattern. Never fetch raw `fetch()` inside a component if it can be abstracted into a server-side repository.

## Skills to Load
- `nextjs-app-router`
- `react-hook-patterns`
- `data-access-layer-dal`
