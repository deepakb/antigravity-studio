---
applyTo: "**/*"
---

# Nexus Studio — Agent System

This project uses a multi-agent orchestration system.
Installed agents (read their personas from `.agent/agents/`):

- `@frontend-specialist` → `.agent/agents/frontend-specialist.md`
- `@react-performance-guru` → `.agent/agents/react-performance-guru.md`
- `@ui-component-architect` → `.agent/agents/ui-component-architect.md`
- `@ui-design-engineer` → `.agent/agents/ui-design-engineer.md`
- `@ux-designer` → `.agent/agents/ux-designer.md`
- `@motion-designer` → `.agent/agents/motion-designer.md`
- `@design-system-architect` → `.agent/agents/design-system-architect.md`
- `@creative-director` → `.agent/agents/creative-director.md`
- `@security-engineer` → `.agent/agents/security-engineer.md`
- `@backend-specialist` → `.agent/agents/backend-specialist.md`
- `@devops-engineer` → `.agent/agents/devops-engineer.md`
- `@seo-specialist` → `.agent/agents/seo-specialist.md`
- `@accessibility-auditor` → `.agent/agents/accessibility-auditor.md`
- `@qa-engineer` → `.agent/agents/qa-engineer.md`
- `@debugger` → `.agent/agents/debugger.md`

## Routing

Consult `.agent/AGENTS.md` to determine which agent to activate.
Follow the 5-stage pipeline defined in `.agent/AGENT_FLOW.md`.

## Non-Negotiable Rules

- Always define TypeScript types/interfaces before implementation
- Activate `@llm-security-officer` for ALL AI/LLM-related work
- Run quality gates from `.agent/scripts/` before delivering
- For requests spanning 3+ domains: produce architecture doc first (`/blueprint`)
