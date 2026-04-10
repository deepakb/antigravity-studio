import { existsSync, readFileSync } from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import type { AgStudioConfig, ProjectProfile } from "../types/config.js";

const CONFIG_FILE = ".agstudio.json";

const DEFAULT_CONFIG: AgStudioConfig = {
  version: "1.0.0",
  profile: "custom",
  project: "",
  installed: {
    agents: [],
    skills: [],
    workflows: [],
    scripts: [],
  },
  customized: [],
  installedHashes: {},
};

/**
 * Migrate an older .agstudio.json to the current schema.
 * Safe to call on any config object — only modifies stale / missing fields.
 */
export function migrateConfig(config: Record<string, unknown>): AgStudioConfig {
  const raw = { ...config };

  // v1 → v2: remove dead telemetry field
  if ('telemetry' in raw) {
    delete raw['telemetry'];
  }

  const c = { ...DEFAULT_CONFIG, ...raw } as AgStudioConfig;

  // Ensure installed sub-keys exist (resilient against partial writes)
  c.installed = {
    agents:    Array.isArray(c.installed?.agents)    ? c.installed.agents    : [],
    skills:    Array.isArray(c.installed?.skills)    ? c.installed.skills    : [],
    workflows: Array.isArray(c.installed?.workflows) ? c.installed.workflows : [],
    scripts:   Array.isArray(c.installed?.scripts)   ? c.installed.scripts   : [],
  };

  // Ensure customized is an array
  if (!Array.isArray(c.customized)) c.customized = [];

  // Ensure installedHashes is an object
  if (typeof c.installedHashes !== 'object' || c.installedHashes === null) {
    c.installedHashes = {};
  }

  return c;
}

export function readConfig(cwd: string = process.cwd()): AgStudioConfig | null {
  const configPath = path.join(cwd, CONFIG_FILE);
  if (!existsSync(configPath)) return null;
  try {
    const raw = JSON.parse(readFileSync(configPath, "utf-8")) as Record<string, unknown>;
    return migrateConfig(raw);
  } catch {
    return null;
  }
}

export async function writeConfig(
  config: AgStudioConfig,
  cwd: string = process.cwd()
): Promise<void> {
  const configPath = path.join(cwd, CONFIG_FILE);
  await writeFile(configPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
}

export function createConfig(
  project: string,
  profile: ProjectProfile,
  installed: AgStudioConfig["installed"],
  hashes: Record<string, string> = {}
): AgStudioConfig {
  return {
    ...DEFAULT_CONFIG,
    version: "1.0.0",
    profile,
    project,
    installed,
    installedHashes: hashes,
  };
}

export function markFileAsCustomized(
  config: AgStudioConfig,
  filePath: string
): AgStudioConfig {
  if (!config.customized.includes(filePath)) {
    return { ...config, customized: [...config.customized, filePath] };
  }
  return config;
}
