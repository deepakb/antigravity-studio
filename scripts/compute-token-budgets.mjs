import fs from 'fs';
import path from 'path';
import { TEMPLATES_DIR, DRY_RUN } from './config.mjs';

const skillsDir = path.join(TEMPLATES_DIR, '.agent', 'skills');
const registryPath = path.join(TEMPLATES_DIR, 'registry.json');

if (!fs.existsSync(registryPath)) {
  console.error(`❌ registry.json not found at: ${registryPath}`);
  console.error(`   Run from the monorepo root or pass --templates-dir <path>`);
  process.exit(1);
}
if (!fs.existsSync(skillsDir)) {
  console.error(`❌ Skills directory not found at: ${skillsDir}`);
  process.exit(1);
}

if (DRY_RUN) console.log('🔍 DRY RUN — no files will be written\n');

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

// Default token budgets for skills without a SKILL.md (reasonable estimates by category)
const categoryDefaults = {
  'Architecture':       850,
  'Security & Auth':    700,
  'DevOps & Cloud':     650,
  'Frontend & UI':      600,
  'Backend & API':      750,
  'Performance':        580,
  'Quality (QA)':       620,
  'AI & Engineering':   700,
  'Mobile':             680,
  'Marketing & SEO':    420,
  'UX/UI Design':       500,
};

let computed = 0, defaulted = 0;
const results = {};

for (const skill of registry.skills) {
  const mdPath = path.join(skillsDir, skill.id, 'SKILL.md');
  if (fs.existsSync(mdPath)) {
    const len = fs.readFileSync(mdPath, 'utf8').length;
    // chars / 4 ≈ tokens, round to nearest 50
    results[skill.id] = Math.round(len / 4 / 50) * 50;
    computed++;
  } else {
    results[skill.id] = categoryDefaults[skill.category] ?? 600;
    defaulted++;
  }
}

console.log('Token budgets computed:');
console.table(Object.entries(results).map(([id, t]) => ({ id, tokens: t })));
console.log(`\nComputed from SKILL.md: ${computed}  |  Defaults used: ${defaulted}`);

// Patch registry.json
registry.skills = registry.skills.map(s => ({
  ...s,
  tokenBudget: results[s.id],
}));

if (DRY_RUN) {
  console.log('\n📝 Would update registry.json with tokenBudget fields (dry run)');
} else {
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  console.log('\n✅ registry.json updated with tokenBudget fields');
}
