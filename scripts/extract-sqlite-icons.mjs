#!/usr/bin/env node
/**
 * TAK Design System - SQLite Icon Palette Extractor
 *
 * Extracts icon bitmaps from the ATAK iconsets.sqlite database and writes:
 *   - PNG files to site/public/palettes/{iconset_name}/{groupName}/{filename}
 *   - Manifest JSON to data/atak-palette-{slug}.json
 *
 * Uses the sqlite3 CLI (writefile) to export BLOB data directly to PNG files.
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DB_PATH = process.argv[2]
  || resolve(process.env.HOME, 'Downloads/atak-master/ATAK/app/src/main/assets/dbs/iconsets.sqlite');

if (!existsSync(DB_PATH)) {
  console.error(`Database not found: ${DB_PATH}`);
  process.exit(1);
}

const PALETTES_DIR = resolve(ROOT, 'site', 'public', 'palettes');
const DATA_DIR = resolve(ROOT, 'data');

// Slug mapping for manifest filenames
const SLUG_MAP = {
  'Default': 'default',
  'Generic Icons': 'generic',
  'OSM': 'osm',
  'Google': 'google',
  'FEMA Icons': 'fema',
  'GeoOps': 'geoops',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sql(query) {
  return execSync(`sqlite3 "${DB_PATH}" "${query}"`, { encoding: 'utf-8' }).trim();
}

function sqlRows(query, separator = '|') {
  const out = sql(query);
  if (!out) return [];
  return out.split('\n').map(line => line.split(separator));
}

// ---------------------------------------------------------------------------
// Main extraction
// ---------------------------------------------------------------------------

console.log(`Extracting icons from: ${DB_PATH}`);

// Fetch all iconsets
const iconsets = sqlRows('SELECT id, name, uid FROM iconsets;');
console.log(`Found ${iconsets.length} iconsets`);

let totalIcons = 0;

for (const [setId, setName, setUid] of iconsets) {
  const slug = SLUG_MAP[setName] || setName.toLowerCase().replace(/\s+/g, '-');
  console.log(`\nProcessing iconset: ${setName} (${slug})`);

  // Fetch all icons for this set
  const icons = sqlRows(
    `SELECT id, filename, groupName, COALESCE(type2525b, '') FROM icons WHERE iconset_uid='${setUid}' ORDER BY groupName, filename;`
  );
  console.log(`  ${icons.length} icons`);

  // Build group structure for manifest
  const groupMap = new Map();

  for (const [iconId, filename, groupName, type2525b] of icons) {
    // Create output directory
    const paletteDir = resolve(PALETTES_DIR, slug, groupName);
    if (!existsSync(paletteDir)) {
      mkdirSync(paletteDir, { recursive: true });
    }

    // Export bitmap to PNG using sqlite3 writefile
    const outPath = resolve(paletteDir, filename);
    execSync(
      `sqlite3 "${DB_PATH}" "SELECT writefile('${outPath.replace(/'/g, "''")}', bitmap) FROM icons WHERE id=${iconId};"`,
      { encoding: 'utf-8' }
    );

    // Track in manifest group
    if (!groupMap.has(groupName)) {
      groupMap.set(groupName, []);
    }
    groupMap.get(groupName).push({
      filename,
      type2525b: type2525b || undefined,
    });
  }

  // Build manifest
  const groups = [];
  for (const [name, iconsArr] of groupMap) {
    groups.push({ name, icons: iconsArr });
  }

  const manifest = {
    name: setName,
    uid: setUid,
    iconCount: icons.length,
    groups,
  };

  // Write manifest
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  const manifestPath = resolve(DATA_DIR, `atak-palette-${slug}.json`);
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`  Manifest: ${manifestPath}`);

  totalIcons += icons.length;
}

console.log(`\nDone. Extracted ${totalIcons} icons across ${iconsets.length} palettes.`);
