import { useLoaderData } from "react-router";
import type { qualityGatesLoader } from "./quality-gates.loader";
import { Badge } from "@/components/ui";
import { CodeBlock } from "@/components/docs/CodeBlock";

/**
 * Quality Gates — grouped by enforcement tier with full descriptions and CLI commands.
 * Colours use CSS tokens (not raw Tailwind classes) so they respect theme switching.
 *
 * 🤖 @frontend-specialist + @ui-design-engineer
 */

// ── Gate metadata ─────────────────────────────────────────────────────────

interface GateMeta {
  name: string;
  description: string;
  tool?: string;
}

const GATE_META: Record<string, GateMeta> = {
  "security-scan": {
    name: "Security Scan",
    description: "Scans for OWASP Top-10 vulnerabilities, insecure dependency versions, and accidentally committed secrets. Fails hard on any Critical or High severity finding.",
    tool: "audit-ci + semgrep",
  },
  "ts-check": {
    name: "TypeScript Check",
    description: "Runs tsc --noEmit in strict mode. Fails on any type error — no implicit any, no unchecked index access. Enforces full type safety across the codebase.",
    tool: "tsc",
  },
  "env-validator": {
    name: "Env Validator",
    description: "Validates that all required environment variables are present and correctly typed using a Zod schema. Catches missing API keys before a deployment reaches production.",
    tool: "zod",
  },
  "dependency-audit": {
    name: "Dependency Audit",
    description: "Audits npm/pnpm packages for known vulnerabilities. Automatically bumps patch-level updates and re-runs. Fails only when auto-fix is insufficient.",
    tool: "npm audit",
  },
  "license-audit": {
    name: "License Audit",
    description: "Scans all transitive dependency licenses and flags any that conflict with your organization's allowed-list (default: MIT, Apache-2.0, BSD). Prevents accidental GPL inclusion.",
    tool: "license-checker",
  },
  "accessibility-audit": {
    name: "Accessibility Audit",
    description: "Runs axe-core against server-rendered pages and components. Flags WCAG 2.2 AA violations including missing alt text, insufficient contrast, and broken ARIA semantics.",
    tool: "axe-core",
  },
  "bundle-analyzer": {
    name: "Bundle Analyzer",
    description: "Measures JavaScript chunk sizes after a production build. Flags any chunk that exceeds the configured budget (default: 250 kB initial, 1 MB total) and identifies the largest contributors.",
    tool: "webpack-bundle-analyzer / rollup-plugin-visualizer",
  },
  "performance-budget": {
    name: "Performance Budget",
    description: "Enforces Lighthouse performance score thresholds on key pages. Fails when Performance < 80, LCP > 2.5s, or CLS > 0.1. Integrates with CI for score trending.",
    tool: "lighthouse",
  },
  "seo-linter": {
    name: "SEO Linter",
    description: "Validates presence and correctness of meta title, description, OpenGraph tags, Twitter Cards, and JSON-LD structured data on all pages.",
    tool: "next-seo / custom AST lint",
  },
  "i18n-linter": {
    name: "i18n Linter",
    description: "Detects hardcoded strings that should be extracted to translation files and checks for missing keys across all locale files.",
    tool: "i18n-ally / custom lint",
  },
  "type-coverage": {
    name: "Type Coverage",
    description: "Measures the percentage of TypeScript nodes that have explicit types. Fails when coverage drops below the configured threshold (default: 95%).",
    tool: "type-coverage",
  },
  "verify-all": {
    name: "Verify All",
    description: "Orchestrator gate that runs the complete configured gate suite in dependency order. Use this as your single CI step to run all gates in the right sequence.",
    tool: "Nexus Studio orchestrator",
  },
  "lighthouse-ci": {
    name: "Lighthouse CI",
    description: "Automates Lighthouse audits across all routes in CI/CD. Tracks score history over time and blocks PRs when scores regress beyond the configured delta.",
    tool: "lighthouse-ci (LHCI)",
  },
  "dead-code-detector": {
    name: "Dead Code Detector",
    description: "Finds unused exports, unreferenced files, and dead code branches. Keeps the codebase lean and prevents deprecated code from accumulating silently.",
    tool: "knip",
  },
  "e2e-runner": {
    name: "E2E Test Runner",
    description: "Runs the full Playwright (or Cypress) end-to-end test suite against a production build. Uses sharding for parallel execution across CI workers.",
    tool: "playwright",
  },
  "contrast-checker": {
    name: "Contrast Checker",
    description: "Validates WCAG 2.2 color contrast ratios across all foreground/background combinations defined in the design token system. Covers both light and dark themes.",
    tool: "contrast-ratio / custom",
  },
  "animation-budget": {
    name: "Animation Budget",
    description: "Profiles CSS animations and JavaScript-driven transitions. Flags any animation that causes layout thrashing or exceeds the 16ms frame budget (60 fps) on a mid-range device.",
    tool: "Puppeteer + Chrome DevTools Protocol",
  },
  "storybook-build": {
    name: "Storybook Build",
    description: "Runs storybook build to validate that every component story compiles cleanly. Catches prop-type mismatches and import errors that don't surface in unit tests.",
    tool: "storybook",
  },
  "chromatic-visual-test": {
    name: "Chromatic Visual Test",
    description: "Captures pixel-by-pixel snapshots of every Storybook story and compares them against approved baselines. Blocks PRs when unexpected visual changes are detected.",
    tool: "chromatic",
  },
};

// ── Static tier membership ────────────────────────────────────────────────

const TIER_GROUPS = [
  {
    tier: 1 as const,
    label: "Tier 1 · Hard Block",
    description:
      "Blocks CI and rejects merges on failure. These gates must pass before any code reaches production. Zero exceptions.",
    ids: ["security-scan", "ts-check", "env-validator"],
  },
  {
    tier: 2 as const,
    label: "Tier 2 · Auto-Fix",
    description:
      "Attempts automated repair and re-runs. Fails the build only if the automatic fix cannot be applied. Promotes a clean-by-default baseline.",
    ids: ["dependency-audit", "license-audit"],
  },
  {
    tier: 3 as const,
    label: "Tier 3 · Advisory",
    description:
      "Emits warnings and detailed reports but never blocks CI or merges. Use for continuous improvement metrics and trend tracking.",
    ids: [
      "accessibility-audit",
      "bundle-analyzer",
      "performance-budget",
      "seo-linter",
      "i18n-linter",
      "type-coverage",
      "verify-all",
      "lighthouse-ci",
      "dead-code-detector",
      "e2e-runner",
      "contrast-checker",
      "animation-budget",
      "storybook-build",
      "chromatic-visual-test",
    ],
  },
] as const;

// CSS-token-based colour maps
const TIER_STYLE: Record<1 | 2 | 3, { dot: string; heading: string; badge: string; border: string }> = {
  1: {
    dot:    "bg-(--color-error)",
    heading:"text-(--color-error)",
    badge:  "border border-(--color-error)/25 bg-(--color-error)/10 text-(--color-error)",
    border: "border-(--color-error)/20",
  },
  2: {
    dot:    "bg-(--color-warning)",
    heading:"text-(--color-warning)",
    badge:  "border border-(--color-warning)/25 bg-(--color-warning)/10 text-(--color-warning)",
    border: "border-(--color-warning)/20",
  },
  3: {
    dot:    "bg-(--color-success)",
    heading:"text-(--color-success)",
    badge:  "border border-(--color-success)/25 bg-(--color-success)/10 text-(--color-success)",
    border: "border-(--color-success)/20",
  },
};

export default function QualityGatesPage() {
  const { gates } = useLoaderData<typeof qualityGatesLoader>();
  const profileCount = new Map(gates.map((g) => [g.id, g.usedBy.length]));
  const totalGates = TIER_GROUPS.reduce((sum, t) => sum + t.ids.length, 0);

  return (
    <article className="mx-auto max-w-3xl">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="mb-10">
        <Badge variant="muted" className="mb-4">Quality Gates</Badge>
        <h1 className="mb-3 text-4xl font-bold">Quality Gates</h1>
        <p className="text-lg text-(--color-muted)">
          {totalGates} automated checks in 3 enforcement tiers. Run any gate via{" "}
          <code className="rounded bg-(--color-surface-raised) px-1.5 py-0.5 font-mono text-sm text-(--color-nexus-blue)">
            studio run &lt;gate&gt;
          </code>{" "}
          or run all with{" "}
          <code className="rounded bg-(--color-surface-raised) px-1.5 py-0.5 font-mono text-sm text-(--color-nexus-blue)">
            studio run
          </code>.
        </p>
      </div>

      {/* ── Tier summary cards ─────────────────────────────────────────── */}
      <section className="mb-10" id="enforcement-tiers">
        <h2 className="mb-4 text-xl font-semibold">Enforcement Tiers</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {TIER_GROUPS.map(({ tier, label, ids }) => {
            const style = TIER_STYLE[tier];
            return (
              <div
                key={tier}
                className={`rounded-xl border bg-(--color-surface) p-4 ${style.border}`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} aria-hidden />
                  <span className={`text-xs font-semibold ${style.heading}`}>Tier {tier}</span>
                </div>
                <p className="text-2xl font-bold">{ids.length}</p>
                <p className="text-xs text-(--color-muted)">{label.split("·")[1]?.trim() ?? label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Tier sections ─────────────────────────────────────────────── */}
      {TIER_GROUPS.map(({ tier, label, description, ids }) => {
        const style = TIER_STYLE[tier];
        return (
          <section
            key={tier}
            id={`tier-${tier}`}
            className="mb-12 border-t border-(--color-border) pt-8 first:border-t-0 first:pt-0"
          >
            {/* Tier heading */}
            <div className="mb-2 flex items-center gap-2.5">
              <span className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`} aria-hidden />
              <h2 className={`text-sm font-semibold uppercase tracking-widest ${style.heading}`}>
                {label}
              </h2>
            </div>
            <p className="mb-6 text-sm text-(--color-muted)">{description}</p>

            {/* Gate cards */}
            <div className="space-y-3">
              {ids.map((id) => {
                const count = profileCount.get(id);
                const meta = GATE_META[id];
                return (
                  <div
                    key={id}
                    className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 transition-colors hover:bg-(--color-surface-raised)"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-sm text-(--color-foreground)">
                            {meta?.name ?? id}
                          </span>
                          <code className="font-mono text-[11px] text-(--color-nexus-blue)">
                            {id}
                          </code>
                        </div>
                        {meta?.description && (
                          <p className="text-xs text-(--color-muted) leading-relaxed">
                            {meta.description}
                          </p>
                        )}
                        {meta?.tool && (
                          <p className="mt-1.5 text-[11px] text-(--color-muted)">
                            <span className="font-medium">Tool: </span>
                            <code className="font-mono">{meta.tool}</code>
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${style.badge}`}>
                          T{tier}
                        </span>
                        {count !== undefined && (
                          <span className="text-[10px] text-(--color-muted)">{count} profiles</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* ── Running gates ─────────────────────────────────────────────── */}
      <section id="running-gates">
        <h2 className="mb-4 text-xl font-semibold">Running Gates</h2>
        <p className="mb-4 text-(--color-muted)">
          Gates are designed to run both locally during development and in CI/CD pipelines.
        </p>
        <CodeBlock
          code={`# Run all configured gates
npx @nexus/studio run

# Run a specific gate by ID
npx @nexus/studio run security-scan
npx @nexus/studio run ts-check

# Run only Tier 1 (hard-block) gates — ideal for pre-push hooks
npx @nexus/studio run --tier 1

# JSON output for CI parsing
npx @nexus/studio run --json`}
          lang="bash"
        />
      </section>
    </article>
  );
}

