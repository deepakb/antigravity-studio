# ⚡ Antigravity Studio

**Enterprise AI Agent Toolkit for TypeScript — Agents, Skills, Workflows, and Validation Scripts**

Antigravity Studio is a high-performance CLI and toolkit designed for enterprise teams building complex AI-driven applications. It provides a standardized architecture for deploying specialized AI agents, predefined expert skills, and automated quality gates.

---

## 🚀 Key Features

- **Expert Agent Ecosystem**: Over 35+ specialized agents (Architects, Security Engineers, UX Designers, etc.).
- **Smart Project Detection**: Automatically identifies Next.js, React, Expo, and Monorepo structures.
- **Automated Quality Gates**: Built-in validation for TypeScript, Security, SEO, Accessibility, and Performance.
- **Enterprise Templates**: Ready-to-use workflows and skills for common development tasks.
- **IDE Integration**: Seamless support for Cursor, Windsurf, and VS Code.

---

## 🛠️ Installation

```bash
# Install globally or run via npx
npx antigravity-studio init
```

---

## 💻 CLI Commands

### `studio init`
Initialize the toolkit in your project. It detects your framework and allows you to select a profile or individual agents.
- `-f, --force`: Overwrite existing files.
- `-p, --path <dir>`: Target directory.
- `--dry-run`: Preview changes.

### `studio validate`
Run the full suite of enterprise quality gates.
- `--fix`: Automatically fix linting and formatting issues.
- `--skip-e2e`: Skip slow end-to-end tests.

### `studio status`
List all installed agents, skills, and workflows in the current project.

### `studio add <type> <name>`
Add a specific component (e.g., `studio add agent tech-lead`).

### `studio update`
Sync your local templates with the latest enterprise standards.

---

## 🤖 Specialized Agents

Antigravity Studio includes a diverse pool of agents, categorized by domain:

### 🏛️ Architecture & Leadership
- `enterprise-architect`, `tech-lead`, `product-manager`, `project-planner`, `orchestrator`

### 🎨 Frontend & UI/UX
- `nextjs-expert`, `react-performance-guru`, `frontend-specialist`, `ui-component-architect`, `ux-designer`, `ui-design-engineer`, `accessibility-auditor`, `seo-specialist`

### ⚙️ Backend & Data
- `backend-specialist`, `api-architect`, `database-engineer`, `data-layer-specialist`

### 🛡️ Security & Quality
- `security-engineer`, `penetration-tester`, `qa-engineer`, `debugger`

### 📱 Mobile
- `rn-architect`, `rn-performance-expert`, `mobile-ux-designer`

---

## 📊 Verification Profiles

Antigravity Studio adapts to your project structure:
- **Next.js Fullstack/Frontend**: Tailored for App Router and Server Components.
- **React + Vite**: Optimized for modern SPA development.
- **Expo Mobile**: Mobile-first architecture.
- **Monorepo**: Support for Turborepo and multi-package workspaces.
- **Node.js API**: Backend-focused validation.

---

## 🤝 Contributing

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Build the CLI: `npm run build`.
4. Run locally: `npm start`.

---

## 📄 License

MIT
