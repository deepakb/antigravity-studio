/**
 * Test suite — platform.ts
 * Tests the cross-platform bash resolver.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import os from "os";

describe("platform", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 'bash' on macOS", async () => {
    vi.spyOn(os, "platform").mockReturnValue("darwin");
    const { getBashExecutable } = await import("../../src/core/platform.js");
    expect(getBashExecutable()).toBe("bash");
  });

  it("returns 'bash' on Linux", async () => {
    vi.spyOn(os, "platform").mockReturnValue("linux");
    const { getBashExecutable } = await import("../../src/core/platform.js");
    expect(getBashExecutable()).toBe("bash");
  });

  it("returns 'bash' fallback on Windows when no Git Bash found at known paths", async () => {
    vi.spyOn(os, "platform").mockReturnValue("win32");
    // Mock existsSync to return false (Git Bash not at any candidate path)
    vi.mock("fs", async (importOriginal) => {
      const actual = await importOriginal<typeof import("fs")>();
      return { ...actual, existsSync: vi.fn().mockReturnValue(false) };
    });
    const { getBashExecutable } = await import("../../src/core/platform.js");
    // Fallback must always be a string (never throws)
    expect(typeof getBashExecutable()).toBe("string");
  });

  it("isWindows returns correct value", async () => {
    vi.spyOn(os, "platform").mockReturnValue("win32");
    const { isWindows } = await import("../../src/core/platform.js");
    expect(isWindows()).toBe(true);
  });
});
