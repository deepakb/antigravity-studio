#!/usr/bin/env node
/**
 * ts-check.ts - TypeScript and ESLint validation
 * Executed by `studio validate`
 */
import { execSync } from 'child_process';

const cwd = process.argv[2] || process.cwd();
const isFix = process.argv.includes('--fix');

try {
  console.log('⏳ Running TypeScript compiler check...');
  execSync('npx tsc --noEmit', { cwd, stdio: 'inherit' });
  console.log('✅ TypeScript check passed.\n');

  console.log('⏳ Running ESLint...');
  const eslintArgs = isFix ? '--fix' : '';
  execSync(`npx eslint . --ext .ts,.tsx ${eslintArgs}`, { cwd, stdio: 'inherit' });
  console.log('✅ ESLint check passed.');
  
  process.exit(0);
} catch (error: unknown) {
  console.error('\n❌ ts-check failed.');
  process.exit(1);
}

// Ensure this file is treated as a module to avoid TS scope conflicts
export {};
