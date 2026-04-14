import { createBrowserRouter } from "react-router";
import { RootLayout } from "@/layouts/RootLayout";
import { DocsLayout } from "@/layouts/DocsLayout";

// ── Route loaders ──────────────────────────────────────────────────────────
import { homeLoader } from "@/pages/home/home.loader";
import { agentsLoader } from "@/pages/docs/agents/agents.loader";
import { skillsLoader } from "@/pages/docs/skills/skills.loader";
import { profilesLoader } from "@/pages/docs/profiles/profiles.loader";
import { qualityGatesLoader } from "@/pages/docs/quality-gates/quality-gates.loader";

// ── Pages (lazy-loaded per route for code splitting) ──────────────────────
import { lazy } from "react";

const HomePage = lazy(() => import("@/pages/home/HomePage"));
const GettingStartedPage = lazy(() => import("@/pages/docs/getting-started/GettingStartedPage"));
const InstallationPage = lazy(() => import("@/pages/docs/installation/InstallationPage"));
const CliReferencePage = lazy(() => import("@/pages/docs/cli-reference/CliReferencePage"));
const AgentsPage = lazy(() => import("@/pages/docs/agents/AgentsPage"));
const SkillsPage = lazy(() => import("@/pages/docs/skills/SkillsPage"));
const ProfilesPage = lazy(() => import("@/pages/docs/profiles/ProfilesPage"));
const QualityGatesPage = lazy(() => import("@/pages/docs/quality-gates/QualityGatesPage"));
const WorkflowsPage = lazy(() => import("@/pages/docs/workflows/WorkflowsPage"));
const McpPage = lazy(() => import("@/pages/docs/mcp/McpPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

export const router = createBrowserRouter(
  [
    {
      path: "/",
      Component: RootLayout,
      children: [
        // ── Home (marketing landing) ─────────────────────────────────────
        {
          index: true,
          loader: homeLoader,
          Component: HomePage,
          // React Router v7 meta via handle
          handle: {
            title: "Nexus Studio — Enterprise CLI Orchestrator for Developer Teams",
            description:
              "Deploy specialist AI agents, enforce coding standards, and run automated quality gates across any technology stack.",
          },
        },

        // ── Docs section ──────────────────────────────────────────────────
        {
          path: "docs",
          Component: DocsLayout,
          children: [
            {
              path: "getting-started",
              Component: GettingStartedPage,
              handle: { title: "Getting Started — Nexus Studio" },
            },
            {
              path: "installation",
              Component: InstallationPage,
              handle: { title: "Installation — Nexus Studio" },
            },
            {
              path: "cli-reference",
              Component: CliReferencePage,
              handle: { title: "CLI Reference — Nexus Studio" },
            },
            {
              path: "agents",
              loader: agentsLoader,
              Component: AgentsPage,
              handle: { title: "AI Agents — Nexus Studio" },
            },
            {
              path: "skills",
              loader: skillsLoader,
              Component: SkillsPage,
              handle: { title: "Skills — Nexus Studio" },
            },
            {
              path: "profiles",
              loader: profilesLoader,
              Component: ProfilesPage,
              handle: { title: "Profiles — Nexus Studio" },
            },
            {
              path: "quality-gates",
              loader: qualityGatesLoader,
              Component: QualityGatesPage,
              handle: { title: "Quality Gates — Nexus Studio" },
            },
            {
              path: "workflows",
              Component: WorkflowsPage,
              handle: { title: "Workflows — Nexus Studio" },
            },
            {
              path: "mcp",
              Component: McpPage,
              handle: { title: "MCP Servers — Nexus Studio" },
            },
          ],
        },

        // ── 404 catch-all ─────────────────────────────────────────────────
        {
          path: "*",
          Component: NotFoundPage,
        },
      ],
    },
  ],
  {
    // GitHub Pages SPA routing — 404.html redirect trick handles deep links.
    // See public/404.html for the redirect script.
  }
);
