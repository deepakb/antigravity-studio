/**
 * `studio context` — Living project context management
 *
 * Subcommands:
 *   studio context init    Create .agent/context/ + inject profile + generate skills index
 *   studio context sync    Re-inject profile if changed + regenerate SKILLS_INDEX
 *   studio context log     Append a decision, gotcha, or progress update
 *   studio context status  Show context health for this project
 */

import * as p from "@clack/prompts";
import chalk from "chalk";
import gradient from "gradient-string";
import { logger } from "../ui/logger.js";
import { IC } from "../ui/icons.js";
import {
  initContext,
  syncContext,
  appendLogEntry,
  getContextStatus,
  CONTEXT_FILES,
  type LogEntry,
} from "../core/context-manager.js";

// ─── init ─────────────────────────────────────────────────────────────────────

export async function contextInitCommand(cwd: string, force = false): Promise<void> {
  const cyanPink = gradient(["#00DBDE", "#FC00FF"]);

  logger.blank();
  process.stdout.write(
    cyanPink.multiline(`  Nexus Studio — Context Init\n  ${"─".repeat(32)}\n`)
  );

  p.intro(chalk.bold.cyan("  Initialising living project context "));

  const spinner = p.spinner();
  spinner.start("Creating .agent/context/ …");

  let result: { created: string[]; skipped: string[] };
  try {
    result = await initContext(cwd, force);
  } catch (err: any) {
    spinner.stop("Failed");
    logger.error(err.message ?? String(err));
    process.exit(1);
  }

  spinner.stop("Context files ready");

  if (result.created.length > 0) {
    p.log.step("Created:");
    result.created.forEach((f) => logger.success(`.agent/context/${f}`));
  }

  if (result.skipped.length > 0) {
    p.log.step("Skipped (already exist — use --force to overwrite):");
    result.skipped.forEach((f) => logger.dim(`.agent/context/${f}`));
  }

  logger.blank();
  p.log.message(
    chalk.dim(
      "Next steps:\n" +
      `  • Edit ${chalk.cyan(".agent/context/PROJECT_STATE.md")} to describe your current sprint\n` +
      `  • Run ${chalk.cyan("studio context log")} to record decisions and gotchas as you work\n` +
      `  • Run ${chalk.cyan("studio context sync")} after updating your developer profile`
    )
  );

  if (!result.created.includes("DEVELOPER.md") || result.skipped.includes("DEVELOPER.md")) {
    const hasProfile = (await import("../core/profile-manager.js")).profileExists();
    if (!hasProfile) {
      logger.blank();
      logger.warn("No developer profile found.");
      logger.info(`Run ${chalk.cyan("studio profile create")} to set up your Developer DNA profile.`);
    }
  }

  p.outro(`${IC.pass} Context initialised`);
}

// ─── sync ─────────────────────────────────────────────────────────────────────

export async function contextSyncCommand(cwd: string): Promise<void> {
  p.intro(chalk.bold.cyan("  Syncing project context "));

  const spinner = p.spinner();
  spinner.start("Checking profile and skills …");

  let result: { profileUpdated: boolean; skillsUpdated: boolean; stale: boolean };
  try {
    result = await syncContext(cwd);
  } catch (err: any) {
    spinner.stop("Failed");
    logger.error(err.message ?? String(err));
    process.exit(1);
  }

  spinner.stop("Sync complete");

  if (result.stale && result.profileUpdated) {
    logger.success("Developer profile re-injected into .agent/context/DEVELOPER.md");
  } else if (result.stale && !result.profileUpdated) {
    logger.warn("Profile changed but no profile file found at ~/.agstudio/profile.md");
    logger.info(`Run ${chalk.cyan("studio profile create")} to set up your profile.`);
  } else {
    logger.dim("Developer profile is up to date — no changes needed");
  }

  if (result.skillsUpdated) {
    logger.success(".agent/context/SKILLS_INDEX.md regenerated");
  }

  p.outro(`${IC.pass} Context synced`);
}

// ─── log ──────────────────────────────────────────────────────────────────────

export async function contextLogCommand(
  cwd: string,
  typeArg?: string,
  messageArg?: string
): Promise<void> {
  // If both args provided via CLI flags, skip interactive
  if (typeArg && messageArg) {
    const validTypes = ["decision", "gotcha", "done", "next", "blocked"];
    if (!validTypes.includes(typeArg)) {
      logger.error(`Invalid type "${typeArg}". Must be one of: ${validTypes.join(", ")}`);
      process.exit(1);
    }
    try {
      appendLogEntry(cwd, { type: typeArg as LogEntry["type"], message: messageArg });
      logger.success(`Logged ${typeArg}: "${messageArg}"`);
      logger.dim(`→ .agent/context/${typeArg === "decision" ? "DECISIONS" : typeArg === "gotcha" ? "GOTCHAS" : "PROJECT_STATE"}.md`);
    } catch (err: any) {
      logger.error(err.message ?? String(err));
      process.exit(1);
    }
    return;
  }

  // Interactive mode
  p.intro(chalk.bold.cyan("  Log a context update "));

  const type = await p.select({
    message: "What do you want to log?",
    options: [
      { value: "decision" as LogEntry["type"], label: "📐 Architecture Decision",  hint: "→ DECISIONS.md" },
      { value: "gotcha"   as LogEntry["type"], label: "⚠️  Gotcha / Lesson Learned", hint: "→ GOTCHAS.md" },
      { value: "done"     as LogEntry["type"], label: "✅ Feature / Task Completed", hint: "→ PROJECT_STATE.md" },
      { value: "next"     as LogEntry["type"], label: "📋 Add to Backlog",           hint: "→ PROJECT_STATE.md" },
      { value: "blocked"  as LogEntry["type"], label: "🔴 Mark as Blocked",          hint: "→ PROJECT_STATE.md" },
    ],
  });
  if (p.isCancel(type)) { p.cancel("Cancelled."); return; }

  const prompts: Record<LogEntry["type"], string> = {
    decision: "Describe the decision (e.g. chose Stripe over PayPal because better SDK):",
    gotcha:   "Describe the gotcha (e.g. Prisma doesn't work in Vercel Edge runtime):",
    done:     "What was completed? (e.g. authentication module):",
    next:     "What should be built next? (e.g. search functionality):",
    blocked:  "What is blocked and why? (e.g. waiting for API keys from DevOps):",
  };

  const message = await p.text({
    message: prompts[type as LogEntry["type"]],
    validate: (v) => (!v.trim() ? "Cannot be empty" : undefined),
  });
  if (p.isCancel(message)) { p.cancel("Cancelled."); return; }

  try {
    appendLogEntry(cwd, { type: type as LogEntry["type"], message: String(message) });
  } catch (err: any) {
    logger.error(err.message ?? String(err));
    process.exit(1);
  }

  const fileHint: Record<LogEntry["type"], string> = {
    decision: "DECISIONS.md",
    gotcha:   "GOTCHAS.md",
    done:     "PROJECT_STATE.md",
    next:     "PROJECT_STATE.md",
    blocked:  "PROJECT_STATE.md",
  };

  p.outro(`${IC.pass} Logged to .agent/context/${fileHint[type as LogEntry["type"]]}`);
}

// ─── status ───────────────────────────────────────────────────────────────────

export async function contextStatusCommand(cwd: string): Promise<void> {
  const cyanPink = gradient(["#00DBDE", "#FC00FF"]);

  logger.blank();
  process.stdout.write(
    cyanPink.multiline(`  Nexus Context Status\n  ${"─".repeat(22)}\n`)
  );

  const status = await getContextStatus(cwd);

  logger.blank();

  // ── Profile ───────────────────────────────────────────────────────────────
  logger.section("Developer Profile (~/.agstudio/profile.md)");
  if (status.profileExists) {
    logger.success(`Found: ${chalk.dim(status.profilePath)}`);
    if (!status.profileSynced) {
      logger.warn("Profile has changed since last sync — run `studio context sync`");
    } else {
      logger.dim("Profile is in sync with .agent/context/DEVELOPER.md");
    }
  } else {
    logger.warn("No profile found.");
    logger.info(`Run ${chalk.cyan("studio profile create")} to set up your Developer DNA profile.`);
  }

  // ── Context files ─────────────────────────────────────────────────────────
  logger.blank();
  logger.section("Project Context (.agent/context/)");

  if (!status.contextDirExists) {
    logger.warn(".agent/context/ does not exist.");
    logger.info(`Run ${chalk.cyan("studio context init")} to initialise.`);
    return;
  }

  for (const file of status.files) {
    if (file.exists) {
      const modified = file.lastModified ? chalk.dim(` — last modified: ${file.lastModified}`) : "";
      logger.success(`${file.name}${modified}`);
    } else {
      logger.warn(`${file.name} ${chalk.dim("(missing — run studio context init --force)")}`);
    }
  }

  // ── Quick tips ────────────────────────────────────────────────────────────
  logger.blank();
  logger.section("Quick Commands");
  logger.dim("studio context log              → Log a decision, gotcha, or progress update");
  logger.dim("studio context sync             → Re-inject profile + refresh skills index");
  logger.dim("studio context init --force     → Recreate all context files");
  logger.blank();
}
