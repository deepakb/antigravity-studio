/**
 * Registry data layer — build-time static import from packages/templates/registry.json
 *
 * This module is the single place the web app reads registry data.
 * ALL data is resolved at build time by Vite — zero runtime fetch, zero latency.
 *
 * The source of truth is:  packages/templates/registry.json
 * Studio reads this directly at runtime — no sync step needed in monorepo.
 *
 * 🤖 @frontend-specialist + @ui-component-architect
 *    Loading: react-patterns, clean-architecture skills...
 */

// Vite resolves this JSON import at build time
// Path is relative from src/data/ → ../../.. → monorepo root → packages/templates
import rawRegistry from "../../../../packages/templates/registry.json";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Agent {
  id: string;
  name: string;
  category: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  tokenBudget?: number;
}

export interface Profile {
  id: string;
  label: string;
  hint?: string;
  scriptRunners: string[];
  scriptGates: string[];
  agents: string[];
  skills: string[];
}

export interface Registry {
  agents: Agent[];
  skills: Skill[];
  profiles: Record<string, Omit<Profile, "id">>;
  slashCommands: string[];
}

// ── Typed registry ─────────────────────────────────────────────────────────

const registry = rawRegistry as Registry;

// ── Derived / normalised accessors ────────────────────────────────────────

/** All agents, sorted by category then name */
export function getAgents(): Agent[] {
  return [...registry.agents].sort(
    (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
  );
}

/** Agents grouped by category */
export function getAgentsByCategory(): Map<string, Agent[]> {
  const map = new Map<string, Agent[]>();
  for (const agent of getAgents()) {
    const group = map.get(agent.category) ?? [];
    group.push(agent);
    map.set(agent.category, group);
  }
  return map;
}

/** All skills, sorted by category then name */
export function getSkills(): Skill[] {
  return [...registry.skills].sort(
    (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
  );
}

/** Skills grouped by category */
export function getSkillsByCategory(): Map<string, Skill[]> {
  const map = new Map<string, Skill[]>();
  for (const skill of getSkills()) {
    const group = map.get(skill.category) ?? [];
    group.push(skill);
    map.set(skill.category, group);
  }
  return map;
}

/** All profiles as a flat array with id injected */
export function getProfiles(): Profile[] {
  return Object.entries(registry.profiles).map(([id, data]) => ({
    id,
    ...data,
  }));
}

/** Single profile by id */
export function getProfile(id: string): Profile | undefined {
  const data = registry.profiles[id];
  if (!data) return undefined;
  return { id, ...data };
}

/** All slash commands */
export function getSlashCommands(): string[] {
  return registry.slashCommands;
}

/** Registry stats — used on home page and docs landing */
export function getRegistryStats() {
  const profiles = getProfiles();
  const gates = new Set(profiles.flatMap((p) => p.scriptGates));
  return {
    agentCount: registry.agents.length,
    skillCount: registry.skills.length,
    profileCount: profiles.length,
    gateCount: gates.size,
    slashCommandCount: registry.slashCommands.length,
  };
}
