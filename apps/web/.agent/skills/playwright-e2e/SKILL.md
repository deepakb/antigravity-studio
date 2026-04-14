---
name: playwright-e2e
description: "Reliable, flake-free End-to-End (E2E) Testing with Playwright. Focuses on Page Object Model (POM), Visual Regression, and OIDC Auth State."
---

# SKILL: Enterprise Playwright E2E

## Overview
Reliable, flake-free **End-to-End (E2E) Testing** with **Playwright**. Focuses on **Page Object Model (POM)**, **Visual Regression**, and **OIDC Auth State**.

## 1. Page Object Model (POM)
Never repeat selectors. Abstract interactions into classes.
- **Pattern**: `LoginPage`, `DashboardPage`.
- **Method**: `loginPage.submit(user, pass)`.
- **Benefit**: If a CSS selector changes, you only update it in one file.

## 2. Visual Regression Testing
Check that your UI hasn't shifted by a single pixel.
- **Tool**: `expect(page).toHaveScreenshot()`.
- **Environment**: Must run in a Linux-based Docker container to ensure pixel consistency across dev and CI.

## 3. Global Auth State (OIDC/NextAuth)
Don't login before every test — it's too slow.
- **Protocol**: Perform one login in a "Setup" project. Save the `storageState` to a file.
- **Testing**: Other tests "inject" this cookie to start already logged in.

## 4. Stability: Auto-waiting & Locators
- **Locators**: Always prefer User-facing locators (`getByRole`, `getByLabel`, `getByText`).
- **Waiting**: Trust Playwright's auto-waiting. Avoid `page.waitForTimeout()` at all costs.

## 5. Performance: Trace Viewer & Reports
- **Trace Viewer**: Enable `trace: 'on-first-retry'` to record a video, console logs, and network traffic for every failure.
- **Reports**: Use the HTML reporter to analyze long-running tests.

## Skills to Load
- `automated-e2e-strategies`
- `visual-regression-testing`
- `playwright-tracing-analysis`
