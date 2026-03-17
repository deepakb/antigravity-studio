#!/usr/bin/env node
/**
 * seo-linter.ts - Scans for basic SEO requirements (Page metadata)
 * Executed by `studio validate`
 */
import * as fs from 'fs';
import * as path from 'path';

const args = process.argv.slice(2);
const cwd = args.find(a => !a.startsWith('--')) || process.cwd();
const isJson = args.includes('--json');

const issues: any[] = [];

function checkNextJsSEO() {
  if (!isJson) console.log('⏳ Checking Next.js layout metadata for SEO...');
  
  const layoutPath = path.join(cwd, 'app', 'layout.tsx');
  const pagePath = path.join(cwd, 'app', 'page.tsx');
  
  // Check layout.tsx
  if (fs.existsSync(layoutPath)) {
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    if (!layoutContent.includes('export const metadata') && !layoutContent.includes('export async function generateMetadata')) {
      issues.push({
        severity: 'error',
        message: 'layout.tsx is missing exported metadata (title/description/openGraph)',
        file: 'app/layout.tsx',
      });
    }
  }

  // Check page.tsx
  if (fs.existsSync(pagePath)) {
    const pageContent = fs.readFileSync(pagePath, 'utf8');
    if (!pageContent.includes('<h1') && !pageContent.includes('h1')) {
      issues.push({
        severity: 'warning',
        message: 'page.tsx might be missing an <h1> tag. Every page should have exactly one H1 for SEO.',
        file: 'app/page.tsx',
      });
    }
  }

  const result = {
    passed: !issues.some(i => i.severity === 'error'),
    summary: issues.length === 0 ? 'SEO requirements check passed' : `Found ${issues.length} SEO issue(s)`,
    issues: issues
  };

  if (isJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    issues.forEach(issue => {
      const type = issue.severity === 'error' ? '❌' : '⚠️';
      console.log(`${type} ${issue.message} in ${issue.file}`);
    });
    
    if (!result.passed) {
      console.error('\n❌ seo-linter failed.');
      process.exit(1);
    }
    console.log('✅ SEO requirements check passed.');
  }
}

try {
  checkNextJsSEO();
} catch (error: unknown) {
  if (isJson) {
    console.log(JSON.stringify({ passed: false, summary: 'Linter encountered an unexpected error', issues: [] }));
  } else {
    console.error('\n❌ seo-linter encountered an unexpected error.');
  }
  process.exit(1);
}

// Ensure this file is treated as a module to avoid TS scope conflicts
export {};
