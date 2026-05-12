#!/usr/bin/env node
// rtmx:req REQ-XW-253
// Validates icon registry integrity: schema conformance, referential integrity,
// ID uniqueness, and file existence. Run in CI via: node scripts/validate-registry.mjs

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA = resolve(ROOT, 'data');
const SCHEMAS = resolve(ROOT, 'schemas');

const errors = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

function readJSON(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    errors.push(`Failed to read/parse ${path}: ${e.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// 1. Required files exist
// ---------------------------------------------------------------------------

console.log('Validating icon registry...');

const registryPath = resolve(DATA, 'tak-icon-registry.json');
const radialPath = resolve(DATA, 'tak-radial-action-icons.json');
const indexPath = resolve(DATA, 'index.json');
const iconsIndexPath = resolve(DATA, 'icons.index.json');
const radialIndexPath = resolve(DATA, 'radial.index.json');
const registrySchemaPath = resolve(SCHEMAS, 'tak-icon-registry.schema.json');
const radialSchemaPath = resolve(SCHEMAS, 'tak-radial-action-icons.schema.json');

check(existsSync(registryPath), 'Missing: data/tak-icon-registry.json');
check(existsSync(radialPath), 'Missing: data/tak-radial-action-icons.json');
check(existsSync(indexPath), 'Missing: data/index.json');
check(existsSync(iconsIndexPath), 'Missing: data/icons.index.json');
check(existsSync(radialIndexPath), 'Missing: data/radial.index.json');
check(existsSync(registrySchemaPath), 'Missing: schemas/tak-icon-registry.schema.json');
check(existsSync(radialSchemaPath), 'Missing: schemas/tak-radial-action-icons.schema.json');

if (errors.length > 0) {
  console.error('  FAIL: Missing required files');
  errors.forEach(e => console.error(`    ${e}`));
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 2. Parse all files
// ---------------------------------------------------------------------------

const registry = readJSON(registryPath);
const radial = readJSON(radialPath);
const registrySchema = readJSON(registrySchemaPath);
const radialSchema = readJSON(radialSchemaPath);
const iconsIndex = readJSON(iconsIndexPath);
const radialIndex = readJSON(radialIndexPath);
const manifest = readJSON(indexPath);

if (errors.length > 0) {
  console.error('  FAIL: Parse errors');
  errors.forEach(e => console.error(`    ${e}`));
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 3. Registry validation
// ---------------------------------------------------------------------------

const ID_PATTERN = /^tak\.[a-z][a-z0-9]*(\.[a-z][a-z0-9-]*)*$/;
const allowedSources = registrySchema.$defs.iconEntry.properties.source.enum;
const requiredFields = registrySchema.$defs.iconEntry.required;

check(Array.isArray(registry), 'Registry must be an array');
check(registry.length >= 400, `Registry has only ${registry.length} entries (expected >= 400)`);

const ids = new Set();
for (const entry of registry) {
  // Required fields
  for (const field of requiredFields) {
    check(entry[field] !== undefined, `${entry.id || '?'}: missing required field "${field}"`);
  }
  // ID format
  check(ID_PATTERN.test(entry.id), `Invalid ID format: ${entry.id}`);
  // Source enum
  check(allowedSources.includes(entry.source), `${entry.id}: invalid source "${entry.source}"`);
  // Unique ID
  check(!ids.has(entry.id), `Duplicate ID: ${entry.id}`);
  ids.add(entry.id);

  // File existence (for entries that have formats)
  for (const [fmt, path] of Object.entries(entry.formats)) {
    check(existsSync(resolve(ROOT, path)), `${entry.id}: missing file ${fmt}=${path}`);
  }
}

// Sort order
const idList = registry.map(e => e.id);
const sorted = [...idList].sort();
for (let i = 0; i < idList.length; i++) {
  if (idList[i] !== sorted[i]) {
    errors.push(`Registry not sorted at index ${i}: "${idList[i]}" should be "${sorted[i]}"`);
    break;
  }
}

console.log(`  Registry: ${registry.length} entries, ${ids.size} unique IDs`);

// ---------------------------------------------------------------------------
// 4. Radial action map validation
// ---------------------------------------------------------------------------

check(Array.isArray(radial.actions), 'Radial map must have actions array');

for (const a of radial.actions) {
  check(a.action, 'Radial action missing "action" field');
  check(a.iconId, `${a.action}: missing iconId`);
  check(a.label, `${a.action}: missing label`);
  check(Array.isArray(a.menus) && a.menus.length > 0, `${a.action}: missing or empty menus`);
  // Referential integrity: iconId must exist in registry
  check(ids.has(a.iconId), `${a.action}: iconId "${a.iconId}" not found in registry`);
}

console.log(`  Radial actions: ${radial.actions.length} entries`);

// ---------------------------------------------------------------------------
// 5. Index consistency
// ---------------------------------------------------------------------------

const indexIconCount = Object.keys(iconsIndex).length;
check(indexIconCount > 0, 'icons.index.json is empty');

const radialIndexCount = Object.keys(radialIndex).length;
check(radialIndexCount > 0, 'radial.index.json is empty');

// Every icon index entry should reference a registry ID
for (const id of Object.keys(iconsIndex)) {
  check(ids.has(id), `icons.index.json: unknown ID "${id}"`);
}

// Every radial index entry should reference a valid action
const actionSet = new Set(radial.actions.map(a => a.action));
for (const action of Object.keys(radialIndex)) {
  check(actionSet.has(action), `radial.index.json: unknown action "${action}"`);
}

console.log(`  Icons index: ${indexIconCount} entries`);
console.log(`  Radial index: ${radialIndexCount} entries`);

// ---------------------------------------------------------------------------
// 6. Custom icons validation (if custom/icons.json exists)
// ---------------------------------------------------------------------------

const customPath = resolve(ROOT, 'custom', 'icons.json');
if (existsSync(customPath)) {
  const custom = readJSON(customPath);
  if (custom && Array.isArray(custom)) {
    for (const entry of custom) {
      check(entry.id?.startsWith('tak.custom.'), `Custom icon "${entry.id}" must use tak.custom.* namespace`);
    }
    console.log(`  Custom icons: ${custom.length} entries`);
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

if (errors.length > 0) {
  console.error(`\nValidation FAILED with ${errors.length} error(s):`);
  for (const e of errors.slice(0, 20)) {
    console.error(`  - ${e}`);
  }
  if (errors.length > 20) {
    console.error(`  ... and ${errors.length - 20} more`);
  }
  process.exit(1);
} else {
  console.log('\nValidation PASSED.');
}
