#!/usr/bin/env node
/**
 * verify-all.ts - Runs end-to-end (E2E) tests
 * Executed by `studio validate` unless --skip-e2e is passed
 */
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const cwd = process.argv[2] || process.cwd();

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

try {
  console.log('⏳ Running End-to-End Tests (Playwright)...');
  
  // Check if playwright is configured
  let hasPlaywright = false;
  try {
    const pkgPath = path.join(cwd, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkgRaw = fs.readFileSync(pkgPath, 'utf8');
      const pkgJSON = JSON.parse(pkgRaw) as PackageJson;
      if ((pkgJSON.devDependencies && pkgJSON.devDependencies['@playwright/test']) || 
          (pkgJSON.dependencies && pkgJSON.dependencies['@playwright/test'])) {
        hasPlaywright = true;
      }
    }
  } catch(e: unknown) { /* ignore read errors */ }

  if (!hasPlaywright) {
    console.log('⚠️ Playwright not installed. Skipping E2E tests.');
    process.exit(0);
  }

  // Run Playwright
  try {
    execSync('npx playwright test', { cwd, stdio: 'inherit' });
    console.log('✅ End-to-End tests passed.');
    process.exit(0);
  } catch (error: unknown) {
    console.error('\n❌ verify-all failed: E2E tests did not pass.');
    process.exit(1);
  }

} catch (error: unknown) {
  process.exit(1);
}

// Ensure this file is treated as a module to avoid TS scope conflicts
export {};
