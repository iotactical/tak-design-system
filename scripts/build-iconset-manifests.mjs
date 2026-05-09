#!/usr/bin/env node
/**
 * TAK Design System - ATAK Iconset Manifest Builder
 *
 * Reads ATAK iconset ZIP packs (without extracting) and generates
 * JSON manifests listing all PNG icons in each pack.
 *
 * Source ZIPs: ~/Downloads/atak-master/ATAK/app/src/main/assets/iconsets/
 * Output:      data/atak-iconset-{name}.json
 */

import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA_DIR = resolve(ROOT, 'data');
const ICONSETS_DIR = resolve(
  homedir(),
  'Downloads/atak-master/ATAK/app/src/main/assets/iconsets'
);

const PACKS = [
  { zip: 'iconset_responder.zip', iconset: 'responder' },
  { zip: 'iconset_falconview.zip', iconset: 'falconview' },
  { zip: 'iconset_ps_air.zip', iconset: 'air' },
  { zip: 'iconset_wildfire.zip', iconset: 'wildfire' },
  { zip: 'iconset_incident_management.zip', iconset: 'incident' },
];

mkdirSync(DATA_DIR, { recursive: true });

for (const pack of PACKS) {
  const zipPath = resolve(ICONSETS_DIR, pack.zip);
  console.log(`Processing ${pack.zip}...`);

  const output = execSync(`unzip -l "${zipPath}"`, { encoding: 'utf-8' });

  const icons = [];
  for (const line of output.split('\n')) {
    // Lines look like: "  1153  11-20-2023 17:57   Hazardous Materials/icon.png"
    const match = line.match(/^\s*\d+\s+\d{2}-\d{2}-\d{4}\s+\d{2}:\d{2}\s+(.+\.png)$/i);
    if (match) {
      const path = match[1].trim();
      // Use the filename (without directory) as the name
      const name = path.split('/').pop();
      icons.push({ name, path });
    }
  }

  const manifest = {
    iconset: pack.iconset,
    count: icons.length,
    icons,
  };

  const outPath = resolve(DATA_DIR, `atak-iconset-${pack.iconset}.json`);
  writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`  Wrote ${outPath} (${icons.length} icons)`);
}

console.log('Iconset manifest build complete.');
