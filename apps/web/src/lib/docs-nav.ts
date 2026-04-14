/**
 * Canonical ordered list of all documentation pages.
 * Used by: PrevNextNav, CommandPalette, DocsSidebar.
 */
export interface DocsPage {
  label: string;
  to: string;
  section: string;
}

export const DOCS_PAGES: DocsPage[] = [
  { label: "Getting Started", to: "/docs/getting-started", section: "Introduction" },
  { label: "Installation",    to: "/docs/installation",    section: "Introduction" },
  { label: "CLI Reference",   to: "/docs/cli-reference",   section: "Reference"    },
  { label: "Profiles",        to: "/docs/profiles",        section: "Reference"    },
  { label: "AI Agents",       to: "/docs/agents",          section: "Reference"    },
  { label: "Skills",          to: "/docs/skills",          section: "Reference"    },
  { label: "Quality Gates",   to: "/docs/quality-gates",   section: "Reference"    },
  { label: "Workflows",       to: "/docs/workflows",       section: "Reference"    },
  { label: "MCP Servers",     to: "/docs/mcp",             section: "Integrations" },
];
