#!/usr/bin/env node
// rtmx:req REQ-XW-259
// Generates data/release-delta.json tracking which artifact categories changed
// since the last tagged release. Run via: node scripts/build-release-delta.mjs

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function git(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

// Get current commit
const commit = git('git rev-parse HEAD');
const shortCommit = git('git rev-parse --short HEAD');

// Get the last tag (or first commit if no tags)
const lastTag = git('git describe --tags --abbrev=0 2>/dev/null') || git('git rev-list --max-parents=0 HEAD');

// Get changed files since last tag
const changedFiles = git(`git diff --name-only ${lastTag}..HEAD`)
  .split('\n')
  .filter(Boolean);

// Categorize changes
const categories = {
  tokens: [],
  icons: [],
  radialMenus: [],
  components: [],
  data: [],
  schemas: [],
  tests: [],
  ci: [],
};

for (const file of changedFiles) {
  if (file.startsWith('tokens/')) categories.tokens.push(file);
  else if (file.startsWith('icons/') || file.startsWith('site/public/icons/')) categories.icons.push(file);
  else if (file.includes('radial')) categories.radialMenus.push(file);
  else if (file.startsWith('packages/react/src/components/')) categories.components.push(file);
  else if (file.startsWith('data/') && !file.includes('release-delta')) categories.data.push(file);
  else if (file.startsWith('schemas/')) categories.schemas.push(file);
  else if (file.startsWith('tests/')) categories.tests.push(file);
  else if (file.startsWith('.github/')) categories.ci.push(file);
}

const delta = {
  commit,
  shortCommit,
  since: lastTag,
  generated: new Date().toISOString(),
  summary: {},
  changed: categories,
};

// Summary: just category names with counts (for quick scanning)
for (const [key, files] of Object.entries(categories)) {
  if (files.length > 0) delta.summary[key] = files.length;
}

const deltaPath = resolve(ROOT, 'data', 'release-delta.json');
writeFileSync(deltaPath, JSON.stringify(delta, null, 2) + '\n');
console.log(`Release delta: ${changedFiles.length} files changed since ${lastTag}`);
for (const [key, count] of Object.entries(delta.summary)) {
  console.log(`  ${key}: ${count}`);
}
console.log(`Wrote ${deltaPath}`);
