/**
 * build-verified-crosswalk.mjs
 *
 * Produces verified-crosswalk.json by combining b2d.json with crosswalk-validation.json
 * results. Each entry gets a "confidence" field:
 *   - "exact": non-lossy mapping (direct entity match)
 *   - "modifier": lossy mapping with verified SVG difference
 *   - "unverified": lossy mapping where SVGs are missing
 *
 * Usage: node scripts/build-verified-crosswalk.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const B2D_PATH = resolve(ROOT, 'data', 'mil-std-2525', 'b2d.json');
const VALIDATION_PATH = resolve(ROOT, 'data', 'mil-std-2525', 'crosswalk-validation.json');
const OUTPUT_PATH = resolve(ROOT, 'data', 'mil-std-2525', 'verified-crosswalk.json');

function main() {
  const b2d = JSON.parse(readFileSync(B2D_PATH, 'utf8'));
  const validation = JSON.parse(readFileSync(VALIDATION_PATH, 'utf8'));

  // Build lookup from validation entries
  const validationMap = new Map();
  for (const entry of validation.entries) {
    validationMap.set(entry.b_sidc, entry.status);
  }

  const verifiedMappings = b2d.mappings.map(entry => {
    const status = validationMap.get(entry.b_sidc) || 'unverified';
    let confidence;
    if (!entry.lossy) {
      confidence = 'exact';
    } else if (status === 'modifier') {
      confidence = 'modifier';
    } else {
      confidence = 'unverified';
    }

    return {
      ...entry,
      confidence
    };
  });

  const confidenceSummary = {
    exact: verifiedMappings.filter(m => m.confidence === 'exact').length,
    modifier: verifiedMappings.filter(m => m.confidence === 'modifier').length,
    unverified: verifiedMappings.filter(m => m.confidence === 'unverified').length
  };

  const result = {
    description: 'MIL-STD-2525 B-to-D verified crosswalk with confidence levels',
    generated: new Date().toISOString(),
    references: {
      source: 'b2d.json',
      validation: 'crosswalk-validation.json',
      study: 'study-results.json'
    },
    summary: {
      total: verifiedMappings.length,
      ...confidenceSummary
    },
    mappings: verifiedMappings
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2) + '\n');
  console.log('Verified crosswalk generated:');
  console.log(`  Total: ${result.summary.total}`);
  console.log(`  Exact: ${confidenceSummary.exact}`);
  console.log(`  Modifier: ${confidenceSummary.modifier}`);
  console.log(`  Unverified: ${confidenceSummary.unverified}`);
  console.log(`Output: ${OUTPUT_PATH}`);
}

main();
