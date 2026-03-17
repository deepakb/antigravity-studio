// Public programmatic API — allows studio to be used as a library too
export { initCommand } from "./commands/init.js";
export { statusCommand } from "./commands/status.js";
export { validateCommand } from "./commands/validate.js";
export { detectProject } from "./core/project-detector.js";
export { copyTemplates, removeTemplate } from "./core/template-engine.js";
export { readConfig, writeConfig, createConfig } from "./core/config-manager.js";
export { setupGitExclude, setupIdeConfig } from "./core/git-integration.js";
export type { AgStudioConfig, ProjectProfile, ProjectInfo, IdeType } from "./types/config.js";
