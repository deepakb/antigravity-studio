# Contributing to Nexus Studio

Thank you for making Nexus Studio better for the whole community! 🚀

This guide explains how to contribute a new **agent**, **skill**, or **workflow** to the shared template library. Once merged, every developer running `studio update` will receive your contribution automatically.

---

## Quick Start — The Easy Way

The CLI does most of the work for you:

```bash
# 1. Create a new template locally
studio create skill my-skill-name

# 2. Edit the generated file in .agstudio/templates/skills/my-skill-name.md

# 3. When ready, the CLI will guide you through the PR process
studio contribute skill my-skill-name
```

The `studio contribute` command validates your template, generates the correct registry entry, and prints exact git commands ready to copy-paste.

---

## Manual Contribution — Step by Step

### Step 1 — Fork & Clone

```bash
git clone https://github.com/deepakbiswal/nexus-studio.git
cd nexus-studio
npm install
```

### Step 2 — Create Your Template File

#### For a Skill
Create a new directory and `SKILL.md` file:
```
packages/templates/.agent/skills/<your-skill-id>/SKILL.md
```

Required frontmatter:
```yaml
---
name: Your Skill Name
description: "One sentence describing what this skill teaches the AI."
category: Frontend & UI   # See categories below
tokenBudget: 450          # Rough token count of the file (run: wc -w SKILL.md × 1.3)
contributed: true
author: Your Name / Team Name
---
```

#### For an Agent
Create a new `.md` file:
```
packages/templates/.agent/agents/<your-agent-id>.md
```

Required frontmatter:
```yaml
---
name: your-agent-id
description: "What this agent specialises in and when it activates."
activation: "keywords that trigger auto-routing to this agent"
contributed: true
---
```

#### For a Workflow
Create a new `.md` file:
```
packages/templates/.agent/workflows/<your-workflow-id>.md
```

Required frontmatter:
```yaml
---
name: Your Workflow Name
description: "What this workflow does and when to invoke it."
contributed: true
---
```

### Step 3 — Register Your Template

Add an entry to `packages/templates/registry.json`:

**Skill entry:**
```json
{
  "id": "your-skill-id",
  "name": "Your Skill Name",
  "category": "Quality (QA)",
  "tokenBudget": 450,
  "contributed": true
}
```

**Agent entry:**
```json
{
  "id": "your-agent-id",
  "name": "Your Agent Name",
  "category": "Architecture & Leadership",
  "contributed": true
}
```

### Step 4 — Branch, Commit, and Push

```bash
git checkout -b feat/contribute-skill-your-skill-id

git add packages/templates/
git commit -m "feat(skill): add your-skill-id"

git push origin feat/contribute-skill-your-skill-id
```

### Step 5 — Open a Pull Request

Go to: https://github.com/deepakbiswal/nexus-studio/compare

Use the provided PR template and fill in all sections.

---

## Template Quality Guidelines

### Skills
- **Minimum 400 characters** of body content
- Include at least one **code example**
- Include **anti-patterns to avoid** section
- Include a **checklist** section
- Keep `tokenBudget` accurate (estimate: word count × 1.3)

### Agents
- Define a clear **activation condition** (keywords, complexity score)
- Define **when NOT to activate** (prevents agent conflicts)
- Include **output format** expectations
- Reference relevant skills if known

### Workflows
- Define a clear **trigger condition**
- List all **steps** explicitly
- Define **success criteria** (what does "done" look like?)
- Include **rollback / undo** instructions for destructive workflows

---

## Skill Categories

Use one of these exact strings for the `category` field:

| Category | Description |
|----------|-------------|
| `Architecture` | System design, DDD, monorepo |
| `Frontend & UI` | React, Angular, Vue, CSS, animations |
| `Backend & API` | Node.js, REST, GraphQL, databases |
| `Security & Auth` | OWASP, OAuth, JWT, pen testing |
| `Quality (QA)` | Testing, coverage, E2E, TDD |
| `AI & Engineering` | LLMs, RAG, embeddings, prompt engineering |
| `DevOps & Cloud` | CI/CD, Docker, AWS/GCP/Azure, deployment |
| `Mobile` | React Native, Expo, Flutter |
| `UX/UI Design` | Accessibility, design systems, UX patterns |
| `Performance` | Web vitals, bundle analysis, profiling |
| `Marketing & SEO` | SEO, Lighthouse, structured data |

---

## Review Process

| Contribution type | Reviewer | Turnaround |
|------------------|----------|-----------|
| New skill | 1 senior dev | ~2 days |
| New agent | Deepak Biswal | ~1 week |
| New workflow | 1 senior dev + QA | ~3 days |
| Bug fix to existing | Automated CI | Same day |

---

## Questions?

Open an issue: https://github.com/deepakbiswal/nexus-studio/issues
