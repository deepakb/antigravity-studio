/**
 * Enterprise Config Layer
 *
 * Reads and resolves .agstudio.company.json — the central standards file that
 * enterprise teams publish to enforce consistent AI agent behaviour across all
 * developer workstations.
 *
 * Resolution order (highest → lowest priority):
 *   1. Project .agstudio.json "extends" field   → points to local path or npm pkg
 *   2. CWD   .agstudio.company.json             → per-repo override
 *   3. HOME  .agstudio.company.json             → machine-level default (set by IT)
 *   4. Built-in defaults                        → empty policy (no restrictions)
 */

import fs from "fs-extra";
import path from "path";
import { logger } from "../ui/logger.js";
import type { CompanyConfig } from "../types/config.js";

const COMPANY_CONFIG_FILE = ".agstudio.company.json";

// ── Default policy (no restrictions) ─────────────────────────────────────────
const DEFAULT_COMPANY_CONFIG: Omit<CompanyConfig, 'codingStandardsUrl' | 'registryUrl' | 'profileDefaults'> = {
  companyName: "",
  version: "1.0.0",
  requiredSkills: [],
  forbiddenSkills: [],
  defaultIdes: [],
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Load the company config, following this resolution order (highest → lowest priority):
 *   1. `extends` field in the project's .agstudio.json  → local file path OR npm package
 *   2. CWD   .agstudio.company.json                     → per-repo override
 *   3. HOME  .agstudio.company.json                     → machine-level default (set by IT)
 *   4. null                                             → open-source / personal use
 */
export function loadCompanyConfig(cwd: string = process.cwd()): CompanyConfig | null {
  // 1. Honour the 'extends' field from .agstudio.json
  const agStudioConfigPath = path.join(cwd, ".agstudio.json");
  if (fs.existsSync(agStudioConfigPath)) {
    try {
      const agConfig = JSON.parse(fs.readFileSync(agStudioConfigPath, "utf-8")) as {
        extends?: string;
      };
      if (agConfig.extends) {
        const resolved = _resolveExtends(agConfig.extends, cwd);
        if (resolved) return resolved;
        logger.warn(
          `[enterprise-config] Could not resolve 'extends': "${agConfig.extends}". ` +
          `Falling back to local ${COMPANY_CONFIG_FILE}.`
        );
      }
    } catch {
      // Malformed .agstudio.json — continue with other resolution steps
    }
  }

  // 2. Check project directory
  const projectPath = path.join(cwd, COMPANY_CONFIG_FILE);
  if (fs.existsSync(projectPath)) {
    return _parse(projectPath);
  }

  // 3. Check home directory (IT-provisioned machine default)
  const home = process.env["USERPROFILE"] ?? process.env["HOME"] ?? "";
  if (home) {
    const homePath = path.join(home, COMPANY_CONFIG_FILE);
    if (fs.existsSync(homePath)) {
      return _parse(homePath);
    }
  }

  return null;
}

/**
 * Resolve the value of the 'extends' field to a CompanyConfig.
 *   - If it starts with "." or "/" it is treated as a relative/absolute file path.
 *   - Otherwise it is treated as an npm package name; the package must export
 *     a JSON object matching CompanyConfig at its package root.
 */
function _resolveExtends(ref: string, cwd: string): CompanyConfig | null {
  // Local file path
  if (ref.startsWith(".") || ref.startsWith("/") || ref.match(/^[A-Za-z]:\\/)) {
    const resolved = path.isAbsolute(ref) ? ref : path.join(cwd, ref);
    return _parse(resolved);
  }

  // npm package — try to resolve via require resolution from cwd
  try {
    // require.resolve searches node_modules relative to cwd
    const pkgMain = require.resolve(ref, { paths: [cwd] });
    return _parse(pkgMain);
  } catch {
    // Package not installed — try a manual node_modules lookup
    const manualPath = path.join(cwd, "node_modules", ref, "package.json");
    if (fs.existsSync(manualPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(manualPath, "utf-8")) as { main?: string };
        const mainFile = pkg.main ?? "index.json";
        const configPath = path.join(cwd, "node_modules", ref, mainFile);
        return _parse(configPath);
      } catch { /* fall through */ }
    }
  }

  return null;
}

/**
 * Merge user-selected skills with company policy:
 * - Injects requiredSkills that are not already selected
 * - Removes forbiddenSkills from the selection
 * - Returns the final merged list + a report of what changed
 */
export function applyCompanySkillPolicy(
  selectedSkills: string[],
  companyConfig: CompanyConfig
): { skills: string[]; injected: string[]; removed: string[] } {
  const injected: string[] = [];
  const removed: string[] = [];

  // Remove forbidden skills
  const filtered = selectedSkills.filter((s) => {
    if (companyConfig.forbiddenSkills.includes(s)) {
      removed.push(s);
      return false;
    }
    return true;
  });

  // Inject required skills that are missing
  for (const req of companyConfig.requiredSkills) {
    if (!filtered.includes(req)) {
      filtered.push(req);
      injected.push(req);
    }
  }

  return { skills: filtered, injected, removed };
}

/**
 * Validate a company config object — returns a list of issues found.
 * Used by the `doctor` command.
 */
export function validateCompanyConfig(config: CompanyConfig): string[] {
  const issues: string[] = [];

  if (!config.companyName) {
    issues.push("companyName is required");
  }
  if (!config.version || !/^\d+\.\d+\.\d+$/.test(config.version)) {
    issues.push("version must be a valid semver string (e.g. \"1.0.0\")");
  }
  if (!Array.isArray(config.requiredSkills)) {
    issues.push("requiredSkills must be an array");
  }
  if (!Array.isArray(config.forbiddenSkills)) {
    issues.push("forbiddenSkills must be an array");
  }

  // Detect conflicts: a skill cannot be both required and forbidden
  const conflicts = config.requiredSkills.filter((s) =>
    config.forbiddenSkills.includes(s)
  );
  if (conflicts.length > 0) {
    issues.push(`Skills appear in both requiredSkills and forbiddenSkills: ${conflicts.join(", ")}`);
  }

  return issues;
}

/**
 * Write a starter .agstudio.company.json to cwd.
 * Called by `studio init --enterprise` or a future `studio company init`.
 */
export async function scaffoldCompanyConfig(
  cwd: string,
  companyName: string
): Promise<void> {
  const configPath = path.join(cwd, COMPANY_CONFIG_FILE);

  if (fs.existsSync(configPath)) {
    logger.warn(`${COMPANY_CONFIG_FILE} already exists — skipping scaffold.`);
    return;
  }

  const starter: CompanyConfig = {
    companyName,
    version: "1.0.0",
    requiredSkills: [
      "clean-architecture",
      "solid-principles",
      "owasp-top10",
      "github-actions-ci-cd",
    ],
    forbiddenSkills: [],
    defaultIdes: ["copilot"],
    codingStandardsUrl: "https://your-intranet/coding-standards",
  };

  await fs.writeJson(configPath, starter, { spaces: 2 });
  logger.success(`Created ${COMPANY_CONFIG_FILE}`);
  logger.info(
    `Edit this file to define your company's required skills, forbidden patterns, and default IDE configs.\n` +
    `Commit it to your internal npm package or shared repo so all developers inherit these standards.`
  );
}

// ── Private ───────────────────────────────────────────────────────────────────

function _parse(filePath: string): CompanyConfig | null {
  try {
    const raw = fs.readJsonSync(filePath) as Partial<CompanyConfig>;
    return {
      ...DEFAULT_COMPANY_CONFIG,
      ...raw,
      requiredSkills: raw.requiredSkills ?? [],
      forbiddenSkills: raw.forbiddenSkills ?? [],
      defaultIdes: raw.defaultIdes ?? [],
    };
  } catch (err: any) {
    logger.warn(`Failed to parse ${filePath}: ${err?.message ?? err}`);
    return null;
  }
}
