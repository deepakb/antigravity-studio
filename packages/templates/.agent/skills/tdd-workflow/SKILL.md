---
name: tdd-workflow
description: "Standards for Test-Driven Development (TDD) in enterprise environments. Focuses on Contract-First Testing, Red-Green-Refactor, and Regression Safety."
---

# SKILL: Enterprise TDD Workflow

## Overview
Standards for **Test-Driven Development (TDD)** in enterprise environments. Focuses on **Contract-First Testing**, **Red-Green-Refactor**, and **Regression Safety**.

## 1. Contract-First Testing
- **Strategy**: Define the `interface` and the `test` before writing any implementation code.
- **Benefit**: Ensures the API is designed for the consumer, not for the convenience of the implementation.

## 2. The 3 Laws of TDD
1. You may not write any production code until you have written a failing unit test.
2. You may not write more of a unit test than is sufficient to fail.
3. You may not write more production code than is sufficient to pass the failing unit test.

## 3. Regression-Driven Development
- **Rule**: Before fixing a bug, write a test that reproduces it.
- **Success**: The fix is only complete when the new test passes and no old tests fail.

## 4. Test Isolation & Speed
- **Standard**: Unit tests must not touch the Disk, Network, or Database.
- **Mocking**: Use `vi.mock()` for fast, deterministic feedback in under 1 second.

## 5. Mutation Testing
- **Advanced**: Use tools like `Stryker` to ensure your tests actually fail if the code is changed (detecting "False Positives" or "Weak Assertions").

## Skills to Load
- `vitest-unit-testing`
- `regression-strategies`
- `continuous-integration-cicd`
