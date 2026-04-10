# ⚡ Nexus Studio

> **Enterprise AI Agent Orchestration CLI** — Deploy specialist AI agents, enforce coding standards, and run automated quality gates across any technology stack.

[![npm version](https://img.shields.io/npm/v/@nexus/studio.svg)](https://www.npmjs.com/package/@nexus/studio)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org)
[![Tests](https://img.shields.io/badge/tests-43%20passed-brightgreen)](#testing)

---

## What Is Nexus Studio?

Nexus Studio is a polyglot enterprise CLI that installs a **local AI agent system** (`.agent/`) into any project. It gives every developer on your team the same specialist AI agents, skill libraries, and automated quality gates — regardless of IDE, framework, or language.

```
                         ┌─────────────────────────────────┐
                         │         Nexus Studio CLI         │
                         │    npx @nexus/studio init        │
                         └──────────────┬──────────────────┘
                                        │  detects + installs
                         ┌──────────────▼──────────────────┐
                         │          .agent/  (local)        │
                         │  agents/ · skills/ · workflows/  │
                         │  scripts/ · mcp/                 │
                         └──┬─────────┬──────┬──────┬──────┘
                            │         │      │      │
                   ┌────────▼─┐ ┌─────▼──┐ ┌▼────┐ ┌▼──────────┐
                   │  Cursor  │ │Windsurf│ │Copil│ │Claude Code│
                   │  .mdc    │ │.rules  │ │ot   │ │CLAUDE.md  │
                   └──────────┘ └────────┘ └─────┘ └───────────┘
```

---

## 📊 Registry at a Glance

| | Count |
|---|---|
| 🤖 Specialist Agents | **29** across 8 domains |
| 🧠 Expert Skills | **51** across 13 categories |
| 🗂️ Architectural Profiles | **15** + Custom |
| ✅ Quality Gates | **12** (3 enforcement tiers) |
| ⚡ Slash Commands | **15** |
| 🌐 Polyglot Stacks | **5** (Node · Python · Java · .NET · Flutter) |
| 🖥️ IDE Integrations | **4** (Cursor · Windsurf · Copilot · Claude) |

---

## 🚀 Quick Start

```bash
# Run once in any project — no global install needed
npx @nexus/studio init

# Or install globally
npm install -g @nexus/studio
studio init
```

The `init` wizard will:
1. **Auto-detect** your framework (Next.js, Python/FastAPI, Java/Spring, etc.)
2. **Suggest a profile** with the right agent + skill set
3. **Install `.agent/`** — your local AI knowledge base
4. **Generate IDE config** — Cursor rules, Copilot instructions, Claude agents, etc.
5. **Wire Git exclusions** — `.agent/` stays local, never committed

---

## 🏛️ Architecture

Nexus Studio is built on a **three-layer decoupled architecture**:

### Layer 1 — The CLI Orchestrator (`studio`)
A lightweight TypeScript CLI (`@nexus/studio`) that handles detection, installation, drift management, and quality gate execution. It never prescribes implementation details — it only wires the agent system into your project.

### Layer 2 — The Agent System (`.agent/`)
A project-local directory that is the **single source of truth** for all AI behaviour. It is IDE-agnostic and survives IDE changes. Each IDE generator reads from `.agent/` and produces its own config format.

```
.agent/
├── AGENT_SYSTEM.md      # Master system prompt & operating directives
├── AGENTS.md            # Agent routing index & coalition patterns
├── AGENT_FLOW.md        # 5-stage execution pipeline definition
├── ARCHITECTURE.md      # Project architecture reference
├── agents/              # 29 specialist agent personas (.md)
├── skills/              # 51 expert skill libraries (.md)
├── workflows/           # 15 slash command procedures (.md)
├── scripts/             # 12 quality gate shell runners (.sh per stack)
└── mcp/                 # MCP server configuration
```

### Layer 3 — The Registry (`registry.json`)
A version-controlled manifest that defines all agents, skills, profiles, and slash commands. The `sync` and `update` commands use SHA-256 hash drift detection to identify when upstream templates have changed.

---

## 📦 Supported Stacks & Profiles

Nexus Studio auto-detects your project and maps it to the most appropriate profile:

| Profile ID | Description | Stack Runner |
|---|---|---|
| `nextjs-fullstack` ⭐ | Next.js + Backend + DB | Node |
| `nextjs-frontend` | React/Next.js — UI only | Node |
| `react-vite` | React + Vite SPA | Node |
| `angular-enterprise` | Angular with RxJS/NgRx | Node |
| `vue-nuxt` | Full-stack Vue with Nuxt | Node |
| `vue-vite` | Client-side Vue SPA | Node |
| `expo-mobile` | React Native / Expo | Node |
| `node-api` | Node.js REST/GraphQL API | Node |
| `monorepo-root` | Turborepo / Nx workspace root | Node |
| `monorepo-package` | Sub-package within a monorepo | Node |
| `python-fastapi` | Async Python REST API | Python |
| `python-django` | Full-stack Django application | Python |
| `java-spring` | Enterprise Java / Spring Boot | Java |
| `dotnet-api` | .NET / ASP.NET Core API | .NET |
| `flutter-mobile` | Cross-platform Flutter app | Flutter |
| `custom` | Hand-pick individual agents + skills | Any |

---

## 🤖 Specialist Agents (29)

Agents are expert personas that the AI activates automatically based on request context. They are routed via the `AGENTS.md` auto-routing table — no manual `@mention` required.

### 🏛️ Architecture & Leadership (6)
`enterprise-architect` · `tech-lead` · `orchestrator` · `product-manager` · `project-planner` · `cloud-architect`

### 🌐 Frontend — Web (4)
`nextjs-expert` · `react-performance-guru` · `frontend-specialist` · `ui-component-architect`

### 🎨 UX / UI Design (3)
`ux-designer` · `ui-design-engineer` · `accessibility-auditor`

### ⚙️ Backend & API (4)
`backend-specialist` · `api-architect` · `database-engineer` · `data-layer-specialist`

### 🛡️ Security (2)
`security-engineer` · `penetration-tester`

### 📱 Mobile (3)
`rn-architect` · `rn-performance-expert` · `mobile-ux-designer`

### ✅ Quality & Ops (4)
`qa-engineer` · `devops-engineer` · `debugger` · `seo-specialist`

### 🤖 AI & Innovation (3)
`ai-engineer` · `prompt-engineer` · `llm-security-officer`

> **LLM Safety Rule**: Any request touching AI/LLM features **always** auto-activates `@llm-security-officer` as a silent co-reviewer — no exceptions.

---

## 🧠 Expert Skills (51)

Skills are domain-specific coding guidelines injected into the agent's context. Each skill has a token budget to keep context lean.

| Category | Skills |
|---|---|
| **Architecture** | `clean-architecture` · `solid-principles` · `monorepo-turborepo` |
| **Frontend & UI** | `nextjs-app-router` · `react-patterns` · `shadcn-radix-ui` · `tailwind-design-system` · `angular-patterns` · `rxjs-patterns` · `vue-patterns` · `form-handling` · `framer-motion` · `dark-mode-theming` · `i18n-localization` · `state-management` · `accessibility-wcag` |
| **Backend & API** | `api-design-restful` · `prisma-orm` · `realtime-patterns` · `node-express-testing` · `python-fastapi-patterns` · `python-django-patterns` · `java-spring-patterns` · `dotnet-patterns` |
| **Mobile** | `expo-router-navigation` · `flutter-patterns` |
| **Security & Auth** | `owasp-top10` · `auth-nextauth` · `input-validation-sanitization` |
| **DevOps & Cloud** | `github-actions-ci-cd` · `docker-containerization` · `vercel-deployment` · `aws-deployment` · `azure-deployment` · `gcp-deployment` |
| **Performance** | `react-performance` · `caching-strategies` · `performance-testing` |
| **Quality (QA)** | `vitest-unit-tests` · `playwright-e2e` · `react-testing-library` · `tdd-workflow` · `python-testing` |
| **AI & Engineering** | `openai-sdk` · `anthropic-claude-sdk` · `google-gemini-sdk` · `vercel-ai-sdk` · `langchain-typescript` · `rag-implementation` |
| **Marketing & SEO** | `seo-core-web-vitals` |
| **UX/UI Design** | `ux-fundamentals` |

---

## ✅ Quality Gates (12)

The `studio validate` and `studio run` commands execute shell-based quality gates against your project. Gates are tiered by enforcement level:

### Tier 1 — Hard Block (CI fails if these fail)
| Gate | Purpose |
|---|---|
| `security-scan` | OWASP vulnerability patterns, secrets detection |
| `ts-check` | TypeScript strict compilation — zero errors |
| `env-validator` | `.env` schema validation — required keys present |

### Tier 2 — Auto-Fix (applied automatically with `--fix`)
| Gate | Purpose |
|---|---|
| `dependency-audit` | `npm audit` — patches non-breaking vulnerabilities |
| `license-audit` | Detects GPL/AGPL licences in production dependencies |

### Tier 3 — Advisory (warnings, does not block CI)
| Gate | Purpose |
|---|---|
| `accessibility-audit` | WCAG 2.1 AA automated scan |
| `bundle-analyzer` | Bundle size vs. budget thresholds |
| `performance-budget` | Core Web Vitals — LCP, CLS, FID |
| `seo-linter` | Missing meta tags, Open Graph, JSON-LD |
| `i18n-linter` | Hardcoded strings not passed through i18n |
| `type-coverage` | TypeScript coverage threshold (default 90%) |
| `verify-all` | Runs all tiers in sequence |

Each gate ships as `scripts/<gate>/<stack>.sh`, where `<stack>` is one of: `node` · `python` · `java` · `dotnet` · `flutter`.

---

## ⚡ Slash Commands (15)

Workflows are step-by-step AI procedures triggered by slash commands in your IDE:

| Command | Purpose |
|---|---|
| `/blueprint` | Architecture doc for complex features — **required** before 3+ domain changes |
| `/create` | Full feature scaffold (types → service → API → UI → tests) |
| `/enhance` | Improve existing code quality, patterns, and performance |
| `/debug` | Systematic root-cause analysis and fix |
| `/audit-security` | Full OWASP security review of selected code |
| `/refactor-solid` | Apply SOLID principles + Clean Architecture patterns |
| `/generate-tests` | Unit + integration test suite generation |
| `/generate-e2e` | Playwright end-to-end test generation |
| `/deploy` | CI/CD pipeline and deployment configuration |
| `/perf-audit` | React/Node performance profiling and optimisation |
| `/a11y-audit` | Accessibility (WCAG 2.1 AA) compliance review |
| `/document` | JSDoc, API docs, and README generation |
| `/orchestrate` | Multi-agent coordination for epic-scale features |
| `/preview` | Visual component and flow preview |
| `/status` | Report installed agents, skills, and compliance posture |

---

## 💻 CLI Reference

### `studio init`
Initialize the Nexus agent system in your project.

```bash
studio init
studio init --force          # Overwrite existing .agent/ files
studio init --path ./my-app  # Target a specific directory
studio init --quiet          # Suppress banner (for scripted use)
```

### `studio status`
Display installed agents, skills, workflows, scripts, and enterprise compliance posture.

```bash
studio status
```

### `studio list`
Browse the full registry: profiles, agents, skills, and slash commands.

```bash
studio list
```

### `studio doctor`
Health check: Node.js version, `.agstudio.json` validity, `.agent/` structure, Git exclusions, company config, and registry integrity.

```bash
studio doctor
```

### `studio validate`
Run quality gate scripts against your project.

```bash
studio validate
studio validate --fix         # Auto-fix linting/format issues
studio validate --skip-e2e    # Skip Playwright tests (faster CI)
studio validate --all         # Scan all monorepo packages (requires turbo)
```

### `studio run <gate>`
Run a single quality gate by name.

```bash
studio run security-scan
studio run dependency-audit --fix
studio run ts-check --stack node
studio run verify-all --dry-run
studio run --list             # Show all available gates
```

### `studio add <type> <id>`
Add an individual agent, skill, workflow, or script to an already-initialised project.

```bash
studio add agent  cloud-architect
studio add skill  owasp-top10
studio add workflow blueprint
```

### `studio remove <type> <id>`
Remove an installed component and update `.agstudio.json`.

```bash
studio remove agent  seo-specialist
studio remove skill  framer-motion
```

### `studio update`
Compare installed template hashes against the upstream registry and update outdated files.

```bash
studio update
studio update --dry-run       # Preview what would change
studio update --force         # Overwrite including customised files
```

### `studio sync`
Detect drift between installed files and the registry. Also enforces company skill policy.

```bash
studio sync                   # Interactive: show drift, choose what to pull
studio sync --check           # CI mode — exit 1 if any drift detected
studio sync --force           # Pull all updates without prompting
```

### `studio company init <name>`
Scaffold a `.agstudio.company.json` to define org-wide required skills, forbidden patterns, and default IDE configs.

```bash
studio company init "ACME Corp"
```

### `studio company validate`
Validate a `.agstudio.company.json` against the schema.

```bash
studio company validate
```

---

## 🏢 Enterprise Configuration

For organisations deploying Nexus Studio across multiple teams, create a `.agstudio.company.json`:

```json
{
  "companyName": "ACME Corp",
  "version": "1.0.0",
  "requiredSkills": ["owasp-top10", "clean-architecture", "solid-principles"],
  "forbiddenSkills": [],
  "defaultIdes": ["copilot"],
  "codingStandardsUrl": "https://wiki.acme.com/engineering-standards",
  "registryUrl": "https://registry.acme.com/nexus"
}
```

**How it works:**
- Place in project root (per-repo) or `~/.agstudio.company.json` (machine-wide via IT provisioning)
- `studio init` automatically detects it and injects required skills, removes forbidden ones
- `studio sync` enforces the policy on every drift check
- `studio status` shows a compliance percentage bar

---

## 🖥️ IDE Integration

When you run `studio init`, Nexus generates IDE-specific config files that bridge your IDE's AI assistant to the `.agent/` system:

| IDE | Files Generated |
|---|---|
| **GitHub Copilot** | `.github/copilot-instructions.md` · `.github/prompts/*.prompt.md` · `.github/instructions/agents.instructions.md` · `.vscode/settings.json` · `.vscode/mcp.json` |
| **Cursor** | `.cursor/rules/nexus-system.mdc` · `.cursor/rules/{agent}.mdc` · `.cursor/mcp.json` · `.cursorignore` |
| **Windsurf** | `.windsurfrules` · `.codeiumignore` |
| **Claude Code** | `CLAUDE.md` · `.claude/settings.json` · `.claude/commands/*.md` · `.claude/agents/*.md` · `.mcp.json` |

> `.agent/` is always installed regardless of IDE — it is the source of truth that all IDE files are generated from.

---

## 🗂️ Project Configuration (`.agstudio.json`)

After `studio init`, a `.agstudio.json` is created in your project root:

```json
{
  "version": "1.0.0",
  "profile": "nextjs-fullstack",
  "project": "my-app",
  "installed": {
    "agents": ["enterprise-architect", "nextjs-expert", "security-engineer"],
    "skills": ["nextjs-app-router", "owasp-top10", "clean-architecture"],
    "workflows": ["blueprint", "create", "debug"],
    "scripts": ["security-scan", "ts-check", "verify-all"]
  },
  "customized": [],
  "telemetry": false,
  "installedHashes": {
    "agents/enterprise-architect.md": "a1b2c3d4e5f6"
  }
}
```

`installedHashes` stores SHA-256 fingerprints of each installed template at install time. `studio sync` and `studio update` compare these against the current upstream templates to detect drift without false positives from Handlebars compilation.

---

## 🔒 Security & Git

`.agent/` is **local-only** by design. `studio init` automatically adds it to `.git/info/exclude` (not `.gitignore`) so:
- ✅ The AI can index and read `.agent/` files
- ✅ The files never appear in `git status`
- ✅ The files are never committed or pushed

> **Do not add `.agent/` to `.gitignore`** — this breaks IDE indexing. Use `.git/info/exclude` (which `studio init` handles automatically).

---

## 🧪 Testing

```bash
npm test          # Run all 43 tests via Vitest + Turbo
npm run typecheck # TypeScript strict check — 0 errors
npm run build     # Production build via tsup
```

**Test coverage:**

| Suite | Tests |
|---|---|
| `platform.test.ts` | 4 — cross-platform bash resolver |
| `config-manager.test.ts` | 5 — config CRUD + hash persistence |
| `project-detector.test.ts` | 8 — framework + IDE heuristics |
| `enterprise-config.test.ts` | 9 — company policy load/validate/apply |
| `add-remove.test.ts` | 7 — input sanitisation (path traversal, injection) |
| `status.test.ts` | 2 — command happy path + error state |
| `template-engine.test.ts` | 8 — Handlebars safe compile (JSX, GH Actions, block helpers) |
| **Total** | **43 passed** |

---

## 📁 Monorepo Structure

```
nexus-studio-monorepo/
├── apps/
│   └── studio/              # @nexus/studio — the CLI package
│       ├── src/
│       │   ├── cli.ts       # Commander.js entry point (12 commands)
│       │   ├── commands/    # init · status · list · doctor · validate
│       │   │                # run · add · remove · update · sync · company
│       │   ├── core/        # template-engine · project-detector · config-manager
│       │   │                # ide-config-generator · enterprise-config · git-integration
│       │   ├── ui/          # banner · logger · spinner
│       │   └── types/       # config · registry · validation
│       └── templates/       # (symlinked from packages/templates at build time)
├── packages/
│   └── templates/           # @nexus/templates — registry + agent/skill/workflow files
│       ├── registry.json    # Single source of truth for all agents, skills, profiles
│       ├── .agent/          # Template files (Handlebars — compiled at install time)
│       ├── .cursor/         # Cursor IDE template rules
│       ├── .claude/         # Claude Code template (CLAUDE.md)
│       ├── .github/         # Copilot template (copilot-instructions.md)
│       └── windsurf/        # Windsurf template (.windsurfrules)
└── scripts/                 # Maintenance scripts (standardize-skills · compute-token-budgets)
```

---

## 📋 Requirements

| Requirement | Minimum |
|---|---|
| Node.js | `>= 18.0.0` |
| npm | `>= 10.0.0` |
| OS | Windows · macOS · Linux |
| Git | Any recent version (for `.git/info/exclude` setup) |

> **Windows users**: Quality gate scripts (`.sh`) require Git Bash. Nexus Studio auto-detects Git Bash at the standard install paths. WSL is also supported.

---

## 📄 License

MIT © Deepak Biswal
