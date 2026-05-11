/**
 * validate-crosswalk.mjs
 *
 * Reads b2d.json and validates lossy entries by checking whether pre-rendered
 * SVG files for the B-key entity and the base D entity differ visually (by file
 * content comparison). Outputs crosswalk-validation.json with summary stats and
 * per-entry validation status.
 *
 * Usage: node scripts/validate-crosswalk.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const B2D_PATH = resolve(ROOT, 'data', 'mil-std-2525', 'b2d.json');
const SVG_DIR = resolve(ROOT, 'icons', 'svg', '2525');
const OUTPUT_PATH = resolve(ROOT, 'data', 'mil-std-2525', 'crosswalk-validation.json');

function buildDSidc(entry) {
  // Build a base D SIDC (entity only, no modifiers) for SVG lookup
  // Format: version(10) + context(0) + identity(3) + ss(2) + status(0) + hq(0) + echelon(00) + entity(6) + s1(00) + s2(00)
  return `1003${entry.d_ss}0000${entry.d_ec}0000`;
}

function buildDSidcWithModifiers(entry) {
  // Build the full D SIDC including sector modifiers
  return `1003${entry.d_ss}0000${entry.d_ec}${entry.d_s1}${entry.d_s2}`;
}

function findSvg(sidc) {
  // Try common SVG path patterns
  const patterns = [
    resolve(SVG_DIR, `${sidc}.svg`),
    resolve(SVG_DIR, sidc.toLowerCase() + '.svg'),
  ];
  for (const p of patterns) {
    if (existsSync(p)) return p;
  }
  return null;
}

function main() {
  if (!existsSync(B2D_PATH)) {
    console.error('b2d.json not found at', B2D_PATH);
    process.exit(1);
  }

  const b2d = JSON.parse(readFileSync(B2D_PATH, 'utf8'));
  const mappings = b2d.mappings;

  let exactMatch = 0;
  let modified = 0;
  let missing = 0;
  let nonLossySkipped = 0;

  const entries = [];

  for (const entry of mappings) {
    if (!entry.lossy) {
      nonLossySkipped++;
      entries.push({
        b_sidc: entry.b_sidc,
        label: entry.label,
        lossy: false,
        validation: 'non-lossy',
        status: 'exact'
      });
      exactMatch++;
      continue;
    }

    // For lossy entries, compare the base entity SVG vs the modified SVG
    const baseSidc = buildDSidc(entry);
    const modSidc = buildDSidcWithModifiers(entry);

    const baseSvgPath = findSvg(baseSidc);
    const modSvgPath = findSvg(modSidc);

    if (!baseSvgPath || !modSvgPath) {
      missing++;
      entries.push({
        b_sidc: entry.b_sidc,
        label: entry.label,
        lossy: true,
        validation: 'missing-svg',
        status: 'unverified',
        base_sidc: baseSidc,
        mod_sidc: modSidc,
        base_found: !!baseSvgPath,
        mod_found: !!modSvgPath
      });
      continue;
    }

    // Compare SVG file contents
    const baseContent = readFileSync(baseSvgPath, 'utf8');
    const modContent = readFileSync(modSvgPath, 'utf8');

    if (baseContent === modContent) {
      // Same visual -- the modifier had no effect
      exactMatch++;
      entries.push({
        b_sidc: entry.b_sidc,
        label: entry.label,
        lossy: true,
        validation: 'svg-identical',
        status: 'exact'
      });
    } else {
      // Different -- modifier changes the symbol
      modified++;
      entries.push({
        b_sidc: entry.b_sidc,
        label: entry.label,
        lossy: true,
        validation: 'svg-differs',
        status: 'modifier'
      });
    }
  }

  const result = {
    description: 'Visual crosswalk validation results',
    generated: new Date().toISOString(),
    summary: {
      total: mappings.length,
      exact_match: exactMatch,
      modified: modified,
      missing: missing,
      non_lossy_skipped: nonLossySkipped
    },
    entries
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2) + '\n');
  console.log('Crosswalk validation complete:');
  console.log(`  Total entries: ${mappings.length}`);
  console.log(`  Exact match (non-lossy or identical SVG): ${exactMatch}`);
  console.log(`  Modified (SVG differs): ${modified}`);
  console.log(`  Missing (SVG not found): ${missing}`);
  console.log(`Output: ${OUTPUT_PATH}`);
}

main();
