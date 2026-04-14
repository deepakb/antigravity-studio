/**
 * `studio search <query> [--type agent|skill|workflow]`
 *
 * Filters the registry by keyword — matches against id, name, and category.
 * Prints colour-coded results grouped by type.
 */

import { loadRegistry } from "../core/template-engine.js";
import { readConfig } from "../core/config-manager.js";
import { logger } from "../ui/logger.js";
import { IC } from "../ui/icons.js";
import chalk from "chalk";
import gradient from "gradient-string";
import boxen from "boxen";

export interface SearchOptions {
  type?: string;   // "agent" | "skill" | "workflow" | undefined (all)
}

interface SearchHit {
  type: "agent" | "skill" | "workflow";
  id: string;
  name: string;
  category?: string;
  tokenBudget?: number;
  installed: boolean;
  contributed?: boolean;
}

export async function searchCommand(
  query: string,
  cwd: string,
  opts: SearchOptions = {}
): Promise<void> {
  if (!query || query.trim().length === 0) {
    logger.error('Provide a search query. Usage: studio search <keyword> [--type agent|skill|workflow]');
    process.exit(1);
  }

  const registry = loadRegistry();
  const config = readConfig(cwd);
  const q = query.trim().toLowerCase();
  const filterType = opts.type?.toLowerCase();

  const installedAgents   = new Set(config?.installed.agents    ?? []);
  const installedSkills   = new Set(config?.installed.skills    ?? []);
  const installedWorkflows = new Set(config?.installed.workflows ?? []);

  const hits: SearchHit[] = [];

  // ── Search agents ────────────────────────────────────────────────────────
  if (!filterType || filterType === "agent") {
    for (const agent of registry.agents as any[]) {
      const score = _score(q, [agent.id, agent.name, agent.category]);
      if (score > 0) {
        hits.push({
          type: "agent",
          id: agent.id,
          name: agent.name,
          category: agent.category,
          installed: installedAgents.has(agent.id),
          contributed: agent.contributed ?? false,
        });
      }
    }
  }

  // ── Search skills ────────────────────────────────────────────────────────
  if (!filterType || filterType === "skill") {
    for (const skill of registry.skills as any[]) {
      const score = _score(q, [skill.id, skill.name, skill.category]);
      if (score > 0) {
        hits.push({
          type: "skill",
          id: skill.id,
          name: skill.name,
          category: skill.category,
          tokenBudget: skill.tokenBudget,
          installed: installedSkills.has(skill.id),
          contributed: skill.contributed ?? false,
        });
      }
    }
  }

  // ── Search workflows ─────────────────────────────────────────────────────
  // Workflows aren't listed in registry.json with full metadata yet;
  // use installed list from config for now.
  if ((!filterType || filterType === "workflow") && config) {
    for (const wf of config.installed.workflows) {
      if (wf.toLowerCase().includes(q)) {
        hits.push({ type: "workflow", id: wf, name: wf, installed: true });
      }
    }
  }

  // ── Output ───────────────────────────────────────────────────────────────
  const gold      = gradient(["#FDBB2D", "#22C1C3"]);
  const cyanPink  = gradient(["#00DBDE", "#FC00FF"]);

  logger.blank();
  process.stdout.write(
    cyanPink.multiline(
      `  Nexus Search — "${query}"\n` +
      `  ${"─".repeat(40)}\n`
    )
  );

  if (hits.length === 0) {
    console.log(
      boxen(
        `${chalk.yellow("No results")} for ${chalk.cyan(`"${query}"`)}\n\n` +
        `  Try a broader term, or omit ${chalk.dim("--type")} to search all categories.\n` +
        `  Run ${chalk.cyan("studio list")} to browse the full registry.`,
        { padding: 1, margin: { top: 1, bottom: 1 }, borderStyle: "round", borderColor: "dim" }
      )
    );
    return;
  }

  // Group by type
  const byType: Record<string, SearchHit[]> = {};
  for (const hit of hits) {
    if (!byType[hit.type]) byType[hit.type] = [];
    byType[hit.type]!.push(hit);
  }

  for (const [type, group] of Object.entries(byType).sort()) {
    const label = type === "agent" ? "AI Agents" : type === "skill" ? "Skills" : "Workflows";
    console.log(gold(`\n  ◈ ${label} (${group.length})`));
    for (const hit of group) {
      const installedBadge = hit.installed ? ` ${IC.pass} ${chalk.green("installed")}` : "";
      const communityBadge = hit.contributed ? ` ${IC.community} ${chalk.magenta("community")}` : "";
      const tokenHint = hit.tokenBudget ? chalk.dim(` ~${hit.tokenBudget}t`) : "";
      const categoryHint = hit.category ? chalk.dim(` [${hit.category}]`) : "";
      const idHighlighted = _highlight(hit.id, q);
      const nameHighlighted = _highlight(hit.name, q);
      console.log(
        `    ${idHighlighted.padEnd(38)} ${nameHighlighted}${tokenHint}${categoryHint}${communityBadge}${installedBadge}`
      );
    }
  }

  logger.blank();
  logger.box(
    `${chalk.bold.white(`${hits.length} result(s) for "${query}"`)}\n\n` +
    `  ${chalk.dim("• Install:")}  ${chalk.cyan("studio add agent <id>")} / ${chalk.cyan("studio add skill <id>")}\n` +
    `  ${chalk.dim("• Details:")} ${chalk.cyan("studio info agent <id>")} / ${chalk.cyan("studio info skill <id>")}`,
    { borderColor: "cyan", padding: 1, margin: { top: 1, bottom: 1 } }
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns a relevance score > 0 if any field contains the query. */
function _score(query: string, fields: (string | undefined)[]): number {
  let score = 0;
  for (const field of fields) {
    if (!field) continue;
    const f = field.toLowerCase();
    if (f === query) score += 10;         // exact match
    else if (f.startsWith(query)) score += 5;  // prefix match
    else if (f.includes(query)) score += 1;    // substring match
  }
  return score;
}

/** Wraps query occurrences in cyan highlight. */
function _highlight(text: string, query: string): string {
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return chalk.cyan(text);
  return (
    chalk.cyan(text.slice(0, idx)) +
    chalk.bold.white(text.slice(idx, idx + query.length)) +
    chalk.cyan(text.slice(idx + query.length))
  );
}
