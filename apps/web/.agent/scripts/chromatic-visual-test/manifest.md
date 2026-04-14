````markdown
# chromatic-visual-test — Chromatic Visual Regression Gate

**Tier:** TIER 2 — REQUIRED (blocks on unreviewed visual changes)
**Applies to:** React+Vite, Next.js frontend profiles with Storybook
**Not applicable:** Backend-only APIs, projects without Storybook
**Trigger:** Every PR — compares story snapshots against approved baseline

---

## What This Gate Checks

- All Storybook stories render without console errors
- No unreviewed pixel-level changes vs approved baseline
- New stories are reviewed and baselined before merge
- Storybook build succeeds (zero compilation errors)
- Accessibility checks pass in all stories (`@storybook/addon-a11y`)

---

## Pixel Difference Thresholds

| Change Type | Action |
|-------------|--------|
| 0% difference | PASS — no visual change |
| < 0.063% difference | PASS — within anti-aliasing tolerance |
| ≥ 0.063% difference | REVIEW REQUIRED — cannot merge until approved |
| New story (no baseline) | REVIEW REQUIRED — must accept new baseline |
| Story removed | AUTO-ACCEPT — deletion is not a regression |

---

## Blocking Behavior

| Result | Action |
|--------|--------|
| No changes | PASS — CI continues |
| Changes present + approved | PASS — reviewer approved in Chromatic UI |
| Changes present + unreviewed | BLOCK — must review at chromatic.com |
| Storybook build fails | BLOCK — fix story compilation errors first |

---

## Execution

```
Projects with Storybook → bash .agent/scripts/chromatic-visual-test/node.sh
```

---

## Fix Guidance

1. **Unintentional visual change**: Revert the CSS/component change causing the diff
2. **Intentional visual change**: Accept the new baseline in Chromatic UI (`chromatic.com`)
3. **Storybook build fail**: Run `npm run build-storybook` locally to see errors
4. **Flaky snapshots**: Add `disableSnapshot: true` to stories with dynamic content (random colors, dates)
5. **Setup Chromatic**: Set `CHROMATIC_PROJECT_TOKEN` in GitHub Secrets, add `chromatic.yml` workflow

````
