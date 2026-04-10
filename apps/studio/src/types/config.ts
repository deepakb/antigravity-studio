// Types for .agstudio.json config file
export interface AgStudioConfig {
  version: string;
  profile: ProjectProfile;
  project: string;
  installed: {
    agents: string[];
    skills: string[];
    workflows: string[];
    scripts: string[];
  };
  customized: string[];
  /**
   * SHA-256 hashes (12-char prefix) of the RAW (pre-compilation) template files
   * recorded at install/update time. Keyed by relative path, e.g. "agents/security-analyst.md".
   * Used by `studio sync` and `studio update` to detect upstream template drift
   * without false-positives caused by Handlebars compilation.
   */
  installedHashes?: Record<string, string>;
  /**
   * Snapshot recorded by `studio update` before overwriting files.
   * Used by `studio rollback` to restore the previous state.
   * backupDir is relative to cwd (e.g. ".agstudio-backup/2026-03-22T10-00-00Z").
   */
  rollbackSnapshot?: { timestamp: string; backupDir: string };
  /**
   * Path or npm package name of the company config to extend
   * (e.g. "@acme/agstudio-config" or "./company-standards.json").
   * Resolved at runtime by loadCompanyConfig().
   */
  extends?: string;
  /** Snapshot of company-enforced settings resolved at init time */
  companyConfig?: CompanyConfig;
}

/** Schema for .agstudio.company.json — the enterprise standards layer */
export interface CompanyConfig {
  companyName: string;
  version: string;
  /** Skills that MUST be installed in every project */
  requiredSkills: string[];
  /** Skills that are explicitly forbidden (e.g. conflicting or insecure patterns) */
  forbiddenSkills: string[];
  /** Default IDEs to configure for every project */
  defaultIdes: IdeType[];
  /** URL to internal coding standards documentation */
  codingStandardsUrl?: string;
  /** Custom registry URL to fetch company-internal skills from */
  registryUrl?: string;
  /** Profile overrides for this company */
  profileDefaults?: Partial<Record<ProjectProfile, string[]>>;
}

export type ProjectProfile =
  // JavaScript / TypeScript
  | "nextjs-fullstack"
  | "nextjs-frontend"
  | "expo-mobile"
  | "react-vite"
  | "node-api"
  // Enterprise Web Frameworks
  | "angular-enterprise"
  | "vue-nuxt"
  | "vue-vite"
  // Backend — Polyglot
  | "python-fastapi"
  | "python-django"
  | "java-spring"
  | "dotnet-api"
  // Mobile
  | "flutter-mobile"
  // Workspace
  | "monorepo-root"
  | "monorepo-package"
  | "custom";

export interface ProjectInfo {
  profile: ProjectProfile;
  name: string;
  hasGit: boolean;
  isMonorepo: boolean;
  ide: IdeType;
  framework: FrameworkInfo;
}

export interface FrameworkInfo {
  name: string;
  version?: string;
  /** Primary language of the project */
  language: "typescript" | "javascript" | "python" | "java" | "csharp" | "dart" | "unknown";
  hasTypeScript: boolean;
  hasTailwind: boolean;
  hasEslint: boolean;
  hasPrisma: boolean;
  hasTestFramework: boolean;
  techStack?: string[];
}

export type IdeType = "cursor" | "windsurf" | "vscode" | "copilot" | "claude-code" | "antigravity" | "unknown";
