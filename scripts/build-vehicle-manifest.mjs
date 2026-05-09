#!/usr/bin/env node
/**
 * REQ-APK-011: ATAK vehicle models inventory
 *
 * Reads vehicle_models/metadata.json and scans subdirectories for .zip files.
 * Produces data/atak-vehicle-models.json with categorized model entries.
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const VEHICLES_DIR = resolve(
  process.env.HOME,
  'Downloads/atak-master/ATAK/app/src/main/assets/vehicle_models'
);

// Read metadata.json for category definitions
const metadata = JSON.parse(readFileSync(resolve(VEHICLES_DIR, 'metadata.json'), 'utf8'));

const categories = metadata.categories.map(cat => {
  const dir = resolve(VEHICLES_DIR, cat.directory);
  const zips = readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isFile() && d.name.endsWith('.zip'))
    .map(d => d.name)
    .sort();

  return {
    name: cat.directory,
    models: zips.map(f => ({
      name: f.replace(/\.zip$/, ''),
      file: `${cat.directory}/${f}`
    }))
  };
});

const totalCount = categories.reduce((sum, c) => sum + c.models.length, 0);

const manifest = { categories, totalCount };

const outDir = resolve(ROOT, 'data');
mkdirSync(outDir, { recursive: true });

const outPath = resolve(outDir, 'atak-vehicle-models.json');
writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n');

console.log(`Wrote ${totalCount} vehicle models across ${categories.length} categories to ${outPath}`);
