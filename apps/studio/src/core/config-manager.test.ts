/**
 * Test suite — config-manager.ts
 * Tests createConfig, readConfig, writeConfig, installedHashes persistence,
 * and migrateConfig schema normalisation.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";

let createConfig: typeof import("../../src/core/config-manager.js").createConfig;
let readConfig: typeof import("../../src/core/config-manager.js").readConfig;
let writeConfig: typeof import("../../src/core/config-manager.js").writeConfig;
let migrateConfig: typeof import("../../src/core/config-manager.js").migrateConfig;

describe("config-manager", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "ag-config-test-"));
    ({ createConfig, readConfig, writeConfig, migrateConfig } = await import("../../src/core/config-manager.js"));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("readConfig returns null when .agstudio.json does not exist", () => {
    expect(readConfig(tmpDir)).toBeNull();
  });

  it("readConfig returns null for malformed JSON", () => {
    fs.writeFileSync(path.join(tmpDir, ".agstudio.json"), "{ broken json");
    expect(readConfig(tmpDir)).toBeNull();
  });

  it("createConfig + writeConfig + readConfig round-trips correctly", async () => {
    const hashes = { "agents/security-analyst.md": "abc123" };
    const config = createConfig(
      "test-project",
      "nextjs-fullstack",
      { agents: ["security-analyst"], skills: ["owasp-top10"], workflows: [], scripts: [] },
      hashes
    );

    await writeConfig(config, tmpDir);
    const read = readConfig(tmpDir);

    expect(read).not.toBeNull();
    expect(read!.project).toBe("test-project");
    expect(read!.profile).toBe("nextjs-fullstack");
    expect(read!.installedHashes).toEqual(hashes);
    expect(read!.installed.agents).toContain("security-analyst");
    // telemetry field must NOT be present in new configs
    expect(read).not.toHaveProperty("telemetry");
  });

  it("createConfig defaults installedHashes to empty object when not provided", () => {
    const config = createConfig("p", "custom", { agents: [], skills: [], workflows: [], scripts: [] });
    expect(config.installedHashes).toEqual({});
  });

  it("writeConfig produces valid JSON with trailing newline", async () => {
    const config = createConfig("my-app", "node-api", {
      agents: [], skills: [], workflows: [], scripts: [],
    });
    await writeConfig(config, tmpDir);
    const raw = fs.readFileSync(path.join(tmpDir, ".agstudio.json"), "utf-8");
    expect(() => JSON.parse(raw)).not.toThrow();
    expect(raw.endsWith("\n")).toBe(true);
  });

  // ── migrateConfig ──────────────────────────────────────────────────────────

  it("migrateConfig strips the legacy telemetry field", () => {
    const old = {
      version: "1.0.0", profile: "nextjs-fullstack", project: "my-app",
      installed: { agents: [], skills: [], workflows: [], scripts: [] },
      customized: [], telemetry: true,
    };
    const result = migrateConfig(old);
    expect(result).not.toHaveProperty("telemetry");
  });

  it("migrateConfig preserves all current valid fields", () => {
    const config = {
      version: "1.0.0", profile: "nextjs-fullstack", project: "my-app",
      installed: { agents: ["security-engineer"], skills: ["owasp-top10"], workflows: [], scripts: [] },
      customized: ["agents/security-engineer.md"],
      installedHashes: { "agents/security-engineer.md": "abc123" },
    };
    const result = migrateConfig(config);
    expect(result.project).toBe("my-app");
    expect(result.installed.agents).toContain("security-engineer");
    expect(result.customized).toContain("agents/security-engineer.md");
    expect(result.installedHashes?.["agents/security-engineer.md"]).toBe("abc123");
  });

  it("migrateConfig initialises missing installed sub-keys to empty arrays", () => {
    const partial = { version: "1.0.0", profile: "custom", project: "p", installed: {}, customized: [] };
    const result = migrateConfig(partial as any);
    expect(Array.isArray(result.installed.agents)).toBe(true);
    expect(Array.isArray(result.installed.skills)).toBe(true);
    expect(Array.isArray(result.installed.workflows)).toBe(true);
    expect(Array.isArray(result.installed.scripts)).toBe(true);
  });

  it("readConfig auto-migrates an old .agstudio.json with telemetry on disk", async () => {
    fs.writeJsonSync(path.join(tmpDir, ".agstudio.json"), {
      version: "1.0.0", profile: "custom", project: "old-app",
      installed: { agents: [], skills: [], workflows: [], scripts: [] },
      customized: [], telemetry: false,
    });
    const config = readConfig(tmpDir);
    expect(config).not.toBeNull();
    expect(config).not.toHaveProperty("telemetry");
    expect(config!.project).toBe("old-app");
  });
});
