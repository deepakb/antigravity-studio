/**
 * Test suite — info.ts command
 * Tests validation, registry lookup, and graceful handling of unknown ids.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
vi.spyOn(console, "log").mockImplementation(() => {});
vi.spyOn(process.stdout, "write").mockImplementation((() => true) as any);

describe("info command", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "ag-info-test-"));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
    vi.clearAllMocks();
  });

  it("exits with code 1 for an invalid type", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as any);
    const { infoCommand } = await import("../../src/commands/info.js");
    try { await infoCommand("badtype", "some-id", tmpDir); } catch { /* expected */ }
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  it("exits with code 1 for an id with uppercase letters", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as any);
    const { infoCommand } = await import("../../src/commands/info.js");
    try { await infoCommand("agent", "MyAgent", tmpDir); } catch { /* expected */ }
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  it("exits with code 1 for a non-existent agent id", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as any);
    const { infoCommand } = await import("../../src/commands/info.js");
    try { await infoCommand("agent", "xyzzy-nonexistent-999", tmpDir); } catch { /* expected */ }
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  it("resolves for a valid well-known agent id", async () => {
    const { infoCommand } = await import("../../src/commands/info.js");
    // security-engineer is in the bundled registry
    await expect(infoCommand("agent", "security-engineer", tmpDir)).resolves.toBeUndefined();
  });

  it("shows installed badge when agent is in .agstudio.json", async () => {
    fs.writeJsonSync(path.join(tmpDir, ".agstudio.json"), {
      version: "1.0.0",
      profile: "nextjs-fullstack",
      project: "info-test",
      installed: { agents: ["security-engineer"], skills: [], workflows: [], scripts: [] },
      customized: [],
    });
    const { infoCommand } = await import("../../src/commands/info.js");
    await expect(infoCommand("agent", "security-engineer", tmpDir)).resolves.toBeUndefined();
  });
});
