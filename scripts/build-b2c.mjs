#!/usr/bin/env node
/**
 * REQ-XW-003: Build B-to-C mapping
 *
 * MIL-STD-2525B and 2525C share the same 15-character SIDC structure.
 * B is a subset of C. For each B entity code, the C equivalent is the
 * same SIDC string (identity mapping for shared codes).
 *
 * Reads:
 *   data/mil-std-2525/b-entities.json    - B entity codes
 *   data/mil-std-2525/c2d-reference.json - C codes (with "basic" field)
 *
 * Writes:
 *   data/mil-std-2525/b2c.json - Array of { b_sidc, c_sidc, match_type }
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
const bData = JSON.parse(readFileSync(resolve(DATA_DIR, 'b-entities.json'), 'utf8'));
const c2dData = JSON.parse(readFileSync(resolve(DATA_DIR, 'c2d-reference.json'), 'utf8'));

const bEntities = bData.entities;
const cSymbols = c2dData.c2d.symbols;

// Build a set of C basic SIDCs for lookup
const cBasicSet = new Set(cSymbols.map((s) => s.basic));

console.log(`Loaded ${bEntities.length} B entities, ${cSymbols.length} C symbols`);

// ---------------------------------------------------------------------------
// 2. Build B-to-C identity mapping
// ---------------------------------------------------------------------------
const b2c = [];

for (const bEnt of bEntities) {
  const sidc = bEnt.basic;
  if (cBasicSet.has(sidc)) {
    b2c.push({
      b_sidc: sidc,
      c_sidc: sidc,
      match_type: 'identity',
    });
  }
}

console.log(`  Mapped ${b2c.length} B codes to C (identity match)`);

// ---------------------------------------------------------------------------
// 3. Write output
// ---------------------------------------------------------------------------
const outPath = resolve(DATA_DIR, 'b2c.json');
writeFileSync(outPath, JSON.stringify(b2c, null, 2) + '\n');
console.log(`  Wrote ${outPath}`);
console.log('Done.');
