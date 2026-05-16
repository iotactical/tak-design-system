#!/usr/bin/env node
/**
 * CI validation for MIL-STD-2525 doctrine data files.
 * Checks: schema structure, cross-ref integrity, embedding completeness, safety coverage.
 */
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const doctrineDir = join(root, 'data/mil-std-2525/doctrine');

let errors = 0;
let warnings = 0;

function fail(msg) { console.error(`  FAIL: ${msg}`); errors++; }
function warn(msg) { console.warn(`  WARN: ${msg}`); warnings++; }
function pass(msg) { console.log(`  OK: ${msg}`); }

// Load cross-reference data
const b2dRaw = JSON.parse(readFileSync(join(root, 'data/mil-std-2525/b2d.json'), 'utf-8'));
const b2d = Array.isArray(b2dRaw) ? b2dRaw : (b2dRaw.mappings || []);
const b2dCodes = new Set(b2d.map((e) => e.d_ss + e.d_ec));

const msd = JSON.parse(readFileSync(join(root, 'data/mil-std-2525/msd.json'), 'utf-8'));
const msdCodes = new Set();
for (const entry of msd.msd.SYMBOL) {
  if (entry.ss && entry.code) msdCodes.add(entry.ss + entry.code);
  // Entries without ss inherit from previous
}

const VALID_RISK_LEVELS = new Set(['low', 'medium', 'high', 'critical']);
const VALID_GEOMETRY_TYPES = new Set(['line', 'area', 'point', 'arrow']);
const VALID_VERSIONS = ['b', 'c', 'd', 'e'];

// Validate each doctrine file
const files = readdirSync(doctrineDir).filter((f) => f.endsWith('.json'));

if (files.length === 0) {
  fail('No doctrine JSON files found in data/mil-std-2525/doctrine/');
  process.exit(1);
}

for (const file of files) {
  console.log(`\nValidating ${file}...`);
  let data;
  try {
    data = JSON.parse(readFileSync(join(doctrineDir, file), 'utf-8'));
  } catch (e) {
    fail(`Invalid JSON: ${e.message}`);
    continue;
  }

  // Top-level structure
  if (!data.symbolSet) fail('Missing symbolSet');
  if (!data.symbolSetName) fail('Missing symbolSetName');
  if (!Array.isArray(data.entities)) { fail('Missing entities array'); continue; }

  const ss = data.symbolSet;
  const seen = new Set();

  for (const entity of data.entities) {
    const id = `${entity.entityCode} (${entity.label})`;

    // Required fields
    if (!entity.entityCode || !/^\d{6}$/.test(entity.entityCode)) {
      fail(`${id}: Invalid entityCode`);
      continue;
    }
    if (seen.has(entity.entityCode)) fail(`${id}: Duplicate entityCode`);
    seen.add(entity.entityCode);

    if (!entity.label) fail(`${id}: Missing label`);

    // Cross-reference integrity
    const fullCode = ss + entity.entityCode;
    if (!b2dCodes.has(fullCode) && !msdCodes.has(fullCode)) {
      warn(`${id}: entityCode not found in b2d.json or msd.json`);
    }

    // Definitions
    if (!entity.definitions) {
      fail(`${id}: Missing definitions`);
    } else {
      let hasAny = false;
      for (const v of VALID_VERSIONS) {
        if (!(v in entity.definitions)) fail(`${id}: Missing definitions.${v}`);
        if (entity.definitions[v]) hasAny = true;
      }
      if (!hasAny) fail(`${id}: All definitions are null -- at least one required`);
    }

    // Usage guidance
    if (!entity.usageGuidance) {
      fail(`${id}: Missing usageGuidance`);
    } else {
      const ug = entity.usageGuidance;
      if (!ug.purpose) fail(`${id}: Missing usageGuidance.purpose`);
      if (!Array.isArray(ug.establishedBy) || ug.establishedBy.length === 0) {
        fail(`${id}: Missing usageGuidance.establishedBy`);
      }
      if (!Array.isArray(ug.doctrinalRules) || ug.doctrinalRules.length === 0) {
        fail(`${id}: Missing usageGuidance.doctrinalRules`);
      }
      if (ug.geometryType && !VALID_GEOMETRY_TYPES.has(ug.geometryType)) {
        fail(`${id}: Invalid geometryType '${ug.geometryType}'`);
      }
    }

    // Safety constraints
    if (!entity.safetyConstraints) {
      fail(`${id}: Missing safetyConstraints`);
    } else {
      const sc = entity.safetyConstraints;
      if (!VALID_RISK_LEVELS.has(sc.riskLevel)) {
        fail(`${id}: Invalid riskLevel '${sc.riskLevel}'`);
      }
      // Critical/high risk must have populated safety fields
      if (sc.riskLevel === 'critical' || sc.riskLevel === 'high') {
        if (!sc.proximityRules || sc.proximityRules.length === 0) {
          warn(`${id}: ${sc.riskLevel} risk but no proximityRules`);
        }
        if (!sc.hierarchyRules || sc.hierarchyRules.length === 0) {
          warn(`${id}: ${sc.riskLevel} risk but no hierarchyRules`);
        }
      }
    }

    // Embedding text
    if (!entity.embeddingText) {
      fail(`${id}: Missing embeddingText`);
    } else if (entity.embeddingText.length < 50) {
      fail(`${id}: embeddingText too short (${entity.embeddingText.length} chars, minimum 50)`);
    }
  }

  pass(`${data.entities.length} entities validated`);
}

// Summary
console.log(`\n${'='.repeat(50)}`);
console.log(`Doctrine validation: ${errors} errors, ${warnings} warnings`);
if (errors > 0) {
  console.error('FAILED');
  process.exit(1);
} else {
  console.log('PASSED');
}
