import fs from 'fs';
import path from 'path';
import { TEMPLATES_DIR, DRY_RUN } from './config.mjs';

const registryPath = path.join(TEMPLATES_DIR, 'registry.json');

if (!fs.existsSync(registryPath)) {
  console.error(`❌ registry.json not found at: ${registryPath}`);
  console.error(`   Run from the monorepo root or pass --templates-dir <path>`);
  process.exit(1);
}

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const skillsDir = path.join(TEMPLATES_DIR, '.agent', 'skills');

if (!fs.existsSync(skillsDir)) {
  console.error(`❌ Skills directory not found at: ${skillsDir}`);
  process.exit(1);
}

if (DRY_RUN) console.log('🔍 DRY RUN — no files will be written\n');

const skillMap = Object.fromEntries(registry.skills.map(s => [s.id, s]));
const subdirs = fs.readdirSync(skillsDir);
let processed = 0, skipped = 0;

for (const id of subdirs) {
  const skillPath = path.join(skillsDir, id, 'SKILL.md');
  if (!fs.existsSync(skillPath)) continue;

  const content = fs.readFileSync(skillPath, 'utf8');
  if (content.startsWith('---')) {
    console.log(`⏭  Skipping ${id} (already has frontmatter)`);
    skipped++;
    continue;
  }

  const skillInfo = skillMap[id] || { name: id, category: 'General' };

  // Extract description from ## Overview section if present
  let description = skillInfo.name;
  const overviewMatch = content.match(/## Overview\s*?\n([\s\S]+?)\n*(?:##|$)/);
  if (overviewMatch) {
    description = overviewMatch[1]
      .replace(/\*\*/g, '')
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (description.length > 150) description = description.substring(0, 147) + '...';
  }

  // Escape double-quotes inside the description to keep YAML valid
  const safeDescription = description.replace(/"/g, '\\"');
  const frontmatter = `---\nname: ${id}\ndescription: "${safeDescription}"\n---\n\n`;

  if (DRY_RUN) {
    console.log(`📝 Would standardize: ${id}`);
    console.log(`   Description: "${safeDescription}"\n`);
  } else {
    fs.writeFileSync(skillPath, frontmatter + content);
    console.log(`✅ Standardized: ${id}`);
  }
  processed++;
}

console.log(`\n📊 Summary: ${processed} standardized, ${skipped} skipped`);
