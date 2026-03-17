#!/usr/bin/env node
/**
 * security-scan.ts - Scans for hardcoded secrets and known vulnerabilities
 * Executed by `studio validate`
 */
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);
const cwd = args.find(a => !a.startsWith('--')) || process.cwd();
const isJson = args.includes('--json');

const BAD_PATTERNS = [
  { id: 'hardcoded-password', pattern: /password\s*=\s*['"][^'"]+['"]/i, message: 'Potential hardcoded password found' },
  { id: 'hardcoded-secret', pattern: /secret\s*=\s*['"][^'"]+['"]/i, message: 'Potential hardcoded secret found' },
  { id: 'hardcoded-apikey', pattern: /api_?key\s*=\s*['"][^'"]+['"]/i, message: 'Potential hardcoded API key found' },
  { id: 'jwt-token', pattern: /eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, message: 'JWT-like token detected in source' },
];

const issues: any[] = [];

function scanDirectory(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (['node_modules', '.git', '.next', 'dist', 'out', 'package-lock.json', '.agent'].includes(file)) continue;
    
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(file)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        for (const pattern of BAD_PATTERNS) {
          if (pattern.pattern.test(line)) {
            issues.push({
              id: pattern.id,
              severity: 'error',
              message: pattern.message,
              file: path.relative(cwd, fullPath),
              line: index + 1,
            });
            
            if (!isJson) {
              console.error(`❌ ${pattern.message} in ${fullPath}:${index + 1}`);
            }
          }
        }
      });
    }
  }
}

try {
  if (!isJson) console.log('⏳ Scanning source code for hardcoded secrets...');
  scanDirectory(cwd);
  
  const result = {
    passed: issues.length === 0,
    summary: issues.length === 0 ? 'No secrets detected' : `${issues.length} security risks found`,
    issues: issues
  };

  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (issues.length > 0) {
      console.error(`\n❌ security-scan failed: ${issues.length} secrets detected.`);
      process.exit(1);
    }
    console.log('✅ Code secret scan passed.');
  }
  process.exit(result.passed ? 0 : 1);
} catch (error: unknown) {
  if (isJson) {
    console.log(JSON.stringify({ passed: false, summary: 'Scan failed due to internal error', issues: [] }));
  } else {
    console.error('\n❌ security-scan failed.');
  }
  process.exit(1);
}

// Ensure this file is treated as a module to avoid TS scope conflicts
export {};
