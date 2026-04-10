/**
 * Typed schema for registry.json — the single source of truth for all
 * available agents, skills, profiles, and slash commands.
 *
 * This replaces the `any` return type on `loadRegistry()` so the entire
 * registry consumer chain benefits from compile-time type safety.
 */

import type { ProjectProfile } from "./config.js";

export interface RegistryAgent {
  id: string;
  name: string;
  category: string;
  /** True for templates contributed by the community rather than bundled by default */
  contributed?: boolean;
}

export interface RegistrySkill {
  id: string;
  name: string;
  category: string;
  /** Approximate token budget when injected into IDE context */
  tokenBudget?: number;
  /** True for templates contributed by the community rather than bundled by default */
  contributed?: boolean;
}

export interface RegistryProfile {
  label: string;
  hint?: string;
  agents: string[];
  skills?: string[];
  /** Shell runner names to install (e.g. ["node"] or ["python"]) */
  scriptRunners?: string[];
  /** Specific quality-gate folders to install (null = all) */
  scriptGates?: string[] | null;
}

export interface RegistrySchema {
  agents: RegistryAgent[];
  skills: RegistrySkill[];
  profiles: Partial<Record<ProjectProfile | "custom", RegistryProfile>>;
  slashCommands: string[];
}
