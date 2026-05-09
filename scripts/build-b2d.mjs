#!/usr/bin/env node
/**
 * REQ-XW-004: Chain B-to-C with C-to-D crosswalk
 * REQ-XW-005: Validate bidirectionality and annotate lossy entries
 *
 * For each B code, finds its C equivalent (from b2c.json), then looks up the
 * C-to-D mapping (from c2d-reference.json) to produce the full B-to-D crosswalk.
 *
 * Reads:
 *   data/mil-std-2525/b2c.json           - B-to-C mapping
 *   data/mil-std-2525/c2d-reference.json - C-to-D mapping reference
 *
 * Writes:
 *   data/mil-std-2525/b2d.json - Full B-to-D crosswalk with lossy annotation
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_DIR = resolve(ROOT, 'data', 'mil-std-2525');

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// ---------------------------------------------------------------------------
// 1. Load source data
// ---------------------------------------------------------------------------
const b2c = JSON.parse(readFileSync(resolve(DATA_DIR, 'b2c.json'), 'utf8'));
const c2dData = JSON.parse(readFileSync(resolve(DATA_DIR, 'c2d-reference.json'), 'utf8'));
const cSymbols = c2dData.c2d.symbols;

// Build lookup from C basic SIDC to D fields
const c2dMap = new Map();
for (const sym of cSymbols) {
  c2dMap.set(sym.basic, sym);
}

console.log(`Loaded ${b2c.length} B-to-C mappings, ${cSymbols.length} C-to-D symbols`);

// ---------------------------------------------------------------------------
// 2. Build B-to-D crosswalk (REQ-XW-004)
// ---------------------------------------------------------------------------
const b2d = [];
const mappedDKeys = new Set();

for (const mapping of b2c) {
  const cSym = c2dMap.get(mapping.c_sidc);
  if (!cSym) continue;

  // Build label from available fields
  const labels = [];
  if (cSym.e) labels.push(cSym.e);
  if (cSym.et) labels.push(cSym.et);
  if (cSym.est) labels.push(cSym.est);

  const entry = {
    b_sidc: mapping.b_sidc,
    d_ss: cSym.ss,
    d_ec: cSym.ec,
    d_s1: cSym.s1 || '00',
    d_s2: cSym.s2 || '00',
    label: labels.join(' - ') || '',
    lossy: false,
  };

  b2d.push(entry);

  // Track which D entities have a B equivalent (by ss+ec+s1+s2 key)
  mappedDKeys.add(`${cSym.ss}:${cSym.ec}:${cSym.s1 || '00'}:${cSym.s2 || '00'}`);
}

console.log(`  Built ${b2d.length} B-to-D mappings`);

// ---------------------------------------------------------------------------
// 3. Validate bidirectionality (REQ-XW-005)
// ---------------------------------------------------------------------------
// Check for D entities that have no B equivalent
let dWithNoB = 0;
const allDKeys = new Set();

for (const sym of cSymbols) {
  const key = `${sym.ss}:${sym.ec}:${sym.s1 || '00'}:${sym.s2 || '00'}`;
  allDKeys.add(key);
  if (!mappedDKeys.has(key)) {
    dWithNoB++;
  }
}

// Annotate lossy: a D-to-B reverse mapping would be lossy if multiple D entries
// map to the same B code, or if the D entity has sector modifiers that the B code
// does not carry distinctly. We check if a D entry that maps back to B would lose
// the s1/s2 modifier information.
for (const entry of b2d) {
  // If the D entity has non-trivial sector modifiers, the B-to-D mapping
  // carries full fidelity, but a D-to-B reverse mapping would lose the
  // modifier distinction (B SIDCs do encode modifiers but in a less
  // structured way). Mark as lossy when s1 or s2 are non-zero.
  if (entry.d_s1 !== '00' || entry.d_s2 !== '00') {
    entry.lossy = true;
  }
}

const lossyCount = b2d.filter((e) => e.lossy).length;
const nonLossyCount = b2d.length - lossyCount;

console.log(`  Lossy entries (D-to-B loses info): ${lossyCount}`);
console.log(`  Non-lossy entries: ${nonLossyCount}`);
console.log(`  D entities with B equivalent: ${mappedDKeys.size}`);
console.log(`  D entities with no B equivalent: ${dWithNoB}`);
console.log(`  Total unique D entities: ${allDKeys.size}`);

// ---------------------------------------------------------------------------
// 4. Write output
// ---------------------------------------------------------------------------
const output = {
  description: 'MIL-STD-2525 B-to-D crosswalk',
  summary: {
    b_to_d_count: b2d.length,
    d_with_b_equivalent: mappedDKeys.size,
    d_without_b_equivalent: dWithNoB,
    lossy_count: lossyCount,
    non_lossy_count: nonLossyCount,
  },
  mappings: b2d,
};

const outPath = resolve(DATA_DIR, 'b2d.json');
writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n');
console.log(`  Wrote ${outPath}`);
console.log('Done.');
