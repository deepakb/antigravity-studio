/**
 * `studio create <type> <id>`
 *
 * Scaffolds a custom agent or skill template in `.agstudio/templates/`.
 * These local templates override bundled ones when running `studio add`.
 *
 * Usage:
 *   studio create agent my-custom-agent
 *   studio create skill my-domain-skill
 */

import * as p from "@clack/prompts";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import gradient from "gradient-string";
import { logger } from "../ui/logger.js";
import { detectProject } from "../core/project-detector.js";

const VALID_TYPES = ["agent", "skill", "workflow"] as const;
type CreateType = typeof VALID_TYPES[number];

const LOCAL_TEMPLATES_DIR = ".agstudio/templates";

export async function createCommand(type: string, id: string, cwd: string): Promise<void> {
  if (!VALID_TYPES.includes(type as CreateType)) {
    logger.error(`Invalid type "${type}". Must be one of: ${VALID_TYPES.join(", ")}`);
    process.exit(1);
  }

  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    logger.error(
      `Invalid id "${id}". IDs must only contain lowercase letters, digits, and hyphens.`
    );
    process.exit(1);
  }

  const cyanPink = gradient(["#00DBDE", "#FC00FF"]);
  const projectInfo = detectProject(cwd);

  logger.blank();
  process.stdout.write(cyanPink.multiline(`  Nexus Create — ${type}: ${id}\n  ${"─".repeat(38)}\n`));

  // ── Prompt for display name ───────────────────────────────────────────────
  const displayName = await p.text({
    message: "Display name for this template:",
    defaultValue: id.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    placeholder: "My Custom Template",
  });
  if (p.isCancel(displayName)) { logger.info("Cancelled."); return; }

  // ── Prompt for description ────────────────────────────────────────────────
  const description = await p.text({
    message: "Short description (shown in studio list):",
    defaultValue: `Custom ${type} for ${projectInfo.name}`,
    placeholder: "Describe what this template does…",
  });
  if (p.isCancel(description)) { logger.info("Cancelled."); return; }

  // ── Build template content ────────────────────────────────────────────────
  const categoryDir = path.join(cwd, LOCAL_TEMPLATES_DIR, `${type}s`);
  const templatePath = path.join(categoryDir, `${id}.md`);

  if (fs.existsSync(templatePath)) {
    const overwrite = await p.confirm({
      message: `Template ${chalk.cyan(templatePath)} already exists. Overwrite?`,
      initialValue: false,
    });
    if (p.isCancel(overwrite) || !overwrite) { logger.info("Cancelled."); return; }
  }

  const content = _scaffold(type as CreateType, id, String(displayName), String(description), projectInfo.name);

  await fs.ensureDir(categoryDir);
  await fs.writeFile(templatePath, content, "utf8");

  // ── Update (or create) local registry ────────────────────────────────────
  const localRegistryPath = path.join(cwd, LOCAL_TEMPLATES_DIR, "registry.json");
  let localRegistry: Record<string, any[]> = { agents: [], skills: [], workflows: [] };

  if (fs.existsSync(localRegistryPath)) {
    try {
      localRegistry = await fs.readJson(localRegistryPath);
    } catch { /* start fresh */ }
  }

  const categoryKey = `${type}s`;
  if (!Array.isArray(localRegistry[categoryKey])) localRegistry[categoryKey] = [];

  const existing = (localRegistry[categoryKey] as any[]).findIndex((e: any) => e.id === id);
  const entry = { id, name: String(displayName), category: "Custom", description: String(description) };
  if (existing >= 0) {
    (localRegistry[categoryKey] as any[])[existing] = entry;
  } else {
    (localRegistry[categoryKey] as any[]).push(entry);
  }

  await fs.ensureDir(path.join(cwd, LOCAL_TEMPLATES_DIR));
  await fs.writeJson(localRegistryPath, localRegistry, { spaces: 2 });

  logger.blank();
  logger.success(`Created ${type} template: ${chalk.cyan(path.relative(cwd, templatePath))}`);
  logger.success(`Updated local registry:    ${chalk.cyan(path.relative(cwd, localRegistryPath))}`);
  logger.blank();
  logger.box(
    `${chalk.bold.white("Custom template ready!")}\n\n` +
    `  Edit your template at:\n` +
    `  ${chalk.cyan(path.relative(cwd, templatePath))}\n\n` +
    `  ${chalk.dim("• Install:")}\n` +
    `    ${chalk.cyan(`studio add ${type} ${id}`)}\n\n` +
    `  ${chalk.dim("Tip:")} Commit ${chalk.dim(LOCAL_TEMPLATES_DIR + "/")} to share\n` +
    `  custom templates across your team.`,
    { borderColor: "cyan", padding: 1, margin: { top: 1, bottom: 1 } }
  );

  // ── Contribute nudge ────────────────────────────────────────────────────────
  logger.blank();
  const wantToContribute = await p.confirm({
    message: `${chalk.bold("Want to share this with the EPAM community?")} Contribute it to Nexus Studio.`,
    initialValue: false,
  });

  if (!p.isCancel(wantToContribute) && wantToContribute) {
    const { contributeCommand } = await import("./contribute.js");
    await contributeCommand(type, id, cwd);
  } else if (!p.isCancel(wantToContribute)) {
    logger.dim(`Run ${chalk.cyan(`studio contribute ${type} ${id}`)} anytime to submit it later.`);
  }
}

// ── Template scaffold builders ────────────────────────────────────────────────

function _scaffold(
  type: CreateType,
  id: string,
  name: string,
  description: string,
  projectName: string
): string {
  const date = new Date().toISOString().split("T")[0];

  if (type === "agent") {
    return `---
name: ${name}
id: ${id}
description: ${description}
project: ${projectName}
created: ${date}
---

# ${name}

## Role

<!-- Define what this agent specialises in -->
You are a ${name} working on the **${projectName}** project.

## Core Responsibilities

- <!-- Add primary responsibility #1 -->
- <!-- Add primary responsibility #2 -->
- <!-- Add primary responsibility #3 -->

## Expertise

<!-- List the technologies, patterns, or domains this agent is expert in -->
- 

## Behaviour Guidelines

<!-- Define how this agent should behave, respond, and reason -->
- Always follow the project's coding standards
- Provide concise, actionable responses
- Cite relevant files and line numbers when discussing code

## Output Format

Responses should be:
- **Structured** — use headings and bullets for complex answers
- **Concise** — prefer code over prose when possible
- **Actionable** — every answer should have a clear next step
`;
  }

  if (type === "skill") {
    return `---
name: ${name}
id: ${id}
category: Custom
description: ${description}
project: ${projectName}
created: ${date}
tokenBudget: 400
---

# ${name}

## Overview

<!-- Describe this skill and when to apply it -->

## Core Principles

1. <!-- Principle 1 -->
2. <!-- Principle 2 -->
3. <!-- Principle 3 -->

## Implementation Patterns

### Pattern 1 — <!-- Name -->

\`\`\`typescript
// Example code
\`\`\`

**When to use:** <!-- describe the scenario -->

## Anti-patterns to Avoid

- ❌ <!-- What NOT to do -->

## Checklist

- [ ] <!-- Verification step 1 -->
- [ ] <!-- Verification step 2 -->
`;
  }

  // workflow
  return `---
name: ${name}
id: ${id}
description: ${description}
project: ${projectName}
created: ${date}
---

# ${name} Workflow

## Trigger

<!-- When should this workflow be activated? -->

## Steps

1. **Step 1** — <!-- Description -->
2. **Step 2** — <!-- Description -->
3. **Step 3** — <!-- Description -->

## Success Criteria

- [ ] <!-- What does "done" look like? -->

## Rollback / Undo

<!-- How to reverse this workflow if something goes wrong -->
`;
}
