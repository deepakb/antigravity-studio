#!/usr/bin/env node
/**
 * seo-linter.ts - Scans for basic SEO requirements (Page metadata)
 * Executed by `studio validate`
 */
import * as fs from 'fs';
import * as path from 'path';

const cwd = process.argv[2] || process.cwd();

function checkNextJsSEO(): void {
  console.log('⏳ Checking Next.js layout metadata for SEO...');
  
  const layoutPath = path.join(cwd, 'app', 'layout.tsx');
  const pagePath = path.join(cwd, 'app', 'page.tsx');
  
  let hasErrors = false;

  // Check layout.tsx
  if (fs.existsSync(layoutPath)) {
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    if (!layoutContent.includes('export const metadata') && !layoutContent.includes('export async function generateMetadata')) {
      console.error('❌ layout.tsx is missing exported metadata (title/description/openGraph).');
      hasErrors = true;
    }
  }

  // Check page.tsx
  if (fs.existsSync(pagePath)) {
    const pageContent = fs.readFileSync(pagePath, 'utf8');
    if (!pageContent.includes('<h1') && !pageContent.includes('h1')) {
      console.warn('⚠️ page.tsx might be missing an <h1> tag. Every page should have exactly one H1 for SEO.');
    }
  }

  if (hasErrors) {
    console.error('\n❌ seo-linter failed.');
    process.exit(1);
  }

  console.log('✅ SEO requirements check passed.');
  process.exit(0);
}

try {
  checkNextJsSEO();
} catch (error: unknown) {
  console.error('\n❌ seo-linter encountered an unexpected error.');
  process.exit(1);
}

// Ensure this file is treated as a module to avoid TS scope conflicts
export {};
