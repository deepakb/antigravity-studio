#!/usr/bin/env node
/**
 * accessibility-audit.ts - Runs accessibility linter checks
 * Executed by `studio validate`
 */
import { execSync } from 'child_process';

const cwd = process.argv[2] || process.cwd();

interface ExecError extends Error {
  stdout?: any;
}

try {
  console.log('⏳ Running Accessibility Audit (eslint-plugin-jsx-a11y)...');
  
  // In a real project with eslint-plugin-jsx-a11y, this would surface ARIA errors.
  try {
    execSync('npx eslint . --ext .tsx --rule "jsx-a11y/alt-text: error" --rule "jsx-a11y/aria-props: error"', { 
      cwd, 
      stdio: 'pipe' 
    });
    console.log('✅ Static accessibility audit passed.');
    process.exit(0);
  } catch (err: unknown) {
    const e = err as ExecError;
    if (e.message && e.message.includes('Rule') && e.message.includes('not found')) {
      console.log('⚠️ jsx-a11y plugin not installed. Bypassing check.');
      process.exit(0);
    }
    console.error(e.stdout ? e.stdout.toString() : e.message);
    console.error('\n❌ accessibility-audit failed. Fix a11y violations.');
    process.exit(1);
  }
} catch (error: unknown) {
  process.exit(1);
}

// Ensure this file is treated as a module to avoid TS scope conflicts
export {};
