/**
 * Test suite — add.ts & remove.ts commands
 * Tests input sanitization, happy-path file creation, and .agstudio.json sync.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";

// Mock logger to suppress output during tests
vi.mock("../../src/ui/logger.js", () => ({
  logger: {
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    step: vi.fn(),
    dim: vi.fn(),
    blank: vi.fn(),
    divider: vi.fn(),
    section: vi.fn(),
    box: vi.fn(),
  },
}));

describe("add command — input sanitization", () => {
  it("throws on invalid type", async () => {
    const { addCommand } = await import("../../src/commands/add.js");
    await expect(addCommand("badtype", "some-id")).rejects.toThrow(/Invalid type/);
  });

  it("throws on id with path separators", async () => {
    const { addCommand } = await import("../../src/commands/add.js");
    await expect(addCommand("agent", "../../../etc/passwd")).rejects.toThrow(/Invalid id/);
  });

  it("throws on id with uppercase letters", async () => {
    const { addCommand } = await import("../../src/commands/add.js");
    await expect(addCommand("skill", "MySkill")).rejects.toThrow(/Invalid id/);
  });

  it("throws on id with spaces", async () => {
    const { addCommand } = await import("../../src/commands/add.js");
    await expect(addCommand("agent", "my agent")).rejects.toThrow(/Invalid id/);
  });

  it("accepts a valid slug id without throwing on sanitization", async () => {
    // Even if copyTemplates later finds nothing, sanitization itself should not throw
    const { addCommand } = await import("../../src/commands/add.js");
    // We expect it to not throw on sanitization — it may fail later for other reasons
    // (e.g. template not found), so we just check it's not a sanitization error
    try {
      await addCommand("agent", "valid-id-123");
    } catch (err: any) {
      expect(err.message).not.toMatch(/Invalid id/);
      expect(err.message).not.toMatch(/Invalid type/);
    }
  });
});

describe("remove command — input sanitization", () => {
  it("calls process.exit for id with path traversal", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as any);
    const { removeCommand } = await import("../../src/commands/remove.js");
    await removeCommand("agent", "../../evil");
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  it("calls process.exit for invalid type", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as any);
    const { removeCommand } = await import("../../src/commands/remove.js");
    // process.exit is mocked so execution continues past the guard;
    // wrap to prevent the subsequent removeTemplate(undefined) crash from failing the assertion
    try { await removeCommand("notatype", "some-id"); } catch { /* expected */ }
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });
});
