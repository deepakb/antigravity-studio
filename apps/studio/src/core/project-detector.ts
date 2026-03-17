import { existsSync, readFileSync } from "fs";
import { writeFile, readdir } from "fs/promises";
import path from "path";
import type { ProjectInfo, ProjectProfile, IdeType, FrameworkInfo } from "../types/config.js";

/**
 * Detects the project type based on config files present in the directory.
 */
export async function detectProject(cwd: string = process.cwd()): Promise<ProjectInfo> {
  const packageJsonPath = path.join(cwd, "package.json");
  const agConfigPath = path.join(cwd, ".agstudio.json");
  let deps: Record<string, string> = {};
  let projectName = path.basename(cwd);
  let profile: ProjectProfile = "custom";

  // Priority 1: Check existing Antigravity config
  if (existsSync(agConfigPath)) {
    try {
      const config = JSON.parse(readFileSync(agConfigPath, "utf-8"));
      if (config.profile) profile = config.profile;
      if (config.project) projectName = config.project;
    } catch (e) {
      // Ignore parse errors
    }
  }

  // Priority 2: Check package.json
  if (existsSync(packageJsonPath)) {
    const pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as Record<string, unknown>;
    if (typeof pkg["name"] === "string") projectName = pkg["name"];
    deps = {
      ...(pkg["dependencies"] as Record<string, string> ?? {}),
      ...(pkg["devDependencies"] as Record<string, string> ?? {}),
    };
  }

  const has = (name: string) => name in deps;
  const hasFile = (f: string) => existsSync(path.join(cwd, f));


  const framework: FrameworkInfo = {
    name: "unknown",
    hasTypeScript: has("typescript") || hasFile("tsconfig.json"),
    hasTailwind: has("tailwindcss"),
    hasEslint: has("eslint") || hasFile(".eslintrc.js") || hasFile("eslint.config.mjs"),
    hasPrisma: has("@prisma/client") || hasFile("prisma/schema.prisma"),
    hasTestFramework: has("vitest") || has("jest") || has("playwright"),
  };

  profile = "custom";


  const hasNext = has("next") || hasFile("next.config.js") || hasFile("next.config.mjs") || hasFile("next.config.ts") || hasFile("app") || hasFile("src/app") || hasFile("pages") || hasFile("src/pages");
  const hasVite = has("vite") || hasFile("vite.config.ts") || hasFile("vite.config.js") || hasFile("vite.config.mjs");
  const hasExpo = has("expo") || has("react-native") || hasFile("app.json") && (readFileSync(path.join(cwd, "app.json"), "utf8").includes("expo") || readFileSync(path.join(cwd, "app.json"), "utf8").includes("react-native"));

  const isMonorepoRoot = hasFile("turbo.json") || hasFile("pnpm-workspace.yaml") || hasFile("nx.json");
  const isMonorepoPackage = !isMonorepoRoot && (cwd.includes(`${path.sep}apps${path.sep}`) || cwd.includes(`${path.sep}packages${path.sep}`));

  if (hasNext) {
    framework.name = "Next.js";
    if (deps["next"]) framework.version = deps["next"];
    const hasBackend =
      framework.hasPrisma ||
      has("@prisma/client") ||
      has("drizzle-orm") ||
      has("next-auth") ||
      has("@auth/core") ||
      hasFile("prisma") ||
      hasFile("src/lib/db.ts") ||
      hasFile("src/server");
    profile = hasBackend ? "nextjs-fullstack" : "nextjs-frontend";
  } else if (hasExpo) {
    framework.name = "Expo / React Native";
    profile = "expo-mobile";
  } else if (hasVite && has("react")) {
    framework.name = "React + Vite";
    profile = "react-vite";
  } else if (isMonorepoRoot) {
    framework.name = "Monorepo (Root)";
    profile = "monorepo-root";
  } else if (isMonorepoPackage) {
    framework.name = "Monorepo (Package)";
    profile = "monorepo-package";
  } else if (has("express") || has("fastify") || has("hono") || hasFile("server.js") || hasFile("src/server.ts")) {
    framework.name = "Node.js API";
    profile = "node-api";
  }

  const hasGit = hasFile(".git");
  const ide = detectIde(cwd);
  const isMonorepo = isMonorepoRoot || isMonorepoPackage;

  return { profile, name: projectName, hasGit, isMonorepo, ide, framework };
}

function detectIde(cwd: string): IdeType {
  const home = process.env["USERPROFILE"] ?? process.env["HOME"] ?? "";
  if (existsSync(path.join(home, ".cursor"))) return "cursor";
  if (existsSync(path.join(cwd, ".windsurf"))) return "windsurf";
  if (existsSync(path.join(cwd, ".vscode"))) return "vscode";
  return "unknown";
}
