// Public programmatic API — allows studio to be used as a library too
export { initCommand, InitCancelledError } from "./commands/init.js";
export type { InitOptions } from "./commands/init.js";
export { statusCommand } from "./commands/status.js";
export { validateCommand } from "./commands/validate.js";
export { detectProject } from "./core/project-detector.js";
export { copyTemplates, removeTemplate, loadRegistry, safeCompile } from "./core/template-engine.js";
export { generateIdeConfigs, generateCursorConfig, generateWindsurfConfig, generateCopilotConfig, generateClaudeConfig, generateRootAgentsFile } from "./core/ide-config-generator.js";
export type { IdeConfigContext } from "./core/ide-config-generator.js";
export { readConfig, writeConfig, createConfig } from "./core/config-manager.js";
export { setupGitExclude, setupIdeConfig } from "./core/git-integration.js";
export type { AgStudioConfig, ProjectProfile, ProjectInfo, IdeType, FrameworkInfo } from "./types/config.js";
export { contributeCommand } from "./commands/contribute.js";
