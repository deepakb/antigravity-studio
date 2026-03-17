#!/usr/bin/env node
/**
 * security-scan.ts - Scans for hardcoded secrets and known vulnerabilities
 * Executed by `studio validate`
 */
import * as fs from 'fs';
import * as path from 'path';

const cwd = process.argv[2] || process.cwd();

const BAD_PATTERNS = [
  /password\s*=\s*['"][^'"]+['"]/i,
  /secret\s*=\s*['"][^'"]+['"]/i,
  /api_?key\s*=\s*['"][^'"]+['"]/i,
  /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, // JWTs
];

function scanDirectory(dir: string): boolean {
  let hasErrors = false;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (['node_modules', '.git', '.next', 'dist', 'out'].includes(file)) continue;
    
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      hasErrors = scanDirectory(fullPath) || hasErrors;
    } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const pattern of BAD_PATTERNS) {
        if (pattern.test(content)) {
          console.error(`❌ Potential hardcoded secret found in ${fullPath}`);
          hasErrors = true;
        }
      }
    }
  }
  return hasErrors;
}

try {
  console.log('⏳ Scanning source code for hardcoded secrets...');
  const hasSecrets = scanDirectory(cwd);
  
  if (hasSecrets) {
    console.error('\n❌ security-scan failed: Secrets detected in source code.');
    process.exit(1);
  }
  
  console.log('✅ Code secret scan passed.');
  process.exit(0);
} catch (error: unknown) {
  console.error('\n❌ security-scan failed.');
  process.exit(1);
}

// Ensure this file is treated as a module to avoid TS scope conflicts
export {};
