import * as p from "@clack/prompts";
import chalk from "chalk";
import { IC } from "../ui/icons.js";
import { loadRegistry, copyTemplates, cleanupStaleScriptRunners } from "../core/template-engine.js";
import { detectProject } from "../core/project-detector.js";
import { createConfig, writeConfig } from "../core/config-manager.js";
import { setupGitExclude, checkGitignore } from "../core/git-integration.js";
import { generateIdeConfigs } from "../core/ide-config-generator.js";
import { getMcpCredentialSummary, writeMcpEnvExample } from "../core/mcp-composer.js";
import { loadCompanyConfig, applyCompanySkillPolicy } from "../core/enterprise-config.js";
import type { ProjectProfile } from "../types/config.js";
import type { RegistrySchema } from "../types/registry.js";

// NOTE: Handlebars helpers ('eq', etc.) are registered once in template-engine.ts.
// Do NOT register them here to avoid duplicate-registration warnings.
export class InitCancelledError extends Error {
  constructor(message = "Installation cancelled.") {
    super(message);
    this.name = "InitCancelledError";
  }
}

/** Lazy registry loader — avoids top-level call that crashes imports */
let _registryCache: RegistrySchema | null = null;
function getRegistry(): RegistrySchema {
  if (!_registryCache) _registryCache = loadRegistry();
  return _registryCache;
}

export interface InitOptions {
  force?: boolean;
  quiet?: boolean;
}

export async function initCommand(cwd: string = process.cwd(), opts: InitOptions = {}): Promise<void> {
  const registry = getRegistry();
  const ALL_AGENTS: string[] = registry.agents.map((a: { id: string }) => a.id);
  const PROFILE_AGENTS = Object.fromEntries(
    Object.entries(registry.profiles).map(([key, val]: [string, any]) => [key, val.agents])
  ) as Record<ProjectProfile, string[]>;
  const PROFILE_SKILLS = Object.fromEntries(
    Object.entries(registry.profiles).map(([key, val]: [string, any]) => [key, val.skills ?? []])
  ) as Record<ProjectProfile, string[]>;
  const PROFILE_SCRIPT_RUNNERS = Object.fromEntries(
    Object.entries(registry.profiles).map(([key, val]: [string, any]) => [key, val.scriptRunners ?? ["node"]])
  ) as Record<string, string[]>;
  const PROFILE_SCRIPT_GATES = Object.fromEntries(
    Object.entries(registry.profiles).map(([key, val]: [string, any]) => [key, (val.scriptGates as string[] | undefined) ?? null])
  ) as Record<string, string[] | null>;
  const ALL_SKILLS = registry.skills.map((s: { id: string; name: string }) => ({ value: s.id, label: s.name }));
  const SLASH_COMMANDS: string[] = registry.slashCommands;

  // ── Step 1: Detect project (fast — no spinner needed) ─────────────────────
  const projectInfo = detectProject(cwd);

  // ── Start clack prompt group ───────────────────────────────────────────────
  p.intro(chalk.bold.cyan("  Nexus Studio "));

  p.log.step(
    `${chalk.cyan(projectInfo.framework.name)} detected  ${chalk.dim(`(${projectInfo.profile})`)}`
  );

  if (projectInfo.framework.techStack && projectInfo.framework.techStack.length > 0) {
    p.note(
      projectInfo.framework.techStack.join("  •  "),
      chalk.bold("Detected Tech Stack")
    );
  }

  // ── Enterprise company standards ──────────────────────────────────────────
  const companyConfig = loadCompanyConfig(cwd);
  if (companyConfig?.companyName) {
    p.note(
      [
        `Company:  ${chalk.cyan(companyConfig.companyName)}`,
        `Required skills: ${chalk.yellow(companyConfig.requiredSkills.length.toString())}`,
        companyConfig.codingStandardsUrl ? `Standards: ${companyConfig.codingStandardsUrl}` : "",
      ].filter(Boolean).join("\n"),
      chalk.bold(`${IC.enterprise} Enterprise Standards Detected`)
    );
  }

  checkGitignore(cwd);

  // ── Step 2: Project name ───────────────────────────────────────────────────
  const projectName = await p.text({
    message: "What is your project name?",
    defaultValue: projectInfo.name,
    placeholder: projectInfo.name,
  });
  if (p.isCancel(projectName)) { p.cancel("Installation cancelled."); throw new InitCancelledError(); }

  // ── Step 3: Profile ───────────────────────────────────────────────────────
  const profileOptions = Object.entries(registry.profiles).map(([id, pv]: [string, any]) => ({
    value: id,
    label: pv.label,
    hint: pv.hint,
  }));
  profileOptions.push({ value: "custom", label: "Custom (choose agents individually)", hint: undefined });

  const profile = await p.select({
    message: "Select installation profile:",
    options: profileOptions as any,
    initialValue: projectInfo.profile as ProjectProfile,
  });
  if (p.isCancel(profile)) { p.cancel("Installation cancelled."); throw new InitCancelledError(); }

  // ── Step 4: Agents ────────────────────────────────────────────────────────
  let selectedAgents: string[];
  if (profile === "custom") {
    const chosen = await p.multiselect({
      message: "Which agents would you like to install?",
      options: ALL_AGENTS.map((a: string) => ({ value: a, label: a })),
      initialValues: PROFILE_AGENTS["nextjs-fullstack"],
      required: true,
    });
    if (p.isCancel(chosen)) { p.cancel("Installation cancelled."); throw new InitCancelledError(); }
    selectedAgents = chosen as string[];
  } else {
    selectedAgents = PROFILE_AGENTS[profile as ProjectProfile] ?? ALL_AGENTS;
  }

  // ── Step 4b: Skills ───────────────────────────────────────────────────────
  let selectedSkills: string[];
  const recommendedSkills = PROFILE_SKILLS[profile as ProjectProfile] ?? [];
  if (profile === "custom") {
    const chosenSkills = await p.multiselect({
      message: "Which skills would you like to inject?",
      options: ALL_SKILLS,
      initialValues: recommendedSkills,
      required: false,
    });
    if (p.isCancel(chosenSkills)) { p.cancel("Installation cancelled."); throw new InitCancelledError(); }
    selectedSkills = chosenSkills as string[];
  } else {
    selectedSkills = recommendedSkills;
  }

  // ── Company skill policy ───────────────────────────────────────────────────
  if (companyConfig) {
    const policyResult = applyCompanySkillPolicy(selectedSkills, companyConfig);
    selectedSkills = policyResult.skills;
    if (policyResult.injected.length > 0) {
      p.note(
        policyResult.injected.map(s => `+ ${chalk.green(s)}`).join("\n"),
        chalk.bold(`${IC.enterprise} Required by company policy`)
      );
    }
    if (policyResult.removed.length > 0) {
      p.note(
        policyResult.removed.map(s => `- ${chalk.red(s)}`).join("\n"),
        chalk.bold("⛔ Removed by company policy")
      );
    }
  }

  // ── Step 5: IDE selection ─────────────────────────────────────────────────
  // Priority order for pre-selection:
  //   1. Company config defaultIdes (highest — enforced by organisation)
  //   2. Detected IDE from project files (e.g. .cursor/ or .windsurfrules present)
  //   3. Fallback to "copilot"
  let initialIde = "copilot";
  if (projectInfo.ide === "cursor") initialIde = "cursor";
  else if (projectInfo.ide === "windsurf") initialIde = "windsurf";
  else if (projectInfo.ide === "claude-code") initialIde = "claude";

  // Company defaultIdes overrides detected IDE (first entry wins)
  const companyDefaultIde = companyConfig?.defaultIdes?.[0];
  if (companyDefaultIde) {
    // Map IdeType → select option value
    const ideMap: Record<string, string> = {
      copilot: "copilot",
      cursor: "cursor",
      windsurf: "windsurf",
      "claude-code": "claude",
      vscode: "copilot",
    };
    const mapped = ideMap[companyDefaultIde];
    if (mapped) initialIde = mapped;
  }

  const ideOptions = [
    { value: "copilot",     label: "GitHub Copilot (VS Code)", hint: ".vscode/mcp.json + .github/" },
    { value: "cursor",      label: "Cursor",                   hint: ".cursor/rules/*.mdc" },
    { value: "windsurf",    label: "Windsurf",                 hint: ".windsurfrules" },
    { value: "claude",      label: "Claude Code",              hint: "CLAUDE.md + .claude/agents/" },
    { value: "antigravity", label: "Antigravity only",         hint: ".agent/ (no extra config)" },
  ];

  // Annotate the company-preferred option so developers know why it's pre-selected
  if (companyDefaultIde) {
    const preferred = ideOptions.find((o) => o.value === initialIde);
    if (preferred) preferred.hint = `${preferred.hint}  ← company default`;
  }

  const selectedIde = await p.select({
    message: companyDefaultIde
      ? `Which IDE are you using? ${chalk.dim("(company default pre-selected)")}`
      : "Which IDE are you using?",
    options: ideOptions,
    initialValue: initialIde,
  });
  if (p.isCancel(selectedIde)) { p.cancel("Installation cancelled."); throw new InitCancelledError(); }

  const selectedIdes = selectedIde === "antigravity"
    ? ["antigravity"]
    : ["antigravity", selectedIde as string];

  // ── Resolve runners & gates ───────────────────────────────────────────────
  let resolvedScriptRunners: string[] = PROFILE_SCRIPT_RUNNERS[profile as string] ?? ["node"];
  let resolvedScriptGates: string[] | undefined = PROFILE_SCRIPT_GATES[profile as string] ?? undefined;

  if (projectInfo.isMonorepo) {
    const allRunners = Object.values(PROFILE_SCRIPT_RUNNERS).flat();
    resolvedScriptRunners = [...new Set(allRunners)];
    resolvedScriptGates = undefined;
  }

  // ── Step 7: Install ───────────────────────────────────────────────────────
  const installSpinner = p.spinner();
  installSpinner.start(
    `Installing ${selectedAgents.length} agents, ${selectedSkills.length} skills [${resolvedScriptRunners.join("+")} stack]...`
  );

  try {
    const templateContext = {
      name: String(projectName),
      projectName: String(projectName),
      profile: String(profile),
      framework: {
        name: projectInfo.framework.name ?? "unknown",
        version: projectInfo.framework.version ?? "",
        hasTypeScript: projectInfo.framework.hasTypeScript ?? false,
        hasTailwind: projectInfo.framework.hasTailwind ?? false,
        hasEslint: projectInfo.framework.hasEslint ?? false,
        hasPrisma: projectInfo.framework.hasPrisma ?? false,
        hasTestFramework: projectInfo.framework.hasTestFramework ?? false,
        techStack: projectInfo.framework.techStack ?? [],
      },
      ide: projectInfo.ide ?? "unknown",
      timestamp: new Date().toISOString().split("T")[0],
      isMonorepo: projectInfo.isMonorepo ?? false,
    };

    const result = await copyTemplates(cwd, {
      include: {
        agents: selectedAgents,
        skills: selectedSkills,
        scriptRunners: resolvedScriptRunners,
        ...(resolvedScriptGates ? { scripts: resolvedScriptGates } : {}),
      },
      force: opts.force ?? false,
    }, templateContext);

    installSpinner.stop(
      `${result.copied.length} files installed${
        result.skipped.length > 0 ? `, ${result.skipped.length} skipped` : ""
      }`
    );

    // Cleanup stale runners from a previous init (silent)
    const removed = await cleanupStaleScriptRunners(cwd, resolvedScriptRunners, resolvedScriptGates ?? null);
    if (removed.length > 0) {
      p.log.info(`Cleaned up ${removed.length} stale script file(s) from previous profile`);
    }

    // Git setup (silent)
    await setupGitExclude(cwd);

    // ── Step 8: IDE config generation ────────────────────────────────────────
    await generateIdeConfigs(cwd, selectedIdes as string[], {
      projectName: String(projectName),
      profile: String(profile),
      framework: {
        name: templateContext.framework.name,
        version: templateContext.framework.version,
        hasTypeScript: templateContext.framework.hasTypeScript,
        hasTailwind: templateContext.framework.hasTailwind,
        hasEslint: templateContext.framework.hasEslint,
        hasPrisma: templateContext.framework.hasPrisma,
        hasTestFramework: templateContext.framework.hasTestFramework,
      },
      selectedAgents,
      selectedSkills,
      force: opts.force ?? false,
    });

    // ── Step 9: Write .agstudio.json ─────────────────────────────────────────
    const installedForConfig = result.installed;
    const config = createConfig(
      String(projectName),
      profile as ProjectProfile,
      installedForConfig,
      result.hashes,
    );
    if (companyConfig) config.companyConfig = companyConfig;
    await writeConfig(config, cwd);

    // ── Step 10: MCP credential summary ──────────────────────────────────────
    try {
      const mcpSummary = getMcpCredentialSummary(String(profile));
      const hasOptional = mcpSummary.tier2Optional.length > 0;
      const hasDisabled  = mcpSummary.tier3Disabled.length > 0;

      if (mcpSummary.tier1Ready.length > 0 || hasOptional || hasDisabled) {
        const lines: string[] = [];

        if (mcpSummary.tier1Ready.length > 0) {
          lines.push(`${IC.pass} ${chalk.green("Ready (zero-config):")}`);
          for (const s of mcpSummary.tier1Ready) {
            lines.push(`   ${IC.sub} ${s.label}`);
          }
        }
        if (hasOptional) {
          lines.push(`\n${IC.warn} ${chalk.yellow("Optional — add to .env.local to activate:")}`);
          for (const s of mcpSummary.tier2Optional) {
            lines.push(`   ${IC.sub} ${s.label}`);
            for (let i = 0; i < s.envVars.length; i++) {
              lines.push(`     ${chalk.dim(s.envVars[i]!)}`);
            }
          }
        }
        if (hasDisabled) {
          lines.push(`\n${IC.fail} ${chalk.red("Disabled — credentials required:")}`);
          for (const s of mcpSummary.tier3Disabled) {
            lines.push(`   ${IC.sub} ${s.label}`);
            for (let i = 0; i < s.envVars.length; i++) {
              lines.push(`     ${chalk.dim(s.envVars[i]!)}  ${chalk.cyan(s.howToGet[i] ?? "")}`);
            }
          }
        }

        p.note(lines.join("\n"), chalk.bold("🔌 MCP Servers"));
      }

      writeMcpEnvExample(cwd, mcpSummary, opts.force ?? false);
    } catch { /* MCP summary is non-critical */ }

    // ── Done ──────────────────────────────────────────────────────────────────
    const cmdList = SLASH_COMMANDS.map(c => chalk.cyan(`  • ${c}`)).join("\n");
    p.outro(
      `${IC.pass} ${chalk.bold.green("All done. Run /status to see what's wired.")}` +
      `\n\n${chalk.bold("Workflow commands:")}\n${cmdList}` +
      `\n\n${chalk.dim("Run")} ${chalk.cyan("studio validate")} ${chalk.dim("to run your first quality gate")}` +
      `\n${chalk.dim("Run")} ${chalk.cyan("studio context init")} ${chalk.dim("to set up your developer profile")}`
    );
  } catch (error) {
    installSpinner.stop();
    p.cancel("Installation failed.");
    throw error;
  }
}
