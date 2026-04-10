import { existsSync, readFileSync, readdirSync } from "fs";
import path from "path";
import type { ProjectInfo, ProjectProfile, IdeType, FrameworkInfo } from "../types/config.js";

/**
 * Detects the project type based on config files and dependencies.
 * Supports: Next.js, React, Angular, Vue/Nuxt, Node.js API,
 *           Python (FastAPI/Django), Java (Spring Boot), .NET, Flutter, Expo/RN.
 */
export function detectProject(cwd: string = process.cwd()): ProjectInfo {
  const agConfigPath = path.join(cwd, ".agstudio.json");
  const packageJsonPath = path.join(cwd, "package.json");

  let deps: Record<string, string> = {};
  let projectName = path.basename(cwd);
  let existingProfile: ProjectProfile | null = null;

  // ── Priority 1: Honour existing Antigravity config (user already initialised) ──
  if (existsSync(agConfigPath)) {
    try {
      const config = JSON.parse(readFileSync(agConfigPath, "utf-8"));
      if (config.profile) existingProfile = config.profile as ProjectProfile;
      if (config.project) projectName = config.project;
    } catch {
      // Ignore parse errors — re-detect below
    }
  }

  // ── Priority 2: JS/TS ecosystem — read package.json ────────────────────────
  if (existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as Record<string, unknown>;
      if (typeof pkg["name"] === "string" && pkg["name"]) projectName = pkg["name"];
      deps = {
        ...(pkg["dependencies"] as Record<string, string> ?? {}),
        ...(pkg["devDependencies"] as Record<string, string> ?? {}),
      };
    } catch {
      // Malformed package.json — continue with empty deps
    }
  }

  const has = (name: string) => name in deps;
  const hasFile = (f: string) => existsSync(path.join(cwd, f));

  // ── App.json (Expo/RN) — read once ──────────────────────────────────────────
  let appJsonContent: string | null = null;
  if (hasFile("app.json")) {
    try { appJsonContent = readFileSync(path.join(cwd, "app.json"), "utf8"); } catch { /* ignore */ }
  }

  // ── Coarse capability flags ──────────────────────────────────────────────────
  const hasTypeScript = has("typescript") || hasFile("tsconfig.json");
  const hasTailwind   = has("tailwindcss");
  const hasEslint     = has("eslint") || hasFile(".eslintrc.js") || hasFile(".eslintrc.json") || hasFile("eslint.config.mjs") || hasFile("eslint.config.js");
  const hasPrisma     = has("@prisma/client") || hasFile("prisma/schema.prisma");
  const hasTestFw     = has("vitest") || has("jest") || has("playwright") || has("@testing-library/react");

  // ── JS/TS Framework detection ────────────────────────────────────────────────
  const isNext  = has("next") || hasFile("next.config.js") || hasFile("next.config.mjs") || hasFile("next.config.ts");
  const isVite  = has("vite") || hasFile("vite.config.ts") || hasFile("vite.config.js") || hasFile("vite.config.mjs");
  const isExpo  = has("expo") || (appJsonContent !== null && appJsonContent.includes("expo"));
  const isRN    = has("react-native") || (appJsonContent !== null && appJsonContent.includes("react-native"));

  // Angular: angular.json is the definitive marker
  const isAngular = hasFile("angular.json") || has("@angular/core");

  // Vue: nuxt has its own profile; plain Vue uses vite
  const isNuxt  = has("nuxt") || hasFile("nuxt.config.ts") || hasFile("nuxt.config.js");
  const isVue   = has("vue") && !isAngular;

  // Node.js API (pure backend, no frontend framework)
  const isNodeApi = !isNext && !isAngular && !isVue && !isNuxt && !isExpo && !isRN &&
    (has("express") || has("fastify") || has("hono") || has("@nestjs/core") ||
     hasFile("server.js") || hasFile("src/server.ts") || hasFile("src/main.ts"));

  // Monorepo
  const isMonorepoRoot    = hasFile("turbo.json") || hasFile("pnpm-workspace.yaml") || hasFile("nx.json") || hasFile("lerna.json");
  const isMonorepoPackage = !isMonorepoRoot && (cwd.includes(`${path.sep}apps${path.sep}`) || cwd.includes(`${path.sep}packages${path.sep}`));

  // ── Polyglot (non-JS) ecosystem detection ────────────────────────────────────
  const isPython  = hasFile("requirements.txt") || hasFile("pyproject.toml") || hasFile("setup.py") || hasFile("setup.cfg") || hasFile("Pipfile");
  const isFastAPI = isPython && (hasFile("main.py") || _fileContains(cwd, "main.py", "FastAPI") || _fileContains(cwd, "requirements.txt", "fastapi"));
  const isDjango  = isPython && (_fileContains(cwd, "requirements.txt", "Django") || hasFile("manage.py"));

  const isJava    = hasFile("pom.xml") || (hasFile("build.gradle") && !hasFile("pubspec.yaml"));
  const isSpring  = isJava && (_fileContains(cwd, "pom.xml", "spring-boot") || _fileContains(cwd, "build.gradle", "spring-boot"));

  const isDotNet  = hasFile("*.csproj") || _globExistsExt(cwd, ".csproj") || hasFile("appsettings.json") || hasFile("Program.cs") || hasFile("Startup.cs");

  const isFlutter = hasFile("pubspec.yaml") && _fileContains(cwd, "pubspec.yaml", "flutter");

  // ── Build FrameworkInfo ───────────────────────────────────────────────────────
  const framework: FrameworkInfo = {
    name: "Unknown",
    language: "unknown",
    hasTypeScript,
    hasTailwind,
    hasEslint,
    hasPrisma,
    hasTestFramework: hasTestFw,
  };

  let profile: ProjectProfile = existingProfile ?? "custom";

  // Only auto-detect if no existing config pinned the profile
  if (!existingProfile) {
    if (isNext) {
      framework.name = "Next.js";
      framework.language = "typescript";
      if (deps["next"]) framework.version = deps["next"];
      const hasBackend = hasPrisma || has("drizzle-orm") || has("next-auth") || has("@auth/core") || hasFile("prisma") || hasFile("src/server");
      profile = hasBackend ? "nextjs-fullstack" : "nextjs-frontend";

    } else if (isAngular) {
      framework.name = "Angular";
      framework.language = "typescript";
      if (deps["@angular/core"]) framework.version = deps["@angular/core"];
      profile = "angular-enterprise";

    } else if (isNuxt) {
      framework.name = "Nuxt.js";
      framework.language = "typescript";
      if (deps["nuxt"]) framework.version = deps["nuxt"];
      profile = "vue-nuxt";

    } else if (isVue && isVite) {
      framework.name = "Vue + Vite";
      framework.language = "typescript";
      profile = "vue-vite";

    } else if (isExpo || isRN) {
      framework.name = isExpo ? "Expo / React Native" : "React Native";
      framework.language = "typescript";
      profile = "expo-mobile";

    } else if (isVite && has("react")) {
      framework.name = "React + Vite";
      framework.language = "typescript";
      profile = "react-vite";

    } else if (isFastAPI) {
      framework.name = "Python / FastAPI";
      framework.language = "python";
      profile = "python-fastapi";

    } else if (isDjango) {
      framework.name = "Python / Django";
      framework.language = "python";
      profile = "python-django";

    } else if (isPython) {
      framework.name = "Python";
      framework.language = "python";
      profile = "python-fastapi"; // Sensible default for generic Python

    } else if (isSpring || isJava) {
      framework.name = isSpring ? "Java / Spring Boot" : "Java";
      framework.language = "java";
      profile = "java-spring";

    } else if (isDotNet) {
      framework.name = ".NET / ASP.NET Core";
      framework.language = "csharp";
      profile = "dotnet-api";

    } else if (isFlutter) {
      framework.name = "Flutter";
      framework.language = "dart";
      profile = "flutter-mobile";

    } else if (isMonorepoRoot) {
      framework.name = "Monorepo (Root)";
      framework.language = "typescript";
      profile = "monorepo-root";

    } else if (isMonorepoPackage) {
      framework.name = "Monorepo (Package)";
      framework.language = "typescript";
      profile = "monorepo-package";

    } else if (isNodeApi) {
      framework.name = "Node.js API";
      framework.language = "typescript";
      profile = "node-api";
    }
  }

  // ── Tech stack badge list (shown in CLI) ──────────────────────────────────────
  const stack: string[] = [];
  // JS/TS frameworks
  if (isNext)    stack.push("💿 Next.js");
  if (isAngular) stack.push("🔺 Angular");
  if (isNuxt)    stack.push("💚 Nuxt.js");
  if (isVue && !isNuxt) stack.push("💚 Vue");
  if (isExpo || isRN) stack.push("📱 Expo / RN");
  if (has("react") && !isNext && !isExpo) stack.push("⚛️ React");
  if (hasTypeScript) stack.push("🟦 TypeScript");
  if (hasTailwind)   stack.push("🎨 Tailwind CSS");
  if (hasPrisma)     stack.push("💎 Prisma");
  if (has("drizzle-orm"))   stack.push("💧 Drizzle");
  if (has("zod"))           stack.push("🛡️ Zod");
  if (has("@nestjs/core"))  stack.push("🐈 NestJS");
  if (has("shadcn-ui") || hasFile("components.json")) stack.push("🧩 shadcn/ui");
  if (has("vitest"))        stack.push("🧪 Vitest");
  if (has("playwright"))    stack.push("🎭 Playwright");
  if (has("@trpc/server") || has("trpc")) stack.push("⚡ tRPC");
  // Polyglot
  if (isFastAPI)  stack.push("⚡ FastAPI");
  if (isDjango)   stack.push("🐍 Django");
  if (isPython && !isFastAPI && !isDjango) stack.push("🐍 Python");
  if (isSpring)   stack.push("🍃 Spring Boot");
  if (isJava && !isSpring) stack.push("☕ Java");
  if (isDotNet)   stack.push("🔵 .NET");
  if (isFlutter)  stack.push("💙 Flutter");
  // Cloud / AI SDKs (bonus badges)
  if (has("openai"))           stack.push("🤖 OpenAI");
  if (has("@anthropic-ai/sdk")) stack.push("🧠 Claude");
  if (has("@google/generative-ai")) stack.push("✨ Gemini");
  if (has("langchain") || has("@langchain/core")) stack.push("⛓️ LangChain");

  framework.techStack = stack;

  const hasGit   = hasFile(".git");
  const ide      = detectIde(cwd);
  const isMonorepo = isMonorepoRoot || isMonorepoPackage;

  return { profile, name: projectName, hasGit, isMonorepo, ide, framework };
}

// ── Private Helpers ─────────────────────────────────────────────────────────

/** Read a file and check if it contains a substring (case-insensitive). Returns false if file missing. */
function _fileContains(cwd: string, relPath: string, needle: string): boolean {
  const fullPath = path.join(cwd, relPath);
  if (!existsSync(fullPath)) return false;
  try {
    return readFileSync(fullPath, "utf8").toLowerCase().includes(needle.toLowerCase());
  } catch {
    return false;
  }
}

/** Check if any file with the given extension exists directly in cwd (non-recursive). */
function _globExistsExt(cwd: string, ext: string): boolean {
  try {
    return readdirSync(cwd).some((f: string) => f.endsWith(ext));
  } catch {
    return false;
  }
}

function detectIde(cwd: string): IdeType {
  // Priority 1: Check for local project-specific markers
  if (existsSync(path.join(cwd, ".cursor")) || existsSync(path.join(cwd, ".cursorrules"))) return "cursor";
  if (existsSync(path.join(cwd, ".windsurf")) || existsSync(path.join(cwd, ".windsurfrules"))) return "windsurf";
  if (existsSync(path.join(cwd, ".claudecode")) || existsSync(path.join(cwd, ".claude")) || existsSync(path.join(cwd, "CLAUDE.md"))) return "claude-code";
  if (existsSync(path.join(cwd, ".github")) && existsSync(path.join(cwd, ".github", "copilot-instructions.md"))) return "copilot";
  if (existsSync(path.join(cwd, ".agent"))) return "antigravity";
  if (existsSync(path.join(cwd, ".vscode"))) return "vscode";

  // Priority 2: Check for global system markers (fallback) - Windows paths as per research
  const home = process.env["USERPROFILE"] ?? process.env["HOME"] ?? "";
  if (home) {
    if (existsSync(path.join(home, ".cursor"))) return "cursor";
    if (existsSync(path.join(home, ".codeium", "windsurf"))) return "windsurf";
    if (existsSync(path.join(home, ".claude"))) return "claude-code";
    if (existsSync(path.join(home, ".gemini", "antigravity"))) return "antigravity";
  }
  
  return "unknown";
}
