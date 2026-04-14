---
description: Preview — validate the running local dev server before shipping or reviewing
---

# /preview Workflow

> **Purpose**: Quickly validate that the local dev server is running correctly — check for console errors, verify hot module replacement, and confirm the feature under development is rendering as expected before proceeding to tests or PR.

## When to Use
- Before running `generate-tests` or `generate-e2e`
- After major refactors that could break the dev experience
- When onboarding a new developer to validate their setup
- Before starting a `/ship` workflow

## Step 1: Start Dev Server

```bash
# Detect stack and run appropriate dev command
npm run dev          # Node / React / Vue / Svelte / Next.js / Nuxt
python -m uvicorn main:app --reload   # FastAPI
./gradlew bootRun                      # Java Spring
dotnet watch run                       # .NET
```

Confirm: Server starts without errors on expected port.

## Step 2: Browser Validation

Open the running app and check:

| Check | Expected |
|-------|----------|
| Page loads without white screen | ✅ |
| Console: zero errors | ✅ |
| Console: zero unhandled promise rejections | ✅ |
| Network: no 404 on static assets | ✅ |
| HMR: edit a file → page updates without full reload | ✅ |

## Step 3: Feature Smoke Test

For the current feature under development:
1. Navigate to the affected route(s)
2. Trigger the primary user action
3. Verify the expected outcome renders
4. Check network tab — expected API calls fire, no 4xx/5xx

## Step 4: Cross-Device Check (if UI change)

- Resize to 375px (mobile) — no horizontal overflow
- Resize to 768px (tablet) — layout adapts correctly
- Check dark/light mode toggle (if applicable)

## Step 5: Accessibility Quick Check

- Tab through interactive elements — focus visible?
- Screen reader announces key content? (quick VoiceOver/NVDA check)
- Color contrast appears correct?

## Output

```
✅ Preview: PASS
   Dev server: running on :3000
   Console errors: 0
   Feature smoke test: passed
   Responsive: OK at 375px, 768px, 1440px

➡️ Next: Ready for /generate-tests or /ship
```
