/**
 * Shared configuration for all scripts in scripts/.
 *
 * Path resolution strategy:
 *   - Uses import.meta.url to locate THIS file, then walks up one level to the
 *     monorepo root — so it works regardless of what directory the user runs
 *     the script from (no more CWD-dependent paths).
 *
 * CLI overrides (pass on any script invocation):
 *   --templates-dir <path>   Override the resolved templates directory
 *   --dry-run                Log what WOULD happen but do not write any files
 *
 * Usage in a script:
 *   import { TEMPLATES_DIR, DRY_RUN } from './config.mjs';
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Absolute path to the monorepo root (one level above scripts/) */
export const MONOREPO_ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Resolve the templates directory.
 * Priority: --templates-dir CLI flag > default (packages/templates)
 */
function resolveTemplatesDir() {
  const argIndex = process.argv.indexOf('--templates-dir');
  if (argIndex !== -1 && process.argv[argIndex + 1]) {
    const override = process.argv[argIndex + 1];
    return path.isAbsolute(override)
      ? override
      : path.resolve(process.cwd(), override);
  }
  return path.join(MONOREPO_ROOT_DIR, 'packages', 'templates');
}

/** Absolute path to packages/templates (or --templates-dir override) */
export const TEMPLATES_DIR = resolveTemplatesDir();

/** True when --dry-run is passed — scripts should log but not write files */
export const DRY_RUN = process.argv.includes('--dry-run');
