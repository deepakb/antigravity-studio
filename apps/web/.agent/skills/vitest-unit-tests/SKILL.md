---
name: vitest-unit-tests
description: "High-integrity Unit Testing with Vitest. Focuses on TDD (Test-Driven Development), Mocking Resilience, and Code Coverage Governance."
---

# SKILL: Enterprise Vitest Unit Testing

## Overview
High-integrity **Unit Testing** with **Vitest**. Focuses on **TDD (Test-Driven Development)**, **Mocking Resilience**, and **Code Coverage Governance**.

## 1. Test-Driven Development (TDD) Workflow
Write tests first to define the contract.
- **Protocol**: RED (Write failing test) → GREEN (Make it pass) → REFACTOR (Cleanup).
- **Benefit**: Ensures 100% of code is testable and prevents unused feature bloat.

## 2. Advanced Mocking (vi.mock)
Never let your unit tests hit a real database or network.
- **Rule**: Use `vi.mock()` for external modules. Use `vi.fn()` for dependency injection.
- **Resilience**: Ensure mocks are cleared between every test using `beforeEach(() => vi.clearAllMocks())`.

## 3. Snapshot Testing (Selective Use)
- **Pattern**: Use snapshots only for large, static objects like config files or complex JSON outputs.
- **Anti-pattern**: Avoid snapshots for React components (they mask logic changes). Use `getByRole` or `getByText` assertions instead.

## 4. Coverage Governance (C8)
- **Standard**: Minimum 80% coverage for Domain logic and Utilities.
- **Check**: Use the `--coverage` flag and enforce thresholds in `vitest.config.ts`.

## 5. In-Source Testing
For simple utilities, keep the test inside the file using `if (import.meta.vitest)`.
- **Benefit**: Keeps utility logic and its documentation (tests) together.

## Skills to Load
- `testing-library-react`
- `mock-service-worker-msw`
- `coverage-reporting-strategies`

---

## Verification Scripts (MANDATORY)

> [!IMPORTANT]
> Run the master quality gate after significant changes to ensure all enterprise standards are met.

- **Master Quality Gate**: `studio run verify-all`
