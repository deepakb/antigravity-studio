/**
 * Test suite — project-detector.ts
 * Tests the heuristic framework & IDE detection logic.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";

// We import the module under test AFTER creating temp dirs
let detectProject: typeof import("../../src/core/project-detector.js").detectProject;

describe("project-detector", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "ag-test-"));
    // Lazy import so the module re-reads the fs each call
    ({ detectProject } = await import("../../src/core/project-detector.js"));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("detects Next.js project from next.config.ts", () => {
    fs.writeFileSync(path.join(tmpDir, "next.config.ts"), "export default {};");
    fs.writeJsonSync(path.join(tmpDir, "package.json"), {
      name: "my-next-app",
      dependencies: { next: "14.0.0", react: "18.0.0" },
    });

    const result = detectProject(tmpDir);

    expect(result.profile).toMatch(/^nextjs-/);
    expect(result.framework.name).toBe("Next.js");
    expect(result.framework.language).toBe("typescript");
    expect(result.name).toBe("my-next-app");
  });

  it("detects Python/FastAPI from requirements.txt", () => {
    fs.writeFileSync(path.join(tmpDir, "requirements.txt"), "fastapi\nuvicorn\n");
    fs.writeFileSync(path.join(tmpDir, "main.py"), "from fastapi import FastAPI\napp = FastAPI()");

    const result = detectProject(tmpDir);

    expect(result.profile).toBe("python-fastapi");
    expect(result.framework.language).toBe("python");
  });

  it("detects monorepo root from turbo.json", () => {
    fs.writeFileSync(path.join(tmpDir, "turbo.json"), "{}");

    const result = detectProject(tmpDir);

    expect(result.isMonorepo).toBe(true);
    expect(result.profile).toBe("monorepo-root");
  });

  it("respects existing .agstudio.json profile instead of re-detecting", () => {
    fs.writeJsonSync(path.join(tmpDir, ".agstudio.json"), {
      version: "1.0.0",
      profile: "angular-enterprise",
      project: "pinned-project",
    });
    // No angular.json present — would not be detected otherwise
    const result = detectProject(tmpDir);

    expect(result.profile).toBe("angular-enterprise");
    expect(result.name).toBe("pinned-project");
  });

  it("falls back to 'custom' profile for unknown projects", () => {
    // Empty dir — no indicators
    const result = detectProject(tmpDir);
    expect(result.profile).toBe("custom");
  });

  it("IDs detect VS Code from .vscode dir", () => {
    fs.mkdirSync(path.join(tmpDir, ".vscode"));
    const result = detectProject(tmpDir);
    expect(result.ide).toBe("vscode");
  });

  it("detects Cursor IDE from .cursor dir", () => {
    fs.mkdirSync(path.join(tmpDir, ".cursor"));
    const result = detectProject(tmpDir);
    expect(result.ide).toBe("cursor");
  });

  it("ID sanitization: _globExistsExt does not crash on ESM (no require)", () => {
    // Create a .csproj file to trigger the dotnet path
    fs.writeFileSync(path.join(tmpDir, "MyApp.csproj"), "<Project />");
    // This would throw ReferenceError: require is not defined before the fix
    expect(() => detectProject(tmpDir)).not.toThrow();
    const result = detectProject(tmpDir);
    expect(result.profile).toBe("dotnet-api");
  });
});
