#!/usr/bin/env node
/**
 * REQ-ICN-001: ATAK Drawable Resource Catalog
 *
 * Scans the ATAK source tree drawable directories, deduplicates across
 * density buckets, classifies each resource by type/category/format,
 * and writes data/atak-drawable-catalog.json.
 */

import { readdirSync, readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const ATAK_RES = resolve(
  process.env.HOME,
  'Downloads/atak-master/ATAK/app/src/main/res'
);

if (!existsSync(ATAK_RES)) {
  console.error(`ATAK res directory not found: ${ATAK_RES}`);
  process.exit(1);
}

// Discover all drawable* directories
const drawableDirs = readdirSync(ATAK_RES)
  .filter(d => d.startsWith('drawable'))
  .map(d => ({ name: d, path: resolve(ATAK_RES, d) }));

console.log(`Found ${drawableDirs.length} drawable directories`);

// Collect all files, keyed by base name (without extension)
const registry = new Map();

for (const dir of drawableDirs) {
  const density = dir.name === 'drawable' ? 'default' : dir.name.replace('drawable-', '');
  let files;
  try {
    files = readdirSync(dir.path);
  } catch {
    continue;
  }

  for (const file of files) {
    const ext = extname(file);
    const isNinePatch = file.endsWith('.9.png');
    const name = isNinePatch
      ? basename(file, '.9.png')
      : basename(file, ext);

    if (!registry.has(name)) {
      registry.set(name, {
        name,
        densities: [],
        filePaths: [],
        format: isNinePatch ? '9.png' : ext.slice(1) || 'unknown',
      });
    }

    const entry = registry.get(name);
    if (!entry.densities.includes(density)) {
      entry.densities.push(density);
    }
    // Keep one representative file path for type detection
    if (entry.filePaths.length < 1 || density === 'default') {
      entry.filePaths.push(resolve(dir.path, file));
    }
  }
}

console.log(`Found ${registry.size} unique drawable names`);

// ---------------------------------------------------------------------------
// Type detection for XML files
// ---------------------------------------------------------------------------

function detectXmlType(filePath) {
  let content;
  try {
    content = readFileSync(filePath, 'utf8');
  } catch {
    return 'xml-unknown';
  }

  if (content.includes('pathData')) return 'vector';
  if (content.includes('<selector')) return 'selector';
  if (content.includes('<layer-list')) return 'layer-list';
  if (content.includes('<shape')) return 'shape';
  if (content.includes('<vector')) return 'vector';
  if (content.includes('<animated-vector')) return 'vector';
  if (content.includes('<animation-list')) return 'animation-list';
  if (content.includes('<transition')) return 'transition';
  if (content.includes('<ripple')) return 'ripple';
  if (content.includes('<inset')) return 'inset';
  if (content.includes('<bitmap')) return 'bitmap';
  if (content.includes('<clip')) return 'clip';
  if (content.includes('<rotate')) return 'rotate';
  if (content.includes('<scale')) return 'scale';
  if (content.includes('<level-list')) return 'level-list';
  return 'xml-other';
}

// ---------------------------------------------------------------------------
// Category classification based on prefix
// ---------------------------------------------------------------------------

const CATEGORY_PREFIXES = [
  'ic_menu_',
  'ic_navstack_',
  'ic_route_',
  'ic_track_',
  'ic_hostile_',
  'ic_self_',
  'nav_',
  'btn_',
  'enter_location_',
  'toolbar_',
  'tab_',
  'toggle_',
  'sidemenu_',
  'navcue_',
];

function detectCategory(name) {
  for (const prefix of CATEGORY_PREFIXES) {
    if (name.startsWith(prefix)) {
      return prefix.replace(/_$/, '');
    }
  }
  // Broader ic_ catch-all (after specific ic_ prefixes)
  if (name.startsWith('ic_')) return 'ic_other';
  return 'other';
}

// ---------------------------------------------------------------------------
// Build catalog entries
// ---------------------------------------------------------------------------

const catalog = [];

for (const entry of registry.values()) {
  const format = entry.format;
  let type;

  if (format === 'xml') {
    // Use the first available file path for type detection
    type = detectXmlType(entry.filePaths[0]);
  } else if (format === '9.png') {
    type = 'nine-patch';
  } else if (format === 'png') {
    type = 'png';
  } else if (format === 'jpg' || format === 'jpeg') {
    type = 'jpg';
  } else if (format === 'webp') {
    type = 'webp';
  } else {
    type = format;
  }

  catalog.push({
    name: entry.name,
    type,
    category: detectCategory(entry.name),
    densities: entry.densities.sort(),
    format,
  });
}

// Sort alphabetically
catalog.sort((a, b) => a.name.localeCompare(b.name));

// Write output
const outDir = resolve(ROOT, 'data');
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

const outPath = resolve(outDir, 'atak-drawable-catalog.json');
writeFileSync(outPath, JSON.stringify(catalog, null, 2) + '\n');

console.log(`Wrote ${catalog.length} entries to ${outPath}`);

// Summary stats
const typeCounts = {};
const categoryCounts = {};
for (const e of catalog) {
  typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
  categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
}
console.log('\nType distribution:');
for (const [t, c] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${t}: ${c}`);
}
console.log('\nCategory distribution:');
for (const [t, c] of Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${t}: ${c}`);
}
