/**
 * Agent Gate Map — shared lookup module
 *
 * Maps every quality-gate script (by ID and by display label) to the agent(s)
 * that own it and the skill that backs it. Used by:
 *   - run.ts      → inline "🤖 @agent  ⎿ Loading skill: X" before execution
 *   - validate.ts → coalition grouping display before running gates
 *   - sync.ts     → agent hint next to drifted template entries
 *   - doctor.ts   → "Affects: @agent" annotation on failing health checks
 */

import chalk from "chalk";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GateAgentInfo {
  /** Agent IDs that own / are responsible for this gate */
  agents: string[];
  /** Skill ID that the primary agent loads for this gate (optional) */
  skill?: string;
  /** Approximate token budget for the skill (used in display) */
  tokenBudget?: number;
}

// ── Master mapping ─────────────────────────────────────────────────────────────
// Keys are:
//   a) script gate IDs     (used by run.ts and sync.ts)
//   b) check display labels (used by validate.ts native/polyglot checks)

export const SCRIPT_AGENT_MAP: Record<string, GateAgentInfo> = {
  // ── Script gate IDs ────────────────────────────────────────────────────────
  "security-scan":       { agents: ["security-engineer", "llm-security-officer"], skill: "owasp-top10",          tokenBudget: 450 },
  "ts-check":            { agents: ["tech-lead", "qa-engineer"],                  skill: "solid-principles",      tokenBudget: 450 },
  "env-validator":       { agents: ["devops-engineer"],                           skill: "github-actions-ci-cd",  tokenBudget: 400 },
  "dependency-audit":    { agents: ["devops-engineer", "security-engineer"],      skill: "owasp-top10",           tokenBudget: 450 },
  "license-audit":       { agents: ["enterprise-architect"]                                                                        },
  "accessibility-audit": { agents: ["accessibility-auditor"],                     skill: "accessibility-wcag",    tokenBudget: 400 },
  "bundle-analyzer":     { agents: ["react-performance-guru", "devops-engineer"], skill: "react-performance",     tokenBudget: 500 },
  "performance-budget":  { agents: ["react-performance-guru"],                    skill: "react-performance",     tokenBudget: 500 },
  "seo-linter":          { agents: ["seo-specialist"],                            skill: "seo-core-web-vitals",   tokenBudget: 500 },
  "i18n-linter":         { agents: ["frontend-specialist"],                       skill: "i18n-localization",     tokenBudget: 400 },
  "type-coverage":       { agents: ["tech-lead", "qa-engineer"],                  skill: "vitest-unit-tests",     tokenBudget: 500 },
  "verify-all":          { agents: ["orchestrator"]                                                                                },
  "dead-code-detector":  { agents: ["tech-lead"],                                 skill: "solid-principles",      tokenBudget: 450 },
  "e2e-runner":          { agents: ["qa-engineer"],                               skill: "playwright-e2e",        tokenBudget: 450 },
  "lighthouse-ci":       { agents: ["seo-specialist", "react-performance-guru"],  skill: "seo-core-web-vitals",   tokenBudget: 500 },

  // ── JS / TS check labels (validate.ts polyglot native list) ───────────────
  "Security Scan":       { agents: ["security-engineer", "llm-security-officer"], skill: "owasp-top10",           tokenBudget: 450 },
  "TypeScript Check":    { agents: ["tech-lead", "qa-engineer"],                  skill: "solid-principles",      tokenBudget: 450 },
  "Env Validator":       { agents: ["devops-engineer"],                           skill: "github-actions-ci-cd",  tokenBudget: 400 },
  "Dependency Audit":    { agents: ["devops-engineer", "security-engineer"],      skill: "owasp-top10",           tokenBudget: 450 },
  "License Audit":       { agents: ["enterprise-architect"]                                                                        },
  "Accessibility":       { agents: ["accessibility-auditor"],                     skill: "accessibility-wcag",    tokenBudget: 400 },
  "Bundle Analyzer":     { agents: ["react-performance-guru"],                    skill: "react-performance",     tokenBudget: 500 },
  "SEO Linter":          { agents: ["seo-specialist"],                            skill: "seo-core-web-vitals",   tokenBudget: 500 },
  "i18n Linter":         { agents: ["frontend-specialist"],                       skill: "i18n-localization",     tokenBudget: 400 },
  "Type Coverage":       { agents: ["tech-lead", "qa-engineer"],                  skill: "vitest-unit-tests",     tokenBudget: 500 },
  "Full Verify":         { agents: ["orchestrator"]                                                                                },

  // ── Python check labels ────────────────────────────────────────────────────
  "Ruff Lint":           { agents: ["qa-engineer"],                               skill: "python-testing",        tokenBudget: 800 },
  "Ruff Format":         { agents: ["qa-engineer"],                               skill: "python-testing",        tokenBudget: 800 },
  "Bandit Security":     { agents: ["security-engineer"],                         skill: "owasp-top10",           tokenBudget: 450 },
  "Pytest (unit)":       { agents: ["qa-engineer"],                               skill: "python-testing",        tokenBudget: 800 },

  // ── Java check labels ──────────────────────────────────────────────────────
  "Maven Checkstyle":    { agents: ["enterprise-architect"],                      skill: "java-spring-patterns",  tokenBudget: 1050 },
  "Maven Compile":       { agents: ["tech-lead"],                                 skill: "java-spring-patterns",  tokenBudget: 1050 },
  "Maven Test":          { agents: ["qa-engineer"],                               skill: "java-spring-patterns",  tokenBudget: 1050 },

  // ── .NET check labels ──────────────────────────────────────────────────────
  "dotnet format":       { agents: ["tech-lead"],                                 skill: "dotnet-patterns",       tokenBudget: 1100 },
  "dotnet build":        { agents: ["tech-lead"],                                 skill: "dotnet-patterns",       tokenBudget: 1100 },
  "dotnet test":         { agents: ["qa-engineer"],                               skill: "dotnet-patterns",       tokenBudget: 1100 },

  // ── Flutter check labels ───────────────────────────────────────────────────
  "Flutter Analyze":     { agents: ["rn-architect"],                              skill: "flutter-patterns",      tokenBudget: 1000 },
  "Flutter Test":        { agents: ["qa-engineer"],                               skill: "flutter-patterns",      tokenBudget: 1000 },
};

// ── Public helpers ─────────────────────────────────────────────────────────────

/**
 * Print Claude-CLI-style inline agent + skill context before a script runs.
 * Used by `studio run`.
 *
 * Output example:
 *   🤖 @security-engineer + @llm-security-officer
 *   ⎿  Loading skill: owasp-top10 (~450 tokens)
 *   ⎿  Executing: .agent/scripts/security-scan/node.sh
 */
export function printAgentGateContext(scriptName: string, scriptRelPath?: string): void {
  const info = SCRIPT_AGENT_MAP[scriptName];
  if (!info) return;

  const agentLine = info.agents
    .map((a) => chalk.magenta(`@${a}`))
    .join(` ${chalk.dim("+")} `);

  console.log(`  🤖 ${agentLine}`);

  if (info.skill) {
    const tokenHint = info.tokenBudget ? chalk.dim(` (~${info.tokenBudget} tokens)`) : "";
    console.log(`  ${chalk.dim("⎿")}  Loading skill: ${chalk.cyan(info.skill)}${tokenHint}`);
  }

  if (scriptRelPath) {
    console.log(`  ${chalk.dim("⎿")}  Executing: ${chalk.dim(scriptRelPath)}`);
  }

  console.log();
}

/**
 * Print an agent coalition summary grouped by owning agent before validate runs.
 * Used by `studio validate`.
 *
 * Output example:
 *   ◈ Agent Coalition
 *   🤖 @security-engineer + @llm-security-officer  → Security Scan, Dependency Audit
 *   🤖 @qa-engineer                                → TypeScript Check, Type Coverage
 */
export function printValidationCoalition(
  checks: Array<{ label: string }>
): void {
  // Group checks by their coalition key (agents joined)
  const groups = new Map<string, { info: GateAgentInfo; labels: string[] }>();

  for (const check of checks) {
    const info = SCRIPT_AGENT_MAP[check.label];
    if (!info) continue;

    const key = info.agents.join("+");
    if (!groups.has(key)) {
      groups.set(key, { info, labels: [] });
    }
    groups.get(key)!.labels.push(check.label);
  }

  if (groups.size === 0) return;

  // ANSI-aware pad — chalk escape codes inflate .length, so we measure visible chars
  const stripAnsi = (s: string): string => s.replace(/\x1B\[[0-9;]*m/g, "");
  const ansiPad = (s: string, width: number): string =>
    s + " ".repeat(Math.max(0, width - stripAnsi(s).length));

  console.log(chalk.bold.white("  ◈ Agent Coalition\n"));

  for (const { info, labels } of groups.values()) {
    const agentLine = info.agents
      .map((a) => chalk.magenta(`@${a}`))
      .join(` ${chalk.dim("+")} `);
    const checkList = labels.map((l) => chalk.dim(l)).join(chalk.dim(", "));
    console.log(`  🤖 ${ansiPad(agentLine, 52)}${chalk.dim("→")} ${checkList}`);
  }

  console.log();
}

/**
 * Return a short agent hint string for a drifted template entry.
 * Used by `studio sync` to annotate outdated/missing items.
 *
 * Returns e.g.:  ← @security-engineer
 *          or:   ← @tech-lead
 *          or:   "" (empty string) for entries with no mapping
 */
export function getDriftAgentHint(category: string, id: string): string {
  if (category === "agents") {
    // The drifted item IS the agent — just show it
    return chalk.dim(" ← ") + chalk.magenta(`@${id}`);
  }

  if (category === "scripts") {
    const info = SCRIPT_AGENT_MAP[id];
    if (!info) return "";
    const primary = info.agents[0];
    return primary
      ? chalk.dim(" ← ") + chalk.magenta(`@${primary}`)
      : "";
  }

  // skills / workflows — no direct mapping; return empty
  return "";
}
