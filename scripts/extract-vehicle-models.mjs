#!/usr/bin/env node
/**
 * REQ-XW-070: Extract ATAK vehicle model ZIPs to site/public/models/
 *
 * Reads data/atak-vehicle-models.json for the category/model list.
 * For each model, extracts the ZIP from the ATAK source tree into
 * site/public/models/{category}/{name}/.
 *
 * Each ZIP contains a .DAE file and .dds.png texture files.
 */

import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const VEHICLES_DIR = resolve(
  process.env.HOME,
  'Downloads/atak-master/ATAK/app/src/main/assets/vehicle_models'
);

const MANIFEST_PATH = resolve(ROOT, 'data/atak-vehicle-models.json');
const OUTPUT_DIR = resolve(ROOT, 'site/public/models');

// Read manifest
if (!existsSync(MANIFEST_PATH)) {
  console.error(`Manifest not found: ${MANIFEST_PATH}`);
  console.error('Run scripts/build-vehicle-manifest.mjs first.');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));

console.log(`Extracting ${manifest.totalCount} vehicle models to ${OUTPUT_DIR}`);

let extracted = 0;
let skipped = 0;
let errors = 0;

for (const category of manifest.categories) {
  console.log(`\n[${category.name}] ${category.models.length} models`);

  for (const model of category.models) {
    const zipPath = resolve(VEHICLES_DIR, model.file);
    const outDir = resolve(OUTPUT_DIR, category.name, model.name);

    if (!existsSync(zipPath)) {
      console.log(`  SKIP: ${model.file} (ZIP not found)`);
      skipped++;
      continue;
    }

    mkdirSync(outDir, { recursive: true });

    try {
      execSync(`unzip -o -q "${zipPath}" -d "${outDir}"`, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      extracted++;
      process.stdout.write(`  OK: ${model.name}\n`);
    } catch (err) {
      console.error(`  ERROR: ${model.name} - ${err.message}`);
      errors++;
    }
  }
}

console.log(`\nExtraction complete:`);
console.log(`  Extracted: ${extracted}`);
console.log(`  Skipped:   ${skipped}`);
console.log(`  Errors:    ${errors}`);
console.log(`  Output:    ${OUTPUT_DIR}`);
