# Nexus Studio — Architecture Reference

> **{{name}}** | Profile: `{{profile}}` | Framework: `{{framework.name}}`
> Managed by **Nexus Studio** | Initialized: `{{timestamp}}`

---

## 📋 Overview

This `.agent/` directory is your project's **AI engineering command center**. It provides a team of specialist AI agents, a structured orchestration pipeline, quality gate scripts, and workflow procedures — all customized for `{{name}}`.

The system is designed for **IDE-native AI** (Antigravity, Claude Code, GitHub Copilot Workspace) and is **AI-agnostic** at the protocol level.

---

## 🏗️ Directory Structure

```
.agent/
├── AGENT_FLOW.md          # 🔄 The 5-Stage execution pipeline — AI reads this always
├── AGENT_SYSTEM.md        # 🧠 Master system prompt — context-aware behavioral rules
├── AGENTS.md              # 🗺️ Agent routing index — how to select and announce agents
├── ARCHITECTURE.md        # 📖 This file — reference for humans and AI
│
├── agents/                # 29 specialist agent personas
│   ├── enterprise-architect.md
│   ├── nextjs-expert.md
│   ├── security-engineer.md
│   └── ... (all agents)
│
├── workflows/             # 14 slash command procedures
│   ├── blueprint.md       # /blueprint — architecture gate
│   ├── create.md          # /create — feature implementation
│   ├── orchestrate.md     # /orchestrate — multi-agent coordination
│   ├── debug.md           # /debug — root cause analysis
│   └── ... (all workflows)
│
└── scripts/               # Polyglot quality gate scripts
    ├── security-scan/     # 🔴 TIER 1: Secrets & OWASP detection (all stacks)
    │   ├── manifest.md    # AI reads: what/when/how + tier rules
    │   ├── node.sh        # Node/TypeScript runner
    │   ├── python.sh      # Python runner
    │   ├── java.sh        # Java runner
    │   ├── dotnet.sh      # .NET runner
    │   └── flutter.sh     # Flutter/Dart runner
    ├── ts-check/          # 🔴 TIER 1: Type & compile check (all stacks, language-aware)
    ├── env-validator/     # 🔴 TIER 1: Env var documentation (all stacks)
    ├── dependency-audit/  # 🟡 TIER 2: CVE vulnerability scan (all stacks)
    ├── license-audit/     # 🟡 TIER 2: License compliance (all stacks)
    ├── accessibility-audit/ # 🟢 TIER 3: WCAG check (web + Flutter)
    ├── bundle-analyzer/   # 🟢 TIER 3: Bundle size budget (web stacks)
    ├── performance-budget/ # 🟢 TIER 3: Core Web Vitals (web stacks)
    ├── seo-linter/        # 🟢 TIER 3: SEO & metadata (public web pages)
    ├── i18n-linter/       # 🟢 TIER 3: Translation key coverage
    ├── type-coverage/     # 🟢 TIER 3: Type coverage report
    └── verify-all/        # 📋 META: Orchestrates all gates (all stacks)
        ├── manifest.md    # Execution order + skip rules
        ├── node.sh        # Full pipeline for Node/TypeScript
        ├── python.sh      # Full pipeline for Python
        ├── java.sh        # Full pipeline for Java
        ├── dotnet.sh      # Full pipeline for .NET
        └── flutter.sh     # Full pipeline for Flutter
```

---

## 🤖 Agent Roster (29 Specialists)

### 🏛️ Architecture & Leadership
| Agent | When to Use |
|-------|-------------|
| `enterprise-architect` | System design, DDD, bounded contexts, ADRs |
| `tech-lead` | Technology choices, PR standards, cross-cutting concerns |
| `orchestrator` | Multi-agent coordination, Epic decomposition |
| `cloud-architect` | AWS/GCP/Azure, CDN, serverless, IaC |
| `product-manager` | Requirements, user stories, acceptance criteria |
| `project-planner` | Milestones, sprint planning, capacity |

### ⚛️ Frontend (Web)
| Agent | Specialty |
|-------|-----------|
| `nextjs-expert` | App Router, RSC, Server Actions, caching |
| `react-performance-guru` | Bundle, re-renders, Concurrent Features |
| `frontend-specialist` | React, TypeScript, hooks, state |
| `ui-component-architect` | Design systems, shadcn/ui, Storybook |

### 🎨 UX/UI Design
| Agent | Specialty |
|-------|-----------|
| `ux-designer` | Journeys, interaction models, UX laws |
| `ui-design-engineer` | Tailwind, animations, pixel-perfect CSS |
| `accessibility-auditor` | WCAG 2.2, ARIA, keyboard navigation |

### 🔧 Backend & API
| Agent | Specialty |
|-------|-----------|
| `backend-specialist` | Route handlers, services, middleware |
| `api-architect` | OpenAPI, REST/GraphQL contracts |
| `database-engineer` | Prisma, Drizzle, schema, migrations |
| `data-layer-specialist` | Redis, queues, CQRS, WebSockets |

### 🔐 Security
| Agent | Specialty |
|-------|-----------|
| `security-engineer` | OWASP Top 10, auth, CSP, secrets |
| `penetration-tester` | CVE analysis, threat modeling, attack surface |

### 📱 Mobile
| Agent | Specialty |
|-------|-----------|
| `rn-architect` | Expo Router, React Native, EAS |
| `rn-performance-expert` | Reanimated, JSI, Hermes optimization |
| `mobile-ux-designer` | Touch UX, iOS/Android conventions |

### 🏆 Quality, Ops & AI
| Agent | Specialty |
|-------|-----------|
| `qa-engineer` | Vitest, Playwright, test strategy |
| `devops-engineer` | CI/CD, Docker, Vercel, monitoring |
| `debugger` | Root cause analysis, 5-Why, binary search |
| `seo-specialist` | Core Web Vitals, JSON-LD, GEO |
| `ai-engineer` | LLM integration, RAG, Vercel AI SDK |
| `prompt-engineer` | System prompts, evals, few-shot |
| `llm-security-officer` | Prompt injection, PII, AI output safety |

---

## ⚡ Slash Commands (14)

| Command | Agent Activated | Use When |
|---------|-----------------|----------|
| `/blueprint` | `enterprise-architect` | Architecture planned before code |
| `/create` | Domain specialist | Implementing a new feature |
| `/enhance` | Domain specialist | Improving existing code |
| `/debug` | `debugger` + domain | Bug investigation |
| `/audit-security` | `security-engineer` | OWASP security review |
| `/refactor-solid` | Domain specialist | Applying SOLID principles |
| `/generate-tests` | `qa-engineer` | Unit + integration tests |
| `/generate-e2e` | `qa-engineer` | Playwright E2E tests |
| `/deploy` | `devops-engineer` | Deployment pipeline |
| `/perf-audit` | `nextjs-expert` + `react-performance-guru` | Performance investigation |
| `/a11y-audit` | `accessibility-auditor` | WCAG compliance review |
| `/document` | Domain specialist | JSDoc + Storybook + README |
| `/orchestrate` | `orchestrator` | Complex multi-agent feature |
| `/status` | `project-planner` | Project health dashboard |

---

## ✅ Quality Gate Scripts

Each gate auto-detects your stack and runs the appropriate tool.
Read `.agent/scripts/<gate>/manifest.md` to understand what each gate checks and when it blocks.

### Run by Stack (Git Bash / WSL)

```bash
# Node / TypeScript projects
bash .agent/scripts/verify-all/node.sh

# Python projects
bash .agent/scripts/verify-all/python.sh

# Java / Spring projects
bash .agent/scripts/verify-all/java.sh

# .NET / ASP.NET projects
bash .agent/scripts/verify-all/dotnet.sh

# Flutter / Dart projects
bash .agent/scripts/verify-all/flutter.sh
```

### Run Individual Gates

```bash
# Security scan (TIER 1 — replace <stack> with node/python/java/dotnet/flutter)
bash .agent/scripts/security-scan/<stack>.sh

# Type/compile check (TIER 1)
bash .agent/scripts/ts-check/<stack>.sh

# Dependency CVE scan (TIER 2)
bash .agent/scripts/dependency-audit/<stack>.sh

# Accessibility (TIER 3, web only)
bash .agent/scripts/accessibility-audit/node.sh
```

### Run via CLI (auto-detects stack)

```bash
studio validate          # All gates
studio validate --fix    # Auto-fix where possible
studio validate --all    # Monorepo: all packages
```

### Gate Tiers at a Glance

| Tier | Gates | Behavior |
|------|-------|----------|
| 🔴 TIER 1 | security-scan, ts-check, env-validator | **HARD BLOCK** — AI stops until fixed |
| 🟡 TIER 2 | dependency-audit, license-audit | **AUTO-FIX** — AI patches then continues |
| 🟢 TIER 3 | accessibility, bundle, performance, seo, i18n, type-coverage | **ADVISORY** — always delivers, attaches report |

---

## 🚀 Key Protocols Summary

| Protocol | Rule |
|----------|------|
| **Announce** | Always announce agent + skills before responding |
| **Types first** | Define TypeScript interfaces before any implementation code |
| **Blueprint gate** | Architecture approval required for 3+ domain changes |
| **LLM safety** | All AI work activates `llm-security-officer` automatically |
| **Session memory** | AI tracks decisions, files touched, and approved patterns within a session |
| **Quality gates** | No code delivered if a gate would fail — fix first |
| **Confidence** | AI declares 🟢/🟡/🔴 confidence after agent announcement |

---

## 🔮 IDE Compatibility

This system is designed to work with any AI-powered IDE:

| IDE | How It Uses `.agent/` |
|-----|----------------------|
| **Antigravity** | Native support — reads all `.agent/` files as system context |
| **Claude Code** | References `.agent/AGENT_SYSTEM.md` as project rules |
| **GitHub Copilot** | Uses `.agent/` markdown as workspace context |
| **Cursor** | `.agent/` included in `@workspace` context |
| **Windsurf (Codeium)** | Reads `.agent/` as project instructions |

---

**Managed by**: Nexus Studio
**Project**: {{name}} | **Profile**: {{profile}}
