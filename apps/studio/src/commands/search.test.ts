/**
 * Test suite — search.ts command
 * Tests keyword matching, type filtering, and edge-cases.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";

// Suppress UI output during tests
vi.mock("../../src/ui/logger.js", () => ({
  logger: {
    info: vi.fn(), success: vi.fn(), warn: vi.fn(), error: vi.fn(),
    step: vi.fn(), dim: vi.fn(), blank: vi.fn(), divider: vi.fn(),
    section: vi.fn(), box: vi.fn(),
  },
}));
vi.spyOn(console, "log").mockImplementation(() => {});
vi.spyOn(process.stdout, "write").mockImplementation((() => true) as any);

describe("search command", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "ag-search-test-"));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
    vi.clearAllMocks();
  });

  it("exits with code 1 when query is empty", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as any);
    const { searchCommand } = await import("../../src/commands/search.js");
    try { await searchCommand("", tmpDir, {}); } catch { /* expected */ }
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  it("exits with code 1 when query is whitespace only", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as any);
    const { searchCommand } = await import("../../src/commands/search.js");
    try { await searchCommand("   ", tmpDir, {}); } catch { /* expected */ }
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  it("runs without throwing for a valid query that yields results", async () => {
    const { searchCommand } = await import("../../src/commands/search.js");
    // "security" should match security-engineer agent and owasp-top10 skill
    await expect(searchCommand("security", tmpDir, {})).resolves.toBeUndefined();
  });

  it("runs without throwing for a query with no results", async () => {
    const { searchCommand } = await import("../../src/commands/search.js");
    await expect(searchCommand("xyznonexistentterm12345", tmpDir, {})).resolves.toBeUndefined();
  });

  it("accepts --type agent filter without throwing", async () => {
    const { searchCommand } = await import("../../src/commands/search.js");
    await expect(searchCommand("architect", tmpDir, { type: "agent" })).resolves.toBeUndefined();
  });

  it("accepts --type skill filter without throwing", async () => {
    const { searchCommand } = await import("../../src/commands/search.js");
    await expect(searchCommand("react", tmpDir, { type: "skill" })).resolves.toBeUndefined();
  });
});
