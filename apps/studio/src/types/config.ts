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
  telemetry: boolean;
}

export type ProjectProfile =
  | "nextjs-fullstack"
  | "nextjs-frontend"
  | "expo-mobile"
  | "react-vite"
  | "node-api"
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
  hasTypeScript: boolean;
  hasTailwind: boolean;
  hasEslint: boolean;
  hasPrisma: boolean;
  hasTestFramework: boolean;
}

export type IdeType = "cursor" | "windsurf" | "vscode" | "unknown";
