/**
 * `studio profile` — Developer DNA profile management
 *
 * Subcommands:
 *   studio profile create   Interactive wizard → creates ~/.agstudio/profile.md
 *   studio profile show     Pretty-print current profile
 *   studio profile edit     Open profile in $EDITOR / notepad
 *   studio profile path     Print the profile file path
 */

import * as p from "@clack/prompts";
import chalk from "chalk";
import gradient from "gradient-string";
import { execSync } from "child_process";
import { logger } from "../ui/logger.js";
import { IC } from "../ui/icons.js";
import {
  profileExists,
  getProfilePath,
  readProfileRaw,
  writeProfile,
  renderProfile,
  AGSTUDIO_GLOBAL_DIR,
  type DeveloperProfile,
  type DeveloperSkill,
} from "../core/profile-manager.js";

// ─── Skill category definitions (mirrors registry categories) ─────────────────

const SKILL_CATEGORIES = [
  {
    label: "Architecture & Leadership",
    skills: ["System Design", "DDD / Clean Architecture", "Tech Leadership", "API Design"],
  },
  {
    label: "Frontend (Web)",
    skills: ["React", "Next.js", "TypeScript", "CSS / TailwindCSS", "Performance Optimization"],
  },
  {
    label: "Backend & API",
    skills: ["Node.js", "REST APIs", "GraphQL", "Database Design", "Prisma / ORMs"],
  },
  {
    label: "Security",
    skills: ["Auth / OAuth / JWT", "OWASP / Security", "Penetration Testing"],
  },
  {
    label: "DevOps & Cloud",
    skills: ["CI/CD Pipelines", "Docker / Kubernetes", "AWS / GCP / Azure"],
  },
  {
    label: "AI & Engineering",
    skills: ["LLM / AI Integration", "RAG / Embeddings", "Prompt Engineering"],
  },
  {
    label: "Quality (QA)",
    skills: ["Unit Testing (Vitest/Jest)", "E2E Testing (Playwright)", "TDD"],
  },
  {
    label: "Mobile",
    skills: ["React Native / Expo"],
  },
] as const;

const LEVEL_HINTS: Record<number, string> = {
  1: "Just starting",
  2: "Beginner",
  3: "Some experience",
  4: "Getting comfortable",
  5: "Proficient",
  6: "Solid knowledge",
  7: "Advanced",
  8: "Expert (AI skips basics)",
  9: "Deep expert",
  10: "Architect level",
};

// ─── Main command handler ─────────────────────────────────────────────────────

export async function profileCreateCommand(): Promise<void> {
  const cyanPink = gradient(["#00DBDE", "#FC00FF"]);

  logger.blank();
  process.stdout.write(
    cyanPink.multiline(`  Nexus Studio — Developer Profile Setup\n  ${"─".repeat(42)}\n`)
  );
  logger.blank();

  p.intro(chalk.bold.cyan("  Let's build your Developer DNA Profile "));

  p.log.message(
    chalk.dim(
      "This profile is stored globally at ~/.agstudio/profile.md\n" +
      "It will be injected into every project so the AI knows who you are."
    )
  );

  // ── Identity ──────────────────────────────────────────────────────────────
  const name = await p.text({
    message: "Your full name:",
    placeholder: "e.g. Deepak Biswal",
    validate: (v) => (!v.trim() ? "Name is required" : undefined),
  });
  if (p.isCancel(name)) { p.cancel("Cancelled."); return; }

  const role = await p.text({
    message: "Your role / title:",
    placeholder: "e.g. AI Software Architect",
    validate: (v) => (!v.trim() ? "Role is required" : undefined),
  });
  if (p.isCancel(role)) { p.cancel("Cancelled."); return; }

  const company = await p.text({
    message: "Your company / organisation:",
    placeholder: "e.g. EPAM Systems",
    defaultValue: "",
  });
  if (p.isCancel(company)) { p.cancel("Cancelled."); return; }

  // ── Communication style ───────────────────────────────────────────────────
  const verbosity = await p.select({
    message: "Preferred AI response verbosity:",
    options: [
      { value: "concise",  label: "Concise",  hint: "Short and direct — code first, minimal prose" },
      { value: "standard", label: "Standard", hint: "Balanced — code with clear explanations" },
      { value: "detailed", label: "Detailed", hint: "Full explanations — teach me the why too" },
    ],
    initialValue: "concise",
  });
  if (p.isCancel(verbosity)) { p.cancel("Cancelled."); return; }

  const codeFirst = await p.confirm({
    message: "Show code first, then explain? (No = explain approach first)",
    initialValue: true,
  });
  if (p.isCancel(codeFirst)) { p.cancel("Cancelled."); return; }

  // ── Skills ────────────────────────────────────────────────────────────────
  p.log.step("Now let's rate your skill levels (1=beginner, 10=architect level)");
  p.log.message(
    chalk.dim("The AI will skip basic explanations for skills rated 8+\n" +
    "and add extra context for skills rated 4 or below.")
  );

  const skills: DeveloperSkill[] = [];

  for (const category of SKILL_CATEGORIES) {
    p.log.message(chalk.bold.cyan(`\n  ${category.label}`));

    for (const skillName of category.skills) {
      const levelStr = await p.select({
        message: `  ${skillName}:`,
        options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({
          value: String(n),
          label: `${n}  — ${LEVEL_HINTS[n]}`,
        })),
        initialValue: "5",
      });
      if (p.isCancel(levelStr)) { p.cancel("Cancelled."); return; }

      skills.push({
        name: skillName,
        level: parseInt(String(levelStr), 10),
        category: category.label,
      });
    }
  }

  // ── Learning focus ────────────────────────────────────────────────────────
  const learningRaw = await p.text({
    message: "What are you actively learning? (comma-separated, or leave blank):",
    placeholder: "e.g. Rust, WebAssembly, Kubernetes",
    defaultValue: "",
  });
  if (p.isCancel(learningRaw)) { p.cancel("Cancelled."); return; }

  const learningFocus = String(learningRaw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // ── Preferred patterns ────────────────────────────────────────────────────
  const patternsRaw = await p.text({
    message: "Preferred coding patterns (comma-separated, or leave blank):",
    placeholder: "e.g. Functional over OOP, Composition over inheritance, TDD",
    defaultValue: "",
  });
  if (p.isCancel(patternsRaw)) { p.cancel("Cancelled."); return; }

  const preferredPatterns = String(patternsRaw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // ── Build and write profile ───────────────────────────────────────────────
  const now = new Date().toISOString().split("T")[0]!;

  const profile: DeveloperProfile = {
    name: String(name),
    role: String(role),
    company: String(company) || "—",
    skills,
    verbosity: verbosity as DeveloperProfile["verbosity"],
    codeFirst: Boolean(codeFirst),
    preferredPatterns,
    learningFocus,
    createdAt: now,
    updatedAt: now,
  };

  const rendered = renderProfile(profile);
  writeProfile(rendered);

  p.outro(`${IC.pass} Profile saved to ${chalk.bold(getProfilePath())}`);

  logger.blank();
  logger.info(`Next step: run ${chalk.cyan("studio context init")} in your project to inject this profile.`);
  logger.blank();
}

// ─── show ─────────────────────────────────────────────────────────────────────

export async function profileShowCommand(): Promise<void> {
  if (!profileExists()) {
    logger.warn("No developer profile found.");
    logger.info(`Run ${chalk.cyan("studio profile create")} to set up your profile.`);
    logger.dim(`Expected location: ${getProfilePath()}`);
    process.exit(1);
  }

  const content = readProfileRaw()!;
  const cyanPink = gradient(["#00DBDE", "#FC00FF"]);

  logger.blank();
  process.stdout.write(
    cyanPink.multiline(`  Developer Profile — ${getProfilePath()}\n  ${"─".repeat(55)}\n\n`)
  );
  console.log(content);
}

// ─── edit ─────────────────────────────────────────────────────────────────────

export async function profileEditCommand(): Promise<void> {
  if (!profileExists()) {
    logger.warn("No developer profile found.");
    logger.info(`Run ${chalk.cyan("studio profile create")} first to create your profile.`);
    process.exit(1);
  }

  const profilePath = getProfilePath();
  const editor =
    process.env["EDITOR"] ||
    process.env["VISUAL"] ||
    (process.platform === "win32" ? "notepad" : "nano");

  logger.info(`Opening ${chalk.cyan(profilePath)} in ${chalk.bold(editor)}…`);
  logger.dim("After saving, run `studio context sync` to push changes to your active project.");

  try {
    execSync(`${editor} "${profilePath}"`, { stdio: "inherit" });
    logger.success("Profile saved.");
    logger.info(`Run ${chalk.cyan("studio context sync")} to apply changes to your current project.`);
  } catch {
    // Editor may have exited non-zero (e.g. vim quit without saving) — not an error
    logger.dim("Editor closed.");
  }
}

// ─── path ─────────────────────────────────────────────────────────────────────

export async function profilePathCommand(): Promise<void> {
  console.log(getProfilePath());
}
