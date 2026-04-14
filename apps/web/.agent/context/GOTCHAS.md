# Gotchas & Lessons Learned — @nexus/web
<!-- ──────────────────────────────────────────────────────────────────────────
  Record bugs discovered, traps hit, and lessons learned during development.
  Quick log: studio context log gotcha "what went wrong and how to fix it"
  Or add entries manually following the format below.

  WHY this matters: The AI reads this before every response. It will proactively
  WARN you when you are about to hit a known problem in this codebase.
──────────────────────────────────────────────────────────────────────────── -->

> **AI Instruction**: Read ALL gotchas before responding. If the current request
> involves code or patterns mentioned in a gotcha, proactively surface the warning
> BEFORE writing any code. Prefix the warning with ⚠️ **Known Gotcha:**.

---

## Gotcha Template

```
## [YYYY-MM-DD] — [Short Title]
- **Area**: [Which file, module, or package]
- **Problem**: [What went wrong or what surprised you]
- **Root Cause**: [Why it happened]
- **Fix / Workaround**: [What solved it]
- **Code**:
  ```language
  // The correct way to do it
  ```
```

---

## Gotchas

## [2026-04-10] — copilot-instructions.md hardcodes Next.js rules for all profiles
- **Area**: `packages/templates/.github/copilot-instructions.md` → `apps/studio/templates/.github/copilot-instructions.md`
- **Problem**: Template had hardcoded Next.js-specific rules (Server Components, `app/` file structure, `server/` directory) that were generated for ALL profiles including `react-vite`. This caused Copilot to suggest Server Components and App Router patterns in a pure SPA.
- **Root Cause**: Template used a single static ruleset with no Handlebars `{{#if}}` profile guards.
- **Fix**: Template rewritten to be profile-aware with `{{#if (eq profile "react-vite")}}` blocks. `apps/web/.github/copilot-instructions.md` manually regenerated with correct `react-vite` SPA rules.
- **Validation Status**: 🐛 FIX applied to `packages/templates` + synced to `apps/studio/templates`

## [2026-04-10] — ui-component-architect.md uses deprecated shadcn/v3 HSL-bare CSS variable format
- **Area**: `packages/templates/.agent/agents/ui-component-architect.md` (Design Token System section)
- **Problem**: Template showed `--background: 0 0% 100%` (bare HSL numbers) which is the **shadcn/Tailwind v3** pattern. These numbers have no meaning without `hsl()` and require Tailwind v3's `hsl(var(--background))` color channel plugin. In Tailwind v4, this pattern silently produces incorrect/empty colors. Also used `.dark {}` class instead of `[data-theme="dark"]`.
- **Root Cause**: Template copied from a shadcn/ui project that was built on Tailwind v3.
- **Fix**: Rewritten to use Tailwind v4 `@theme {}` format with actual hex/oklch values. `[data-theme="dark"]` for dark mode overrides.
- **Validation Status**: 🐛 FIX applied to `packages/templates` + synced to `apps/studio/templates`

## [2026-04-10] — design-system-architect.md uses @layer base wrapper (Tailwind v3 pattern) + undeclared Radix Colors dependency
- **Area**: `packages/templates/.agent/agents/design-system-architect.md` (Color System section)
- **Problem 1**: Used `@layer base { :root { ... } }` — in Tailwind v3, CSS vars for theming had to live inside `@layer base`. In v4, this is unnecessary. Brand tokens belong directly in `@theme {}`.
- **Problem 2**: Color system example uses `var(--violet-9)`, `var(--gray-1)` etc. without noting these require `@radix-ui/colors` package + CSS imports. New users would get undefined variables.
- **Fix**: Added explicit notes for both issues. Two options documented: Option A (Radix Colors, requires package) and Option B (direct hex/oklch in @theme, no package needed).
- **Validation Status**: 🐛 FIX applied to `packages/templates` + synced

## [2026-04-10] — shadcn-radix-ui SKILL.md CSS variables in HSL-bare format + Next.js-specific Section 4
- **Area**: `packages/templates/.agent/skills/shadcn-radix-ui/SKILL.md`
- **Problem**: Section 3 showed `--primary: 221.2 83.2% 53.3%` (HSL-bare, Tailwind v3 only) and `.dark {}` class. Section 4 said "In Next.js, prefer importing from specific files" — profile-specific advice in a generic skill used by react-vite and node-api too.
- **Fix**: CSS vars updated to Tailwind v4 `@theme` format. `.dark` → `[data-theme="dark"]`. "In Next.js" → "In any bundler".
- **Validation Status**: 🐛 FIX applied to `packages/templates` + synced

## [2026-04-10] — design-system workflow Phase 1 assumes style-dictionary for all profiles
- **Area**: `packages/templates/.agent/workflows/design-system.md`
- **Problem**: Phase 1 instructed `ls src/design-system/tokens/` and `npx style-dictionary build` — neither of which exists in a react-vite project. Our token setup is a `@theme {}` block in `globals.css` — no build pipeline. Running Phase 1 verbatim would fail with "no such file" errors.
- **Fix**: Phase 1 rewritten with two strategy branches: Strategy A (Tailwind v4 @theme in CSS file, for react-vite) and Strategy B (style-dictionary pipeline, for projects that have it configured). Each branch has its own checklist.
- **Validation Status**: 🐛 FIX applied to `packages/templates` + synced

## [2026-04-10] — studio sync/update does not regenerate IDE config files
- **Area**: `studio sync`, `studio update` commands — `src/commands/sync.ts`, `src/commands/update.ts`
- **Problem**: When a template in `packages/templates/.github/` changes (e.g. `copilot-instructions.md`), running `studio sync` or `studio update` only re-checks `.agent/` content. The `.github/`, `.cursor/`, `.windsurfrules` IDE configs are NOT regenerated. Users get no way to apply IDE config template fixes without re-running `studio init --force`.
- **Root Cause**: `generateIdeConfigs()` is only called during `init`. `sync` and `update` only call `copyTemplates()`.
- **Fix / Workaround**: Add a `studio sync --ide` flag or `studio update --ide` sub-command that calls `generateIdeConfigs()` with the current config. Log this improvement in the studio backlog.
- **Validation Status**: 🔧 IMPROVEMENT needed — not yet fixed

## [2026-04-12] — responsive-patterns SKILL.md Section 7 uses shadcn/ui Sheet components
- **Area**: `packages/templates/.agent/skills/responsive-patterns/SKILL.md` (all 3 copies)
- **Problem**: Section 7 (Navigation Responsiveness) used `<Sheet>`, `<SheetTrigger>`, and `<SheetContent>` components. These are **shadcn/ui** wrappers — they do NOT exist when using direct Radix (ADR-003). Building the mobile nav with the skill's example produces `Cannot find module 'shadcn/ui'` errors. Also used `useMediaQuery` hook which doesn't exist in React stdlib.
- **Root Cause**: Skill written assuming shadcn/ui setup. The Sheet component IS built on Radix Dialog, but only available after `shadcn add sheet`.
- **Fix**: Rewrote Section 7 to use `@radix-ui/react-dialog` + `@radix-ui/react-visually-hidden` directly. Replaced `useMediaQuery` with `useState` + hamburger button approach (cleaner, no hook needed).
- **Validation Status**: 🐛 Finding #11 FIX applied to `packages/templates` (all 3 copies)

## [2026-04-12] — Shiki `codeToHtml` bundles ALL language grammars as separate chunks
- **Area**: `src/components/docs/CodeBlock.tsx` + `vite.config.ts` manualChunks
- **Problem**: Using `codeToHtml` from the main `shiki` package causes Vite to generate 200+ separate chunk files — one per language grammar (typescript, python, rust, etc.) plus Shiki's theme files. Build output becomes very large with 200+ `.js` files in `dist/assets/`. Some grammar files are 500KB+ (cpp, wasm, emacs-lisp).
- **Root Cause**: `shiki` exports `codeToHtml` which internally references ALL grammars. Rollup tree-shakes to separate lazy chunks, but still generates them all.
- **Fix / Workaround Option A**: Use `createHighlighterCore` from `@shikijs/core` with only the specific language grammars you need (e.g., `bash`, `typescript`, `text`). This reduces chunk count from 200+ to ~5.
- **Fix / Workaround Option B (current)**: Accept the lazy chunks — they only load when a CodeBlock requests that specific language. Users visiting the site only download grammars for languages they actually see.
- **Code** (Option A — minimal Shiki):
  ```typescript
  // Replaces full shiki import
  import { createHighlighterCore, createSingletonShorthands } from "@shikijs/core";
  import { createOnigurumaEngine } from "@shikijs/engine-oniguruma";
  import langBash from "shiki/langs/bash.mjs";
  import langTs from "shiki/langs/typescript.mjs";
  import langText from "shiki/langs/text.mjs";
  import themeGithubDark from "shiki/themes/github-dark-dimmed.mjs";
  ```
- **Validation Status**: ✅ Finding #12 — FIXED. `createHighlighterCore` with 6 static lang imports now in use. Result: 250+ chunks → 28 chunks. Build time 2.04s → 1.39s. `index` bundle 244kb → 61kb. Only the WASM binary (622kb) remains large — it's unavoidable.

## [2026-04-12] — tailwind-design-system SKILL.md references wrong responsive skill ID
- **Area**: `packages/templates/.agent/skills/tailwind-design-system/SKILL.md` — "Skills to Load" section
- **Problem**: Listed `responsive-design-strategies` as a related skill. This ID does not exist in the registry. The correct skill ID is `responsive-patterns`.
- **Root Cause**: Inconsistent naming during skill creation — internal cross-references not validated.
- **Fix**: Updated to `responsive-patterns` in `packages/templates` canonical file.
- **Validation Status**: 🐛 Finding #13 FIX applied to `packages/templates`

## [2026-04-12] — vite.config.ts shows TypeScript errors in editor (false positive)
- **Area**: `apps/web/vite.config.ts` — `plugins: [react(), tailwindcss()]`
- **Problem**: Pylance/TS language server reports `Plugin<any>` type incompatibility. Error message: two incompatible Vite types from `node_modules/vite` vs `apps/web/node_modules/vite`.
- **Root Cause**: Monorepo has two Vite instances — root `node_modules/vite` (used by studio CLI) and `apps/web/node_modules/vite` (used by the web app). TypeScript resolves conflicting type definitions between them.
- **Fix / Workaround**: `tsc --noEmit` and `vite build` both PASS — only the language server is confused. This is a false positive. To silence it: add `"skipLibCheck": true` to `tsconfig.node.json` (already there) or deduplicate Vite by installing it only at the workspace root.
- **Validation Status**: 🔧 Finding #14 — KNOWN FALSE POSITIVE. Build passes. IDE error is noise.
