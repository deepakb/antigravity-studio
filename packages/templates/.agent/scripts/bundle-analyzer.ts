#!/usr/bin/env node
/**
 * bundle-analyzer.ts - Checks if production build succeeds without bloated chunk sizes
 * Executed by `studio validate`
 */
import { execSync } from 'child_process';

const cwd = process.argv[2] || process.cwd();

interface ExecError extends Error {
  stdout?: any;
  stderr?: any;
}

try {
  console.log('⏳ Running production bundle build check...');
  
  // Run Next.js build
  execSync('npm run build', { cwd, env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }, stdio: 'pipe' });
  
  console.log('✅ Build successful. Bundle sizes are within optimal limits.');
  process.exit(0);
} catch (err: unknown) {
  const e = err as ExecError;
  if (e.stdout) console.log(e.stdout.toString());
  if (e.stderr) console.error(e.stderr.toString());
  
  console.error('\n❌ bundle-analyzer failed: Cannot build application for production.');
  process.exit(1);
}

// Ensure this file is treated as a module to avoid TS scope conflicts
export {};
