---
description: chromatic — visual regression baseline management, story snapshot review, and Chromatic CI approval workflow for React+Vite design systems
agent: agent
tools: [search/codebase, terminal]
---

# /chromatic Workflow

> **Purpose**: Manage the Chromatic visual regression baseline — review pending snapshot changes, approve intended visual updates, reject unintended regressions, and establish baselines for new components.

## 🤖 Activation
```
🤖 Applying @design-system-architect + @creative-director
   Loading: storybook-driven-development skill...
```

---

## 🎯 When to Use

| Situation | Action |
|-----------|--------|
| PR has pending Chromatic changes | Review and approve/reject |
| New component stories added | Accept new baseline snapshots |
| Design token updated (intentional) | Accept all affected stories |
| Unexpected visual change on PR | Investigate root cause, reject |
| Weekly baseline health check | Verify no drift has accumulated |

---

## Phase 1: Check Status

```bash
# Check current Chromatic build status
studio run chromatic-visual-test

# Or view directly in Chromatic UI
# → chromatic.com/builds → select your project
```

**Status indicators:**
```
🟢 Accepted  — Baseline approved, no new changes
🟡 Pending   — Changes detected, awaiting review  
🔴 Denied    — Change was rejected (regression caught)
⚪ No diff   — Story unchanged vs baseline
```

---

## Phase 2: Review Pending Changes

For each story with a diff, apply this decision tree:

```
Is this change intentional?
│
├── YES → Did a design token, CVA variant, or component update cause it?
│         ├── YES → ACCEPT — update baseline
│         └── NO  → Investigate further (side effect from another change)
│
└── NO  → REJECT — this is a visual regression
           → Find the CSS/component change that caused it
           → Fix the regression before merging
```

**Common intentional changes to accept:**
- Design token value updated (color, spacing, radius)
- New CVA variant added to a component
- Dark mode implementation added
- Typography scale adjusted
- Component refactored visually (with designer approval)

**Common regressions to reject:**
- Tailwind class accidentally removed
- CSS specificity conflict introduced
- Font not loading (FOIT causing fallback render)
- Component renders differently at a story's specific viewport
- Third-party package update changed visual output

---

## Phase 3: Baseline for New Components

When new stories are added, Chromatic creates **orphan snapshots** with no baseline:

```bash
# Locally build and push new baseline
CHROMATIC_PROJECT_TOKEN=<token> npx chromatic \
  --only-story-names "Design System/Atoms/NewButton*" \
  --auto-accept-changes
```

**Or in Chromatic UI:**
1. Open the build with new stories
2. Click "Accept all new stories" (green button)
3. This creates the baseline — future PRs compare against it

---

## Phase 4: Investigate Unexpected Diffs

```bash
# Find what changed in the diff
git log --oneline -10
git diff HEAD~1 -- src/design-system/

# Check if a token change caused cascading visual changes
grep -r "color-brand\|color-surface\|color-text" src/design-system/tokens/

# Run locally to reproduce
npm run build-storybook
npx chromatic --project-token=<token> --dry-run
```

**Root cause categories:**
```
1. Token cascade    → One token change affects 20 stories — expected
2. Font FOUT        → Font loaded late during snapshot — fix with font preload
3. Animation frame  → GSAP/Framer captured mid-animation — add disableSnapshot
4. Viewport mismatch → Story viewport changed — check story parameters
5. Random data      → Story uses Math.random() — use fixed seed
```

**Fix for animated stories:**
```typescript
// Prevent Chromatic from snapshotting mid-animation
export const AnimatedCard: Story = {
  parameters: {
    chromatic: { disableSnapshot: true }  // ← Skip Chromatic for animated stories
  }
};
```

---

## Phase 5: Chromatic CI Configuration

```json
// lighthouserc.json equivalent for Chromatic — chromatic.config.json
{
  "projectId": "your-project-id",
  "onlyChanged": true,
  "exitZeroOnChanges": false,
  "autoAcceptChanges": "main",
  "skipUpdateCheck": true,
  "storybookBuildDir": "storybook-static"
}
```

```yaml
# .github/workflows/chromatic.yml
name: Chromatic
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }         # Full history for change detection
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - name: Publish to Chromatic
        uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          onlyChanged: true
          exitZeroOnChanges: false        # Block PR on unreviewed changes
          autoAcceptChanges: main         # Auto-accept on main branch merges
```

---

## Quick Commands

| Intent | Command |
|--------|---------|
| Run visual test gate | `studio run chromatic-visual-test` |
| Build Storybook locally | `npm run build-storybook` |
| Push to Chromatic manually | `npx chromatic --project-token=<TOKEN>` |
| Accept all changes (main) | `npx chromatic --project-token=<TOKEN> --auto-accept-changes` |
| Only test changed stories | `npx chromatic --project-token=<TOKEN> --only-changed` |
| View build history | `https://chromatic.com/builds?appId=<YOUR_APP_ID>` |
