/**
 * Test suite — enterprise-config.ts
 * Tests company config loading, policy application, and validation.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import os from "os";

let loadCompanyConfig: typeof import("../../src/core/enterprise-config.js").loadCompanyConfig;
let applyCompanySkillPolicy: typeof import("../../src/core/enterprise-config.js").applyCompanySkillPolicy;
let validateCompanyConfig: typeof import("../../src/core/enterprise-config.js").validateCompanyConfig;
let scaffoldCompanyConfig: typeof import("../../src/core/enterprise-config.js").scaffoldCompanyConfig;

describe("enterprise-config", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "ag-enterprise-test-"));
    ({
      loadCompanyConfig,
      applyCompanySkillPolicy,
      validateCompanyConfig,
      scaffoldCompanyConfig,
    } = await import("../../src/core/enterprise-config.js"));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it("loadCompanyConfig returns null when no file exists", () => {
    expect(loadCompanyConfig(tmpDir)).toBeNull();
  });

  it("loadCompanyConfig loads and parses a valid company config", () => {
    const config = {
      companyName: "ACME Corp",
      version: "1.0.0",
      requiredSkills: ["owasp-top10"],
      forbiddenSkills: [],
      defaultIdes: ["copilot"],
    };
    fs.writeJsonSync(path.join(tmpDir, ".agstudio.company.json"), config);
    const loaded = loadCompanyConfig(tmpDir);
    expect(loaded).not.toBeNull();
    expect(loaded!.companyName).toBe("ACME Corp");
    expect(loaded!.requiredSkills).toContain("owasp-top10");
  });

  it("applyCompanySkillPolicy injects required skills", () => {
    const result = applyCompanySkillPolicy(["solid-principles"], {
      companyName: "X",
      version: "1.0.0",
      requiredSkills: ["owasp-top10", "clean-architecture"],
      forbiddenSkills: [],
      defaultIdes: [],
    });
    expect(result.injected).toContain("owasp-top10");
    expect(result.injected).toContain("clean-architecture");
    expect(result.skills).toContain("solid-principles");
    expect(result.skills).toContain("owasp-top10");
  });

  it("applyCompanySkillPolicy removes forbidden skills", () => {
    const result = applyCompanySkillPolicy(["dangerous-skill", "safe-skill"], {
      companyName: "X",
      version: "1.0.0",
      requiredSkills: [],
      forbiddenSkills: ["dangerous-skill"],
      defaultIdes: [],
    });
    expect(result.removed).toContain("dangerous-skill");
    expect(result.skills).not.toContain("dangerous-skill");
    expect(result.skills).toContain("safe-skill");
  });

  it("validateCompanyConfig returns errors for missing companyName", () => {
    const issues = validateCompanyConfig({
      companyName: "",
      version: "1.0.0",
      requiredSkills: [],
      forbiddenSkills: [],
      defaultIdes: [],
    });
    expect(issues).toContain("companyName is required");
  });

  it("validateCompanyConfig catches skill appearing in both required and forbidden", () => {
    const issues = validateCompanyConfig({
      companyName: "X",
      version: "1.0.0",
      requiredSkills: ["owasp-top10"],
      forbiddenSkills: ["owasp-top10"],
      defaultIdes: [],
    });
    expect(issues.some((i) => i.includes("owasp-top10"))).toBe(true);
  });

  it("validateCompanyConfig returns empty array for valid config", () => {
    const issues = validateCompanyConfig({
      companyName: "ACME",
      version: "2.1.0",
      requiredSkills: ["owasp-top10"],
      forbiddenSkills: ["bad-skill"],
      defaultIdes: ["copilot"],
    });
    expect(issues).toHaveLength(0);
  });

  it("scaffoldCompanyConfig creates a valid .agstudio.company.json", async () => {
    await scaffoldCompanyConfig(tmpDir, "TestCo");
    const file = path.join(tmpDir, ".agstudio.company.json");
    expect(fs.existsSync(file)).toBe(true);
    const config = fs.readJsonSync(file);
    expect(config.companyName).toBe("TestCo");
    expect(Array.isArray(config.requiredSkills)).toBe(true);
  });

  it("scaffoldCompanyConfig does not overwrite an existing config", async () => {
    const file = path.join(tmpDir, ".agstudio.company.json");
    fs.writeJsonSync(file, { companyName: "original" });
    await scaffoldCompanyConfig(tmpDir, "NewName");
    const config = fs.readJsonSync(file);
    expect(config.companyName).toBe("original");
  });
});
