/**
 * `studio rollback`
 *
 * Restores the .agent/ directory from the snapshot recorded by the last
 * `studio update` run.  Snapshot path is stored in .agstudio.json#rollbackSnapshot.
 *
 * Usage:
 *   studio rollback              → restore last snapshot (prompts for confirmation)
 *   studio rollback --list       → list all available snapshots
 *   studio rollback --force      → restore without prompting
 */

import * as p from "@clack/prompts";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import gradient from "gradient-string";
import boxen from "boxen";
import { readConfig, writeConfig } from "../core/config-manager.js";
import { logger } from "../ui/logger.js";

export interface RollbackOptions {
  list?:  boolean;
  force?: boolean;
}

const BACKUP_ROOT = ".agstudio-backup";

export async function rollbackCommand(
  cwd: string = process.cwd(),
  opts: RollbackOptions = {}
): Promise<void> {
  const backupRootPath = path.join(cwd, BACKUP_ROOT);
  const cyanPink = gradient(["#00DBDE", "#FC00FF"]);

  // ── --list mode ───────────────────────────────────────────────────────────
  if (opts.list) {
    logger.blank();
    process.stdout.write(
      cyanPink.multiline(`  Nexus Rollback — Available Snapshots\n  ${"─".repeat(42)}\n`)
    );

    if (!fs.existsSync(backupRootPath)) {
      logger.warn("No snapshots found. Run `studio update` to create one.");
      return;
    }

    const snapshots = await _listSnapshots(backupRootPath);
    if (snapshots.length === 0) {
      logger.warn("No snapshots found. Run `studio update` to create one.");
      return;
    }

    snapshots.forEach((snap, idx) => {
      const tag = idx === 0 ? chalk.green(" ← latest") : "";
      console.log(`  ${chalk.cyan(snap)}${tag}`);
    });
    logger.blank();
    return;
  }

  // ── Normal rollback ───────────────────────────────────────────────────────
  const config = readConfig(cwd);

  if (!config) {
    logger.error("No .agstudio.json found. Run `studio init` first.");
    process.exit(1);
  }

  if (!config.rollbackSnapshot) {
    // Try to find any snapshot on disk as a fallback
    if (fs.existsSync(backupRootPath)) {
      const snapshots = await _listSnapshots(backupRootPath);
      if (snapshots.length > 0) {
        logger.warn("No rollback recorded in .agstudio.json, but snapshots exist on disk.");
        logger.info(`Latest: ${chalk.cyan(snapshots[0]!)}`);
        logger.info(`Run ${chalk.cyan("studio rollback --list")} to see all, then restore manually.`);
      }
    } else {
      logger.warn("No rollback snapshot available. Run `studio update` first to create one.");
    }
    process.exit(0);
  }

  const { timestamp, backupDir } = config.rollbackSnapshot;
  const backupPath = path.isAbsolute(backupDir) ? backupDir : path.join(cwd, backupDir);

  if (!fs.existsSync(backupPath)) {
    logger.error(`Snapshot directory not found: ${backupDir}`);
    logger.info("The snapshot may have been deleted. Run `studio update` to create a new one.");
    process.exit(1);
  }

  logger.blank();
  process.stdout.write(
    cyanPink.multiline(`  Nexus Rollback\n  ${"─".repeat(30)}\n`)
  );

  console.log(
    boxen(
      `  ${chalk.dim("Snapshot:")} ${chalk.cyan(timestamp)}\n` +
      `  ${chalk.dim("From:")}     ${chalk.dim(backupDir)}\n` +
      `  ${chalk.dim("Target:")}   ${chalk.dim(".agent/")}`,
      { padding: 1, margin: { top: 0, bottom: 1 }, borderStyle: "round", borderColor: "yellow" }
    )
  );

  // ── Confirm unless --force ────────────────────────────────────────────────
  if (!opts.force) {
    const confirmed = await p.confirm({
      message: `Restore .agent/ from snapshot ${chalk.cyan(timestamp)}? This will overwrite your current .agent/ directory.`,
      initialValue: false,
    });
    if (p.isCancel(confirmed) || !confirmed) {
      logger.info("Rollback cancelled.");
      return;
    }
  }

  // ── Execute rollback ──────────────────────────────────────────────────────
  const snapshotAgentDir = path.join(backupPath, ".agent");
  const targetAgentDir   = path.join(cwd, ".agent");

  if (!fs.existsSync(snapshotAgentDir)) {
    logger.error(`Snapshot is missing the .agent/ folder: ${backupPath}`);
    process.exit(1);
  }

  // Take a safety snapshot of current state before rolling back
  const safetyTimestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const safetyDir = path.join(backupRootPath, `pre-rollback-${safetyTimestamp}`);
  if (fs.existsSync(targetAgentDir)) {
    await fs.copy(targetAgentDir, path.join(safetyDir, ".agent"), { overwrite: true });
    logger.dim(`Safety snapshot of current state → .agstudio-backup/pre-rollback-${safetyTimestamp}/`);
  }

  // Copy snapshot → .agent/
  await fs.copy(snapshotAgentDir, targetAgentDir, { overwrite: true });

  // Clear rollbackSnapshot from config (it's been consumed)
  delete (config as unknown as Record<string, unknown>)['rollbackSnapshot'];
  await writeConfig(config, cwd);

  logger.blank();
  logger.success(`Rollback complete! .agent/ restored from snapshot ${chalk.cyan(timestamp)}.`);
  logger.dim(`Your pre-rollback state is saved at .agstudio-backup/pre-rollback-${safetyTimestamp}/`);
  logger.blank();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function _listSnapshots(backupRootPath: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(backupRootPath);
    return entries
      .filter((e) => fs.statSync(path.join(backupRootPath, e)).isDirectory())
      .sort()
      .reverse(); // newest first
  } catch {
    return [];
  }
}
