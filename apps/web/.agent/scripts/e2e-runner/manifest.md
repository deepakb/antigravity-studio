````markdown
# e2e-runner — End-to-End Test Runner (Playwright)

**Tier:** TIER 2 — REQUIRED (blocks if tests fail)
**Applies to:** React+Vite, Next.js frontend profiles
**Not applicable:** Backend-only, Python, Java, .NET (use API testing instead)
**Trigger:** Before every PR merge, after feature completion

---

## What This Gate Checks

- All Playwright E2E test suites pass (`.spec.ts` files)
- Critical user flows are covered: auth, checkout, primary CRUD, navigation
- Page Object Model files compile without errors
- No skipped tests (`test.skip`) in CI unless tagged `@wip`
- Test reports generated to `playwright-report/`

---

## Coverage Requirements

| Flow | Required |
|------|---------|
| Authentication (login / logout) | ✅ Required |
| Primary creation flow (form submit) | ✅ Required |
| Navigation & routing | ✅ Required |
| Error states (404, server error) | ✅ Required |
| Mobile viewport (375px) | ✅ Required |

---

## Blocking Behavior

| Result | Action |
|--------|--------|
| All tests pass | PASS — CI continues |
| 1+ tests fail | BLOCK — output failure report, do not merge |
| No test files found | WARN — advise adding E2E coverage |
| `test.skip` without `@wip` | BLOCK in production branch |

---

## Execution

```
React+Vite / Next.js → bash .agent/scripts/e2e-runner/node.sh
```

---

## Fix Guidance

1. Run `npx playwright test --headed` locally to debug visually
2. Check `playwright-report/index.html` for failure screenshots
3. Use `--debug` flag for step-by-step trace: `npx playwright test --debug`
4. Flaky tests: add retry strategy in `playwright.config.ts`: `retries: process.env.CI ? 2 : 0`
5. Timeout issues: increase `timeout` in specific test or use `waitForLoadState("networkidle")`

````
