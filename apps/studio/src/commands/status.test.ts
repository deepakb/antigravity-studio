/**
 * Test suite — status.ts command
 * Tests that statusCommand throws (not process.exit) when config is missing,
 * and renders correctly when config is present.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";

vi.mock("../../src/ui/logger.js", () => ({
  logger: {
    info: vi.fn(), success: vi.fn(), warn: vi.fn(), error: vi.fn(),
    step: vi.fn(), dim: vi.fn(), blank: vi.fn(), divider: vi.fn(),
    section: vi.fn(), box: vi.fn(),
  },
}));

// Suppress console output during tests
vi.spyOn(console, "log").mockImplementation(() => {});
vi.spyOn(process.stdout, "write").mockImplementation((() => true) as any);

describe("status command", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "ag-status-test-"));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
    vi.clearAllMocks();
  });

  it("throws an Error (not process.exit) when .agstudio.json is missing", async () => {
    const { statusCommand } = await import("../../src/commands/status.js");
    await expect(statusCommand(tmpDir)).rejects.toThrow(
      "No .agstudio.json found. Run `studio init` first."
    );
  });

  it("runs without throwing when a valid config exists", async () => {
    fs.writeJsonSync(path.join(tmpDir, ".agstudio.json"), {
      version: "1.0.0",
      profile: "nextjs-fullstack",
      project: "test-status-project",
      installed: { agents: ["enterprise-architect"], skills: ["owasp-top10"], workflows: [], scripts: [] },
      customized: [],
    });

    const { statusCommand } = await import("../../src/commands/status.js");
    await expect(statusCommand(tmpDir)).resolves.toBeUndefined();
  });
});
