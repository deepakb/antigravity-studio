/// <reference types="node" />
import { defineConfig } from "tsup";
import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export default defineConfig({
  entry: {
    cli: "src/cli.ts",
    index: "src/index.ts",
  },
  format: ["esm"],
  target: "node18",
  outDir: "dist",
  clean: true,
  dts: true,
  sourcemap: true,
  external: [],
  treeshake: true,
  onSuccess: async () => {
    // Populate apps/studio/templates/ from the monorepo source of truth.
    //
    // PURPOSE: standalone publishing only.
    //   - In monorepo dev (npm link), getTemplatesDir() resolves directly to
    //     packages/templates — this copy is NOT used.
    //   - When the CLI is published to npm as a standalone package, it bundles
    //     templates/ next to dist/ so the installed binary can find its content.
    //
    // IMPORTANT: apps/studio/templates/ is a BUILD ARTIFACT.
    //   - It is .gitignored and must NEVER be edited directly.
    //   - Always edit packages/templates/ — then rebuild to refresh this copy.
    const src = resolve("../../packages/templates");
    const dest = resolve("templates");
    if (existsSync(src)) {
      cpSync(src, dest, { recursive: true, force: true } as any);
      console.log("[tsup] Synced packages/templates \u2192 templates/ (standalone build artifact)");
    }
  },
});
