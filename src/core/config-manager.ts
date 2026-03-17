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
  telemetry: false,
};

export function readConfig(cwd: string = process.cwd()): AgStudioConfig | null {
  const configPath = path.join(cwd, CONFIG_FILE);
  if (!existsSync(configPath)) return null;
  try {
    return JSON.parse(readFileSync(configPath, "utf-8")) as AgStudioConfig;
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
  telemetry: boolean = false
): AgStudioConfig {
  return {
    ...DEFAULT_CONFIG,
    version: "1.0.0",
    profile,
    project,
    installed,
    telemetry,
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
