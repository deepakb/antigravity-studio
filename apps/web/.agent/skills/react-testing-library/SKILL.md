---
name: react-testing-library
description: "Strategies for Reliable React Testing with Vitest and React Testing Library (RTL). Focuses on Accessible Queries, User Event Simulation, and Asynch..."
---

# SKILL: Enterprise React Testing Library

## Overview
Strategies for **Reliable React Testing** with **Vitest** and **React Testing Library (RTL)**. Focuses on **Accessible Queries**, **User Event Simulation**, and **Asynchronous Resilience**.

## 1. Accessibility-First Queries
Never query by `testId` as a first choice.
- **Priority**: `getByRole` → `getByLabelText` → `getByPlaceholderText` → `getByText`.
- **Reason**: If the test passes but a screen reader can't find it, the test is lying.

## 2. User Event Simulation
- **Protocol**: Use `@testing-library/user-event` instead of `fireEvent`.
- **Benefit**: Simulates real browser behavior (Focus, Keyboard tab, Delay) that `fireEvent` misses.

## 3. Asynchronous Coordination (find queries)
- **Pattern**: Use `findBy...` queries (which return a Promise) for elements that appear after a fetch.
- **Constraint**: Never use `waitFor` with a specific timeout unless testing a timer logic. Wait for the *result* to appear.

## 4. Mocking Service Workers (MSW)
- **Standard**: Use **MSW** to mock API responses at the network level.
- **Success**: Your components remain "unaware" of the mock, making tests more realistic.

## 5. Avoiding Implementation Detail Tests
- **Standard**: Test what the user *sees*, not how the component *works* (state, props, internal methods).

## Skills to Load
- `vitest-unit-testing`
- `accessibility-wcag`
- `mock-service-worker-msw`
