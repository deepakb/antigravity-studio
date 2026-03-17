#!/usr/bin/env node
/**
 * ts-check.ts - TypeScript and ESLint validation
 * Executed by `studio validate`
 */
import { execSync } from 'child_process';

const args = process.argv.slice(2);
const cwd = args.find(a => !a.startsWith('--')) || process.cwd();
const isJson = args.includes('--json');
const isFix = args.includes('--fix');

const issues: any[] = [];
let passed = true;

try {
  if (!isJson) console.log('⏳ Running TypeScript compiler check...');
  try {
    execSync('npx tsc --noEmit', { cwd, stdio: isJson ? 'pipe' : 'inherit', encoding: 'utf-8' });
  } catch (e: any) {
    passed = false;
    issues.push({
      severity: 'error',
      message: 'TypeScript compilation failed. Check for syntax or type errors.',
      metadata: { raw: e.stdout?.split('\n').slice(0, 3).join('\n') }
    });
  }

  if (!isJson) console.log('⏳ Running ESLint...');
  try {
    const eslintArgs = isFix ? '--fix' : '';
    execSync(`npx eslint . --ext .ts,.tsx ${eslintArgs}`, { cwd, stdio: isJson ? 'pipe' : 'inherit', encoding: 'utf-8' });
  } catch (e: any) {
    passed = false;
    issues.push({
      severity: 'error',
      message: 'ESLint check failed. Run with --fix to resolve auto-formattable issues.',
      metadata: { raw: e.stdout?.split('\n').slice(0, 3).join('\n') }
    });
  }

  const result = {
    passed,
    summary: passed ? 'TypeScript and ESLint passed' : 'Linting or Type errors found',
    issues
  };

  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (!passed) process.exit(1);
    console.log('✅ All checks passed.');
  }
} catch (error: unknown) {
  if (isJson) {
    console.log(JSON.stringify({ passed: false, summary: 'Check crashed', issues: [] }));
  } else {
    console.error('\n❌ ts-check failed.');
  }
  process.exit(1);
}

// Ensure this file is treated as a module to avoid TS scope conflicts
export {};
