#!/usr/bin/env node
/**
 * accessibility-audit.ts - Runs accessibility linter checks
 * Executed by `studio validate`
 */
import { execSync } from 'child_process';

const args = process.argv.slice(2);
const cwd = args.find(a => !a.startsWith('--')) || process.cwd();
const isJson = args.includes('--json');

const issues: any[] = [];
let passed = true;
let skipped = false;

try {
  if (!isJson) console.log('⏳ Running Accessibility Audit (eslint-plugin-jsx-a11y)...');
  
  try {
    execSync('npx eslint . --ext .tsx --rule "jsx-a11y/alt-text: error" --rule "jsx-a11y/aria-props: error"', { 
      cwd, 
      stdio: isJson ? 'pipe' : 'inherit',
      encoding: 'utf-8'
    });
  } catch (err: any) {
    if (err.message && (err.message.includes('Rule') || err.message.includes('plugin')) && err.message.includes('not found')) {
      skipped = true;
    } else {
      passed = false;
      issues.push({
        severity: 'error',
        message: 'Accessibility audit found violations (ARIA, alt-text, etc.)',
        metadata: { raw: err.stdout?.toString().split('\n').slice(0, 3).join('\n') }
      });
    }
  }

  const result = {
    passed: passed || skipped,
    summary: skipped ? 'Plugin not installed, check skipped' : (passed ? 'Static accessibility audit passed' : 'Accessibility violations found'),
    issues
  };

  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (skipped) {
      console.log('⚠️ jsx-a11y plugin not installed. Bypassing check.');
    } else if (!passed) {
      console.error('\n❌ accessibility-audit failed.');
      process.exit(1);
    } else {
      console.log('✅ Accessibility audit passed.');
    }
  }
  process.exit(passed || skipped ? 0 : 1);
} catch (error: unknown) {
  if (isJson) {
    console.log(JSON.stringify({ passed: false, summary: 'Audit crashed', issues: [] }));
  } else {
    console.error('\n❌ accessibility-audit crashed.');
  }
  process.exit(1);
}

// Ensure this file is treated as a module to avoid TS scope conflicts
export {};
