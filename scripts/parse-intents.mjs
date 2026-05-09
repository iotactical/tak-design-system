#!/usr/bin/env node
/**
 * parse-intents.mjs
 * Parses ATAK BROADCAST.txt into a structured JSON intent catalog.
 * REQ-XW-113
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const inputPath = process.argv[2] || resolve(
  process.env.HOME, 'Downloads', 'atak-backup', 'docs', 'BROADCAST.txt'
);
const outputPath = resolve(ROOT, 'data', 'atak-intents.json');

const raw = readFileSync(inputPath, 'utf8');

// Split into /** ... **/ blocks
const blockRegex = /\/\*\*[\s\S]*?\*\*\//g;
const blocks = raw.match(blockRegex) || [];

const intents = [];

for (const block of blocks) {
  // Extract type
  const typeMatch = block.match(/\*\s*Type:\s*(\S+)/);
  const type = typeMatch ? typeMatch[1] : null;

  // Extract class
  const classMatch = block.match(/\*\s*Class:\s*(?:class\s+)?(\S+)/);
  const className = classMatch ? classMatch[1] : null;

  // A single block can contain multiple Action/Description pairs
  const actionRegex = /\*\s*Action:\s*(.+)/g;
  const descRegex = /\*\s*Description\/Constraints:\s*(.+)/g;

  const actions = [];
  let m;
  while ((m = actionRegex.exec(block)) !== null) {
    actions.push(m[1].trim());
  }

  const descriptions = [];
  while ((m = descRegex.exec(block)) !== null) {
    descriptions.push(m[1].trim());
  }

  if (actions.length === 0) {
    // Block with no action -- skip (some blocks only have Type/Class)
    continue;
  }

  for (let i = 0; i < actions.length; i++) {
    const desc = descriptions[i] || 'none supplied';
    intents.push({
      type: type || 'unknown',
      class: className || 'unknown',
      action: actions[i],
      description: desc === 'none supplied' ? '' : desc,
    });
  }
}

// Group by package namespace (all but last segment of class name, dropping inner class)
function getNamespace(cls) {
  // Remove inner class references (e.g. BluetoothFragment$2 -> BluetoothFragment)
  const base = cls.replace(/\$.*$/, '');
  // Take all but last dot-segment as namespace
  const lastDot = base.lastIndexOf('.');
  return lastDot > 0 ? base.substring(0, lastDot) : base;
}

const groupMap = new Map();
for (const intent of intents) {
  const ns = getNamespace(intent.class);
  if (!groupMap.has(ns)) {
    groupMap.set(ns, []);
  }
  groupMap.get(ns).push(intent);
}

const groups = Array.from(groupMap.entries())
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([namespace, intents]) => ({
    namespace,
    intents: intents.sort((a, b) => a.action.localeCompare(b.action)),
  }));

const catalog = {
  totalCount: intents.length,
  groups,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(catalog, null, 2) + '\n');

console.log(`Parsed ${intents.length} intents into ${groups.length} groups`);
console.log(`Written to ${outputPath}`);
