# verify-all — Master Quality Gate Orchestrator

**Tier:** META — Runs all gates in correct order
**Applies to:** All stacks
**Trigger:** Before any final code delivery, on explicit `/generate-tests` or `studio validate` command, in CI/CD pipeline

---

## Execution Order (always in this sequence)

```
PHASE 1 — HARD GATES (Tier 1) — Run in parallel, all must pass
├── security-scan    (secrets, OWASP patterns)
├── ts-check         (compiler / type errors)
└── env-validator    (env var documentation)

If ANY Phase 1 gate fails → STOP. Fix. Re-run Phase 1. Do not proceed.

PHASE 2 — REQUIRED GATES (Tier 2) — Run in parallel, all must pass
├── dependency-audit        (CVE scan — auto-fix where possible)
├── license-audit           (license compliance — auto-fix where possible)
├── e2e-runner              (Playwright E2E — web frontend profiles only)
├── storybook-build         (Storybook compilation — if .storybook/ present)
├── chromatic-visual-test   (Visual regression — if CHROMATIC_PROJECT_TOKEN set)
├── lighthouse-ci           (Core Web Vitals — if prod build present)
└── contrast-checker        (WCAG AA color pairs — web frontend profiles only)

If any Tier 2 gate fails → BLOCK. Fix. Re-run gate. Do not proceed.
Exception: chromatic-visual-test without token → WARN only (advisory).

PHASE 3 — ADVISORY GATES (Tier 3) — Run in parallel, always continue
├── accessibility-audit    (WCAG 2.2 AA — axe-core)
├── bundle-analyzer        (bundle size budget)
├── performance-budget     (Core Web Vitals budget)
├── seo-linter             (metadata & structured data)
├── i18n-linter            (translation key coverage)
├── type-coverage          (typing completeness ≥ 90%)
├── dead-code-detector     (unused exports / packages)
└── animation-budget       (animation JS budget + reduced-motion check)

Always proceed after Phase 3. Attach advisory report to delivery.
```

---

## Stack Detection & Execution

```
package.json present        → bash .agent/scripts/verify-all/node.sh
requirements.txt present    → bash .agent/scripts/verify-all/python.sh
pom.xml / build.gradle      → bash .agent/scripts/verify-all/java.sh
*.csproj present            → bash .agent/scripts/verify-all/dotnet.sh
pubspec.yaml present        → bash .agent/scripts/verify-all/flutter.sh
```

---

## Delivery Summary Format

After all gates complete, attach this summary to every code delivery:

```
## Quality Gate Summary

### ✅ Hard Gates (Tier 1)
| Gate | Status | Details |
|------|--------|---------|
| Security Scan | ✅ PASS | No secrets or dangerous patterns |
| Type Check | ✅ PASS | 0 compiler errors |
| Env Validator | ✅ PASS | All vars documented |

### 🔒 Required Gates (Tier 2)
| Gate | Status | Details |
|------|--------|---------|
| Dependency Audit | ✅ PASS | No HIGH/CRITICAL CVEs |
| License Audit | ✅ PASS | All MIT/Apache |
| E2E Runner | ✅ PASS | 24/24 Playwright tests pass |
| Storybook Build | ✅ PASS | 42 stories compile |
| Chromatic Visual Test | ✅ PASS | No unreviewed changes |
| Lighthouse CI | ✅ PASS | LCP 1.8s, CLS 0.04, Perf 91 |
| Contrast Checker | ✅ PASS | All color pairs WCAG AA |

### 📊 Advisory Gates (Tier 3)
| Gate | Status | Details |
|------|--------|---------|
| Accessibility | ⚠️ 2 warnings | Missing alt text on hero image |
| Bundle Analyzer | ✅ PASS | +12kb within budget |
| Performance Budget | ✅ PASS | LCP 1.8s, CLS 0.05 |
| SEO Linter | ✅ PASS | All meta tags present |
| i18n Linter | ⚠️ 1 warning | 3 keys missing in fr-FR |
| Type Coverage | ✅ 94% | Above 90% threshold |
| Dead Code Detector | ⚠️ 4 warnings | 4 unused exports found |
| Animation Budget | ✅ PASS | 62KB total, all reduced-motion compliant |
```

---

## Skip Rules

| Gate | Skip When |
|------|-----------|
| accessibility-audit | No UI files generated |
| seo-linter | Internal/auth-only pages, or non-web stack |
| bundle-analyzer | No web build (Python/Java/Flutter) |
| performance-budget | No public-facing pages |
| i18n-linter | No i18n files present in project |
| e2e-runner | No playwright.config.ts present |
| storybook-build | No .storybook/ directory present |
| chromatic-visual-test | No .storybook/ directory present |
| lighthouse-ci | No dist/ or .next/ build output present |
| contrast-checker | Non-web stack (Python/Java/.NET/Flutter) |
| dead-code-detector | Non-TypeScript project |
| animation-budget | No animation libraries in package.json |
