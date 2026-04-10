import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import { loadRegistry, safeCompile } from "./template-engine.js";

vi.mock("fs-extra");
vi.mock("../ui/logger.js");

describe("template-engine", () => {
  describe("loadRegistry", () => {
    it("should load and parse registry.json", () => {
      const mockRegistry = { agents: [], skills: [], profiles: {}, slashCommands: [] };
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(JSON.stringify(mockRegistry));

      const registry = loadRegistry();
      expect(registry).toEqual(mockRegistry);
    });

    it("should throw error if registry not found", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(false);
      expect(() => loadRegistry()).toThrow(/Registry not found/);
    });
  });

  describe("safeCompile", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("interpolates known template variables", () => {
      const output = safeCompile("Hello {{projectName}}!", { projectName: "MyApp" });
      expect(output).toBe("Hello MyApp!");
    });

    it("preserves {{ }} inside fenced code blocks without interpolation", () => {
      const raw = "```\nconst style = {{ flex: 1 }};\n```";
      const output = safeCompile(raw, { projectName: "X" });
      // The {{ inside ``` should be escaped and not cause a template error
      expect(output).toContain("{ flex: 1 }");
    });

    it("preserves GitHub Actions expression ${{ secrets.TOKEN }} in code blocks", () => {
      const raw = "```yaml\n- run: echo ${{ secrets.TOKEN }}\n```";
      // Should compile without throwing
      expect(() => safeCompile(raw, {})).not.toThrow();
    });

    it("does not interpolate JSX inline style objects outside template vars", () => {
      const raw = "Use `style={{ color: 'red' }}` in JSX.";
      expect(() => safeCompile(raw, {})).not.toThrow();
    });

    it("resolves {{#if}} block helpers correctly", () => {
      const raw = "{{#if hasTypeScript}}typed{{else}}untyped{{/if}}";
      const outputTrue = safeCompile(raw, { hasTypeScript: true });
      const outputFalse = safeCompile(raw, { hasTypeScript: false });
      expect(outputTrue).toBe("typed");
      expect(outputFalse).toBe("untyped");
    });

    it("handles nested framework object variables", () => {
      const raw = "Framework: {{framework.name}}";
      const output = safeCompile(raw, { framework: { name: "Next.js" } });
      expect(output).toBe("Framework: Next.js");
    });
  });
});
