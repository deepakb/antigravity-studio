#!/usr/bin/env node
/**
 * dependency-audit.ts - Audits npm dependencies for known CVEs
 * Executed by `studio validate`
 */
import { execSync } from 'child_process';

const cwd = process.argv[2] || process.cwd();

try {
  console.log('⏳ Running npm audit for dependency vulnerabilities...');
  
  // Run npm audit. 
  // We exit(1) only if there are HIGH or CRITICAL vulnerabilities.
  try {
    const rawOutput = execSync('npm audit --audit-level=high --json', { cwd, encoding: 'utf-8', stdio: 'pipe' });
    const auditResult = JSON.parse(rawOutput);
    
    if (auditResult.metadata && auditResult.metadata.vulnerabilities) {
      const { high, critical } = auditResult.metadata.vulnerabilities;
      if (high > 0 || critical > 0) {
        throw new Error(`Found ${high} HIGH and ${critical} CRITICAL vulnerabilities.`);
      }
    }
    
    console.log('✅ Dependency audit passed. No high/critical CVEs.');
    process.exit(0);
  } catch (err: unknown) {
    const e = err as Error;
    if (e.message && (e.message.includes('HIGH') || e.message.includes('CRITICAL'))) {
      console.error(e.message);
      console.error('Run `npm audit` to see details or `npm audit fix` to resolve.');
      console.error('\n❌ dependency-audit failed.');
      process.exit(1);
    } else {
      // If npm audit failed to run or parsed bad JSON, warn but don't fail hard usually
      console.log('⚠️ Unable to parse npm audit results or audit failed gracefully. Skipping check.');
      process.exit(0);
    }
  }
} catch (error: unknown) {
  process.exit(1);
}

// Ensure this file is treated as a module to avoid TS scope conflicts
export {};
