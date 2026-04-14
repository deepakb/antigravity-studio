/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  // @tailwindcss/vite is hoisted to the monorepo root where it resolves against
  // vite@5 (root). This app uses vite@6 locally — the Plugin types are structurally
  // identical at runtime; the cast silences the false-positive IDE type mismatch.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [react(), tailwindcss()] as any,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // GitHub Pages deployment — set base to repo name in CI via VITE_BASE_URL env
  base: process.env.VITE_BASE_URL ?? "/",
  build: {
    outDir: "dist",
    // Oniguruma WASM binary (~600kb) always triggers the default 500kb warning.
    // It's a known large binary used by Shiki — not a code split opportunity.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Function-based manualChunks: processes modules by node_modules path.
        // This ensures React is placed in "vendor" BEFORE react-router can claim it.
        // (Object form has ordering ambiguity that causes the vendor chunk to be empty.)
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          // React family — must be split before router claims it
          if (/[/\\]react[/\\]|[/\\]react-dom[/\\]|[/\\]scheduler[/\\]/.test(id)) {
            return "vendor";
          }
          // React Router v7 + Remix internals
          if (/[/\\]react-router[/\\]|[/\\]@remix-run[/\\]|turbo-stream/.test(id)) {
            return "router";
          }
          // All Radix primitives → one lazy radix chunk
          if (id.includes("@radix-ui")) {
            return "radix";
          }
          // Shiki core runtime (lang/theme lazy chunks manage themselves)
          if (id.includes("/shiki/") && !id.includes("/langs/") && !id.includes("/themes/") && !id.includes("/wasm")) {
            return "shiki";
          }
          return undefined;
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
});
