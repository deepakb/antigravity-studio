/**
 * MCP Composer — core module for generating IDE-specific MCP configuration files.
 *
 * Architecture:
 *   .agent/mcp/servers/{id}.json     — individual server definitions with credential metadata
 *   .agent/mcp/profiles/{name}.json  — which servers each project profile needs
 *   .agent/mcp/environments/*.json   — local/CI overrides (e.g. headless flag)
 *   .agent/mcp/ide/{ide}.json        — IDE format adapters (output key, type field, dest)
 *
 * Credential Tiers:
 *   TIER 1 — "none"     : Zero-config. Always active.  (playwright, filesystem, fetch)
 *   TIER 2 — "optional" : Active only if env var present. (github)
 *   TIER 3 — "required" : Fully disabled without credentials. (chromatic, vercel)
 *
 * Usage:
 *   const result = composeMcp(cwd, "cursor", "react-vite", destPath, "label", force);
 *   // result.credentialSummary used for post-init display
 *   // result.envExample used to write .env.example
 */

import fs from "fs-extra";
import path from "path";
import { logger } from "../ui/logger.js";
import { TEMPLATES_DIR } from "./template-engine.js";

// ─── Types ─────────────────────────────────────────────────────────────────

type CredentialTier = "none" | "optional" | "required";

interface CredentialMeta {
  description: string;
  howToGet: string;
  required: boolean;
  placeholder: string;
}

interface ServerDefinition {
  id: string;
  label: string;
  description: string;
  credentialTier: CredentialTier;
  command: string;
  args: string[];
  env: Record<string, string>;
  credentials?: Record<string, CredentialMeta>;
  capabilities:
    | string[]
    | { withCredentials: string[]; withoutCredentials: string[] };
  profiles: string[];
  notes?: string;
}

interface ProfileDefinition {
  id: string;
  description: string;
  inherits?: string;
  servers: string[];
  optional: string[];
  notes?: string;
}

interface EnvironmentDefinition {
  id: string;
  description: string;
  overrides: Record<string, { args?: string[]; notes?: string }>;
}

interface IdeAdapter {
  id: string;
  outputKey: string;
  requiresType: boolean;
  typeValue?: string;
  destination: string;
  envStyle: string;
  notes?: string;
}

export interface McpCredentialSummary {
  tier1Ready: Array<{ id: string; label: string }>;
  tier2Optional: Array<{
    id: string;
    label: string;
    envVars: string[];
    howToGet: string[];
  }>;
  tier3Disabled: Array<{
    id: string;
    label: string;
    envVars: string[];
    howToGet: string[];
  }>;
  envExampleLines: string[];
}

// ─── Internal Loaders ──────────────────────────────────────────────────────

const MCP_DIR = path.join(TEMPLATES_DIR, ".agent", "mcp");

function loadServer(id: string): ServerDefinition | null {
  const serverPath = path.join(MCP_DIR, "servers", `${id}.json`);
  if (!fs.existsSync(serverPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(serverPath, "utf8")) as ServerDefinition;
  } catch {
    return null;
  }
}

function loadProfile(profileId: string): ProfileDefinition | null {
  const profilePath = path.join(MCP_DIR, "profiles", `${profileId}.json`);
  if (!fs.existsSync(profilePath)) return null;
  try {
    return JSON.parse(
      fs.readFileSync(profilePath, "utf8")
    ) as ProfileDefinition;
  } catch {
    return null;
  }
}

function loadEnvironment(envId: string): EnvironmentDefinition | null {
  const envPath = path.join(MCP_DIR, "environments", `${envId}.json`);
  if (!fs.existsSync(envPath)) return null;
  try {
    return JSON.parse(
      fs.readFileSync(envPath, "utf8")
    ) as EnvironmentDefinition;
  } catch {
    return null;
  }
}

function loadIdeAdapter(ide: string): IdeAdapter | null {
  const adapterPath = path.join(MCP_DIR, "ide", `${ide}.json`);
  if (!fs.existsSync(adapterPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(adapterPath, "utf8")) as IdeAdapter;
  } catch {
    return null;
  }
}

// ─── Profile Resolution ────────────────────────────────────────────────────

/**
 * Resolve the full list of server IDs for a profile, including inherited ones.
 * Falls back to "base" profile servers if the profile isn't found.
 */
function resolveProfileServers(profileId: string): {
  required: string[];
  optional: string[];
} {
  const profile = loadProfile(profileId);
  if (!profile) {
    const base = loadProfile("base");
    return {
      required: base?.servers ?? ["filesystem"],
      optional: base?.optional ?? [],
    };
  }

  let required = [...profile.servers];
  let optional = [...profile.optional];

  // Inherit from parent profile if declared
  if (profile.inherits) {
    const parent = loadProfile(profile.inherits);
    if (parent) {
      // Add parent servers that aren't already in child list
      for (const s of parent.servers) {
        if (!required.includes(s)) required = [s, ...required];
      }
      for (const o of parent.optional) {
        if (!optional.includes(o)) optional = [o, ...optional];
      }
    }
  }

  return { required, optional };
}

// ─── Server Entry Builder ──────────────────────────────────────────────────

/**
 * Build a single MCP server entry in IDE-specific format.
 * Returns null if the server definition is missing.
 */
function buildServerEntry(
  server: ServerDefinition,
  adapter: IdeAdapter,
  envOverride?: { args?: string[] }
): Record<string, unknown> {
  const args = envOverride?.args ?? server.args;

  const entry: Record<string, unknown> = {
    command: server.command,
    args,
  };

  if (adapter.requiresType && adapter.typeValue) {
    entry.type = adapter.typeValue;
  }

  if (Object.keys(server.env).length > 0) {
    entry.env = { ...server.env };
  }

  return entry;
}

// ─── Credential Summary Builder ────────────────────────────────────────────

function buildCredentialSummary(
  allServers: ServerDefinition[]
): McpCredentialSummary {
  const summary: McpCredentialSummary = {
    tier1Ready: [],
    tier2Optional: [],
    tier3Disabled: [],
    envExampleLines: [
      "# ============================================================",
      "# MCP Server Credentials — Generated by Antigravity Studio",
      "# Copy to .env.local and fill in your values.",
      "# NEVER commit .env.local to version control.",
      "# ============================================================",
      "",
    ],
  };

  for (const server of allServers) {
    const envVars = Object.keys(server.credentials ?? {});
    const howToGet = envVars.map(
      (v) => server.credentials?.[v]?.howToGet ?? ""
    );

    switch (server.credentialTier) {
      case "none":
        summary.tier1Ready.push({ id: server.id, label: server.label });
        break;

      case "optional":
        summary.tier2Optional.push({
          id: server.id,
          label: server.label,
          envVars,
          howToGet,
        });
        summary.envExampleLines.push(`# ${server.label} (TIER 2 — Optional)`);
        for (const [varName, meta] of Object.entries(
          server.credentials ?? {}
        )) {
          summary.envExampleLines.push(`# ${meta.description}`);
          summary.envExampleLines.push(`# Get it at: ${meta.howToGet}`);
          summary.envExampleLines.push(`${varName}=${meta.placeholder}`);
          summary.envExampleLines.push("");
        }
        break;

      case "required":
        summary.tier3Disabled.push({
          id: server.id,
          label: server.label,
          envVars,
          howToGet,
        });
        summary.envExampleLines.push(`# ${server.label} (TIER 3 — Required)`);
        for (const [varName, meta] of Object.entries(
          server.credentials ?? {}
        )) {
          summary.envExampleLines.push(`# ${meta.description}`);
          summary.envExampleLines.push(`# Get it at: ${meta.howToGet}`);
          summary.envExampleLines.push(`${varName}=${meta.placeholder}`);
          summary.envExampleLines.push("");
        }
        break;
    }
  }

  return summary;
}

// ─── Public API ────────────────────────────────────────────────────────────

export interface ComposeMcpResult {
  written: boolean;
  skipped: boolean;
  credentialSummary: McpCredentialSummary;
}

/**
 * Compose and write an IDE-specific MCP config file.
 *
 * Reads the profile's server list, loads each server definition,
 * applies environment overrides, transforms to IDE format, writes to disk.
 *
 * @param cwd        - Project root directory
 * @param ide        - Target IDE: "vscode" | "cursor" | "claude" | "windsurf"
 * @param profile    - Project profile: "react-vite" | "nextjs" | "node-api" | etc.
 * @param destPath   - Absolute path to write the MCP config file
 * @param label      - Human-readable label for log output
 * @param force      - Overwrite existing file if true
 * @param envId      - Environment override: "local" | "ci" (default: "local")
 */
export function composeMcp(
  cwd: string,
  ide: string,
  profile: string,
  destPath: string,
  label: string,
  force: boolean,
  envId = "local"
): ComposeMcpResult {
  // Load IDE adapter
  const adapter = loadIdeAdapter(ide);
  if (!adapter) {
    logger.warn(`No MCP adapter found for IDE '${ide}' — skipping ${label}`);
    return {
      written: false,
      skipped: true,
      credentialSummary: {
        tier1Ready: [],
        tier2Optional: [],
        tier3Disabled: [],
        envExampleLines: [],
      },
    };
  }

  // Skip if already exists (unless force)
  if (!force && fs.existsSync(destPath)) {
    logger.dim(`Skipped ${label} (already exists)`);
    return {
      written: false,
      skipped: true,
      credentialSummary: {
        tier1Ready: [],
        tier2Optional: [],
        tier3Disabled: [],
        envExampleLines: [],
      },
    };
  }

  // Resolve server IDs for this profile
  const { required, optional } = resolveProfileServers(profile);
  const allServerIds = [...new Set([...required, ...optional])];

  // Load environment overrides
  const env = loadEnvironment(envId);

  // Load all server definitions
  const allServers: ServerDefinition[] = [];
  for (const id of allServerIds) {
    const server = loadServer(id);
    if (server) allServers.push(server);
    else logger.dim(`MCP server definition not found: ${id} — skipping`);
  }

  // Build the IDE-specific output object
  const serverEntries: Record<string, unknown> = {};

  for (const server of allServers) {
    const override = env?.overrides[server.id];
    const entry = buildServerEntry(server, adapter, override);

    // Use the server ID as the key in the output
    serverEntries[server.id] = entry;
  }

  const output = { [adapter.outputKey]: serverEntries };

  // Write the file
  try {
    fs.ensureDirSync(path.dirname(destPath));
    fs.writeFileSync(destPath, JSON.stringify(output, null, 2) + "\n", "utf8");
    logger.success(`Mapped MCP → ${label}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(`Failed to write MCP config ${label}: ${msg}`);
    return {
      written: false,
      skipped: false,
      credentialSummary: {
        tier1Ready: [],
        tier2Optional: [],
        tier3Disabled: [],
        envExampleLines: [],
      },
    };
  }

  // Build credential summary for post-init display
  const credentialSummary = buildCredentialSummary(allServers);

  return { written: true, skipped: false, credentialSummary };
}

/**
 * Get the MCP credential summary for a profile without writing any files.
 * Use this in init.ts post-init summary display.
 */
export function getMcpCredentialSummary(
  profile: string
): McpCredentialSummary {
  const { required, optional } = resolveProfileServers(profile);
  const allServerIds = [...new Set([...required, ...optional])];

  const allServers: ServerDefinition[] = [];
  for (const id of allServerIds) {
    const server = loadServer(id);
    if (server) allServers.push(server);
  }

  return buildCredentialSummary(allServers);
}

/**
 * Generate a .env.example file with MCP credential placeholders.
 * Call after composeMcp() to capture the summary.
 */
export function writeMcpEnvExample(
  cwd: string,
  summary: McpCredentialSummary,
  force: boolean
): void {
  const destPath = path.join(cwd, ".env.example");
  const hasSecrets =
    summary.tier2Optional.length > 0 || summary.tier3Disabled.length > 0;

  if (!hasSecrets) return; // Nothing to write if no credentials needed

  if (!force && fs.existsSync(destPath)) {
    // Append MCP section to existing file instead of overwriting
    const existing = fs.readFileSync(destPath, "utf8");
    if (!existing.includes("MCP Server Credentials")) {
      const appendContent = [
        "",
        ...summary.envExampleLines,
      ].join("\n");
      fs.appendFileSync(destPath, appendContent, "utf8");
      logger.success("Appended MCP credentials to .env.example");
    } else {
      logger.dim("Skipped .env.example MCP section (already exists)");
    }
    return;
  }

  fs.ensureDirSync(path.dirname(destPath));
  fs.writeFileSync(
    destPath,
    summary.envExampleLines.join("\n") + "\n",
    "utf8"
  );
  logger.success("Created .env.example with MCP credential placeholders");
}
