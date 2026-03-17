import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";
import { logger } from "../ui/logger.js";
import Handlebars from "handlebars";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Returns the absolute path to the bundled templates directory.
 */
function getTemplatesDir(): string {
  // In production (bundled), templates are usually in a 'templates' folder next to 'dist'
  const distPath = path.resolve(__dirname, "../templates");
  
  // In monorepo development (apps/studio/src/core/...)
  const monoRepoSrcPath = path.resolve(__dirname, "../../../packages/templates");

  if (fs.existsSync(distPath)) {
    return distPath;
  }
  return monoRepoSrcPath;
}

export function loadRegistry(): any {
  const templatesDir = getTemplatesDir();
  const registryPath = path.join(templatesDir, "registry.json");
  if (fs.existsSync(registryPath)) {
    return JSON.parse(fs.readFileSync(registryPath, "utf-8"));
  }
  throw new Error(`Registry not found at ${registryPath}`);
}

interface CopyOptions {
  /** Agents, skills, workflows, or scripts to include (undefined = all) */
  include?: {
    agents?: string[];
    skills?: string[];
    workflows?: string[];
    scripts?: string[];
  };
  /** Overwrite existing files */
  force?: boolean;
  /** Preview actions without making changes */
  dryRun?: boolean;
}

export interface CopyResult {
  copied: string[];
  skipped: string[];
  installed: {
    agents: string[];
    skills: string[];
    workflows: string[];
    scripts: string[];
  };
}

/**
 * Copies selected templates into the target project's .agent/ folder.
 * Uses Handlebars to inject context into .md and .ts files.
 */
export async function copyTemplates(
  targetDir: string,
  options: CopyOptions = {},
  context: any = {}
): Promise<CopyResult> {
  const templatesDir = getTemplatesDir();
  const srcDir = path.join(templatesDir, ".agent");
  const destDir = path.join(targetDir, ".agent");
  const result: CopyResult = { 
    copied: [], 
    skipped: [],
    installed: { agents: [], skills: [], workflows: [], scripts: [] }
  };

  await fs.ensureDir(destDir);

  // Use forward slashes for glob on Windows to be safe
  const globPath = srcDir.replace(/\\/g, "/");
  const allFiles = await glob("**/*", { cwd: globPath, dot: true, nodir: true });

  for (let relPath of allFiles) {
    // Normalize to forward slashes for consistent parsing
    relPath = relPath.replace(/\\/g, "/");
    
    // Filter by category if include options are set
    if (options.include) {
      const parts = relPath.split("/"); 
      const category = parts[0] ?? "";
      
      const rawName = parts[1] ?? ""; 
      const name = rawName.endsWith(".md") || rawName.endsWith(".ts") 
        ? path.basename(rawName, path.extname(rawName)) 
        : rawName;

      const isAgent = category === "agents";
      const isSkill = category === "skills";
      const isWorkflow = category === "workflows";
      const isScript = category === "scripts";

      if (isAgent && options.include.agents && !options.include.agents.includes(name)) continue;
      if (isSkill && options.include.skills && !options.include.skills.includes(name)) continue;
      if (isWorkflow && options.include.workflows && !options.include.workflows.includes(name)) continue;
      if (isScript && options.include.scripts && !options.include.scripts.includes(name)) continue;
    }

    const srcPath = path.join(srcDir, relPath);
    const destPath = path.join(destDir, relPath);

    // Add to categorized result (track everything we encounter)
    const parts = relPath.split("/");
    const category = parts[0] as keyof CopyResult["installed"];
    if (result.installed[category]) {
      const rawName = parts[1] ?? "";
      const name = rawName.endsWith(".md") || rawName.endsWith(".ts") 
        ? path.basename(rawName, path.extname(rawName)) 
        : rawName;
      
      if (name && !result.installed[category].includes(name)) {
        result.installed[category].push(name);
      }
    }

    if (!options.force && (await fs.pathExists(destPath))) {
      result.skipped.push(relPath);
      continue;
    }

    if (!options.dryRun) {
      await fs.ensureDir(path.dirname(destPath));
      
      const isTemplate = relPath.endsWith(".md") || relPath.endsWith(".ts");
      
      if (isTemplate) {
        let content = await fs.readFile(srcPath, "utf-8");
        
        // Safely inject context variables using regex to avoid Handlebars/JSX conflicts
        // Supports: {{name}}, {{profile}}, {{ide}}, {{framework.name}}, etc.
        const replacements: Record<string, string> = {
          name: context.name || "",
          profile: context.profile || "",
          ide: context.ide || "",
          "framework.name": context.framework?.name || "",
          timestamp: new Date().toISOString(),
        };

        for (const [key, value] of Object.entries(replacements)) {
          const regex = new RegExp(`{{\\s*${key.replace(".", "\\.")}\\s*}}`, "g");
          content = content.replace(regex, value);
        }

        await fs.writeFile(destPath, content);
      } else {
        await fs.copy(srcPath, destPath, { overwrite: options.force ?? false });
      }
    }
    
    result.copied.push(relPath);
  }

  if (!options.dryRun && result.installed.skills.length > 0) {
    const skillsManifestPath = path.join(destDir, "skills.json");
    try {
      await fs.ensureDir(path.dirname(skillsManifestPath));
      await fs.writeJson(skillsManifestPath, {
        project: context.name,
        profile: context.profile,
        updatedAt: new Date().toISOString(),
        skills: result.installed.skills.map(id => ({
          id,
          path: `./skills/${id}`
        }))
      }, { spaces: 2 });
    } catch (e) {
      console.error("Failed to write skills manifest:", e);
    }
  }

  return result;
}

export async function removeTemplate(
  targetDir: string,
  category: "agents" | "skills" | "workflows" | "scripts",
  name: string
): Promise<void> {
  const agentDir = path.join(targetDir, ".agent", category);
  
  // Look for both the direct file (.md/.ts) or the folder (for skills)
  const fileTarget = path.join(agentDir, `${name}.md`);
  const scriptTarget = path.join(agentDir, `${name}.ts`);
  const folderTarget = path.join(agentDir, name);

  let removed = false;

  if (await fs.pathExists(fileTarget)) {
    await fs.remove(fileTarget);
    logger.success(`Removed ${category}/${name}.md`);
    removed = true;
  }
  
  if (await fs.pathExists(scriptTarget)) {
    await fs.remove(scriptTarget);
    logger.success(`Removed ${category}/${name}.ts`);
    removed = true;
  }
  
  if (await fs.pathExists(folderTarget) && (await fs.stat(folderTarget)).isDirectory()) {
    await fs.remove(folderTarget);
    logger.success(`Removed ${category}/${name}/`);
    removed = true;
  }

  if (!removed) {
    logger.warn(`Could not find ${name} in ${category}`);
  }
}
