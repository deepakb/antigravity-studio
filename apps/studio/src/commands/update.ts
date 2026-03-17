import { copyTemplates } from "../core/template-engine.js";
import { logger } from "../ui/logger.js";
import { readConfig, writeConfig } from "../core/config-manager.js";
import path from "path";

interface UpdateOptions {
  force: boolean;
  dryRun: boolean;
}

export async function updateCommand(opts: UpdateOptions) {
  if (opts.dryRun) {
    logger.info("DRY RUN: Checking for updates...");
  } else {
    logger.info("Updating all templates from the studio engine...");
  }

  // If we just want to update, we copy all available templates, 
  // skipping ones that exist unless force=true.
  const result = await copyTemplates(process.cwd(), { 
    force: opts.force,
    dryRun: opts.dryRun 
  });
  
  if (opts.dryRun) {
    logger.info(`Would copy ${result.copied.length} files.`);
    logger.info(`Would skip ${result.skipped.length} files (already exist, use --force to overwrite).`);
    return;
  }

  // Step 2: Sync config
  const config = readConfig(process.cwd());
  if (config) {
    config.installed = result.installed;
    await writeConfig(config, process.cwd());
  }

  logger.success(`Update complete.`);
  logger.info(`Copied/Overwritten: ${result.copied.length} files`);
  logger.info(`Skipped: ${result.skipped.length} files (customized)`);
  
  if (result.skipped.length > 0) {
    logger.info(`Tip: Use '--force' to overwrite localized customizations with the latest engine defaults.`);
  }
}
