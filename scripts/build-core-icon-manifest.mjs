#!/usr/bin/env node
/**
 * REQ-APK-001: ATAK core asset icon inventory
 *
 * Scans ATAK core icon PNGs and produces a categorized manifest
 * at data/atak-core-icons.json.
 */

import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const ICONS_DIR = resolve(
  process.env.HOME,
  'Downloads/atak-master/ATAK/app/src/main/assets/icons'
);

function classify(name) {
  if (name.startsWith('above_') || name.startsWith('below_')) return 'altitude';
  if (name.startsWith('reference_point_') || name.startsWith('reference_point-')) return 'reference';
  if (name.startsWith('sensor_')) return 'sensor';
  if (name.startsWith('alarm_') || name.startsWith('alarm-')) return 'alarm';
  return 'other';
}

// Read top-level PNGs only (no subdirs)
const files = readdirSync(ICONS_DIR, { withFileTypes: true })
  .filter(d => d.isFile() && d.name.endsWith('.png'))
  .map(d => d.name);

const entries = files
  .map(f => {
    const name = f.replace(/\.png$/, '');
    return { name, category: classify(name) };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const outDir = resolve(ROOT, 'data');
mkdirSync(outDir, { recursive: true });

const outPath = resolve(outDir, 'atak-core-icons.json');
writeFileSync(outPath, JSON.stringify(entries, null, 2) + '\n');

console.log(`Wrote ${entries.length} icons to ${outPath}`);
