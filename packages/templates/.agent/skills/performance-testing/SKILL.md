---
name: performance-testing
description: "Automated Performance Auditing using Lighthouse CI and K6. Focuses on Continuous Monitoring, Web Vitals Regression, and Load Resilience."
---

# SKILL: Enterprise Performance Testing (LHCI)

## Overview
Automated **Performance Auditing** using **Lighthouse CI** and **K6**. Focuses on **Continuous Monitoring**, **Web Vitals Regression**, and **Load Resilience**.

## 1. Lighthouse CI (LHCI)
Automate your performance score.
- **Gate**: Fail CI if any Core Web Vital (LCP, FID, CLS) or Accessibility score drops below 90.
- **Environment**: Run Lighthouse in CI against a static build for consistent, noise-free results.

## 2. Load Testing (K6)
Can your system handle 10,000 users?
- **Pattern**: Use `k6` to simulate high-traffic scenarios (e.g., Black Friday, Project Launch).
- **Metric**: Monitor `p95` response times; ensure they stay below 1s under 50 concurrent requests per instance.

## 3. Real User Monitoring (RUM) Correlation
Correlation between lab tests (LHCI) and field data (RUM).
- **Strategy**: Inject a small performance script (`web-vitals` library) to log real-world LCP and INP to your analytics provider.

## 4. Bundle Size Budgets
- **Check**: Fail the build if the main JS bundle increases by more than 5kb in a single PR.
- **Tool**: `bundlesize` or `next-bundle-analyzer`.

## 5. Performance Profiling (Flame Charts)
Identify the "Long Tasks" stealing the main thread.
- **Analysis**: Use Chrome DevTools `Performance` tab. Look for blocks of JS over 50ms.
- **Fix**: Move them to a **Web Worker** or use **React Transitions** to prioritize UI updates.

## Skills to Load
- `core-web-vitals-monitoring`
- `bundle-size-governance`
- `lighthouse-ci-integration`

---

## Verification Scripts (MANDATORY)

- **Performance Budget**: `studio run performance-budget`
- **Bundle Analysis**: `studio run bundle-analyzer`
