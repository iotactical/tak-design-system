#!/usr/bin/env node
// rtmx:req REQ-XW-250 REQ-XW-251
// Build script: reads source icon catalogs and generates the canonical icon registry
// and radial action mapping. Run via: node scripts/build-icon-registry.mjs

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA = resolve(ROOT, 'data');
const ICONS_SVG = resolve(ROOT, 'icons', 'svg', 'atak');
const ICONS_WEB = resolve(ROOT, 'site', 'public', 'icons');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readJSON(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/** Convert a source name to a stable semantic ID segment. */
function toIdSegment(name) {
  let seg = name
    .toLowerCase()
    .replace(/^ic_menu_/, '')
    .replace(/^ic_/, '')
    .replace(/^nav_/, '')
    .replace(/[_\s]+/g, '-')   // underscores and spaces to hyphens
    .replace(/[^a-z0-9-]/g, '') // strip non-alphanumeric (except hyphens)
    .replace(/-+/g, '-')        // collapse consecutive hyphens
    .replace(/^-|-$/g, '');     // trim leading/trailing hyphens
  // IDs must start with a letter; prefix digit-leading segments
  if (/^\d/.test(seg)) seg = `n${seg}`;
  // Ensure non-empty
  if (!seg) seg = 'unknown';
  return seg;
}

/** Derive a human-readable label from an icon name. */
function toLabel(name) {
  return name
    .replace(/^ic_menu_/, '')
    .replace(/^ic_/, '')
    .replace(/^nav_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/** Check if a file exists relative to repo root. */
function fileExists(relPath) {
  return existsSync(resolve(ROOT, relPath));
}

/** Build formats object from a source name, checking for actual files. */
function buildFormats(name) {
  const formats = {};

  // Check SVG variants
  const svgCandidates = [
    `icons/svg/atak/${name}.svg`,
    `icons/svg/atak/ic_${name}.svg`,
  ];
  for (const p of svgCandidates) {
    if (fileExists(p)) { formats.svg = p; break; }
  }

  // Check PNG in site/public/icons
  const pngCandidates = [
    `site/public/icons/${name}.png`,
    `site/public/icons/ic_${name}.png`,
    `site/public/icons/ic_menu_${name}.png`,
    `site/public/icons/nav_${name}.png`,
  ];
  for (const p of pngCandidates) {
    if (fileExists(p)) { formats.png = p; break; }
  }

  return formats;
}

// ---------------------------------------------------------------------------
// Source: Core icons (atak-core-icons.json)
// ---------------------------------------------------------------------------

function processCoreIcons() {
  const entries = [];
  const data = readJSON(resolve(DATA, 'atak-core-icons.json'));

  for (const item of data) {
    const segment = toIdSegment(item.name);
    const id = `tak.core.${segment}`;
    const formats = buildFormats(item.name);

    // Check site/public/icons directly by name
    const directPng = `site/public/icons/${item.name}.png`;
    if (!formats.png && fileExists(directPng)) formats.png = directPng;

    if (Object.keys(formats).length === 0) continue; // skip entries with no files

    entries.push({
      id,
      name: toLabel(item.name),
      source: 'core',
      category: item.category || 'other',
      tags: [item.category, segment.split('-')[0]].filter(Boolean),
      formats,
    });
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Source: Menu icons (atak-menu-icons.json)
// ---------------------------------------------------------------------------

function processMenuIcons() {
  const entries = [];
  const data = readJSON(resolve(DATA, 'atak-menu-icons.json'));

  for (const item of data) {
    const segment = toIdSegment(item.name);
    const id = `tak.menu.${segment}`;
    const formats = {};

    // Check SVG
    const svgPath = `icons/svg/atak/${item.name}.svg`;
    if (fileExists(svgPath)) formats.svg = svgPath;

    // Check PNG
    const pngPath = `site/public/icons/${item.name}.png`;
    if (fileExists(pngPath)) formats.png = pngPath;

    if (Object.keys(formats).length === 0) continue;

    entries.push({
      id,
      name: item.description || toLabel(item.name),
      source: 'menu',
      category: 'menu',
      tags: ['menu', segment.split('-')[0]].filter(Boolean),
      formats,
    });
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Source: Nav icons (atak-nav-icons.json)
// ---------------------------------------------------------------------------

function processNavIcons() {
  const entries = [];
  const data = readJSON(resolve(DATA, 'atak-nav-icons.json'));

  for (const item of data) {
    const segment = toIdSegment(item.name);
    const id = `tak.nav.${segment}`;
    const formats = {};

    const svgPath = `icons/svg/atak/${item.name}.svg`;
    if (fileExists(svgPath)) formats.svg = svgPath;

    const pngPath = `site/public/icons/${item.name}.png`;
    if (fileExists(pngPath)) formats.png = pngPath;

    if (Object.keys(formats).length === 0) continue;

    entries.push({
      id,
      name: toLabel(item.name),
      source: 'nav',
      category: item.section || 'other',
      tags: ['nav', item.section, segment.split('-')[0]].filter(Boolean),
      formats,
    });
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Source: Radial menus (atak-radial-menus.json)
// Extracts unique icon references and builds radial action map
// ---------------------------------------------------------------------------

function processRadialMenus() {
  const data = readJSON(resolve(DATA, 'atak-radial-menus.json'));
  const iconEntries = [];
  const actionEntries = [];
  const seenIcons = new Map(); // icon path -> semantic ID
  const actionMap = new Map(); // action path -> { iconId, label, menus[] }

  for (const menu of data.menus) {
    for (const item of menu.items) {
      if (!item.icon) continue;

      const iconPath = item.icon; // e.g. "icons/delete.png"
      const iconFile = basename(iconPath, extname(iconPath)); // "delete"

      // Build or reuse semantic ID for this icon
      if (!seenIcons.has(iconPath)) {
        const segment = toIdSegment(iconFile);
        const id = `tak.radial.${segment}`;
        seenIcons.set(iconPath, id);

        // Find actual files
        const formats = {};
        // Check site/public/icons for the referenced file
        const webPng = `site/public/icons/${iconFile}.png`;
        if (fileExists(webPng)) formats.png = webPng;
        const webXml = `site/public/icons/${iconFile}.xml`;
        if (fileExists(webXml)) formats.xml = webXml;
        // Check SVG directory
        const svgPath = `icons/svg/atak/ic_${iconFile}.svg`;
        if (fileExists(svgPath)) formats.svg = svgPath;
        const svgPathDirect = `icons/svg/atak/${iconFile}.svg`;
        if (!formats.svg && fileExists(svgPathDirect)) formats.svg = svgPathDirect;

        // Also check common name variants in site/public/icons
        if (Object.keys(formats).length === 0) {
          const altPng = `site/public/icons/${iconFile}.png`;
          if (fileExists(altPng)) formats.png = altPng;
        }

        iconEntries.push({
          id,
          name: toLabel(iconFile),
          source: 'radial',
          category: 'action',
          tags: ['radial', 'action', segment],
          formats,
        });
      }

      // Build action entry
      if (item.action) {
        const iconId = seenIcons.get(iconPath);
        if (actionMap.has(item.action)) {
          actionMap.get(item.action).menus.push(menu.name);
        } else {
          // Derive label from action path: "actions/remove.xml" -> "Remove"
          const actionFile = basename(item.action, '.xml');
          const label = actionFile
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());

          actionMap.set(item.action, {
            action: item.action,
            iconId,
            label,
            menus: [menu.name],
          });
        }
      }
    }
  }

  // Deduplicate menu lists
  for (const entry of actionMap.values()) {
    entry.menus = [...new Set(entry.menus)];
    actionEntries.push(entry);
  }

  return { iconEntries, actionEntries };
}

// ---------------------------------------------------------------------------
// rtmx:req REQ-XW-255
// Source: Drawable catalog (atak-drawable-catalog.json)
// ---------------------------------------------------------------------------

function processDrawables(existingIds) {
  const entries = [];
  const data = readJSON(resolve(DATA, 'atak-drawable-catalog.json'));

  for (const item of data) {
    const segment = toIdSegment(item.name);
    const id = `tak.drawable.${segment}`;
    if (existingIds.has(id)) continue;

    const formats = {};
    // Only include entries with actual web-accessible files
    const pngPath = `site/public/icons/${item.name}.png`;
    if (fileExists(pngPath)) formats.png = pngPath;
    if (item.format === 'png') {
      const altPng = `site/public/icons/${item.name}.${item.format}`;
      if (!formats.png && fileExists(altPng)) formats.png = altPng;
    }

    entries.push({
      id,
      name: toLabel(item.name),
      source: 'drawable',
      category: item.category || 'other',
      tags: ['drawable', item.category, item.type].filter(Boolean),
      formats,
    });
    existingIds.add(id);
  }
  return entries;
}

// ---------------------------------------------------------------------------
// rtmx:req REQ-XW-256
// Source: Iconsets (atak-iconset-*.json)
// ---------------------------------------------------------------------------

function processIconsets(existingIds) {
  const entries = [];
  const files = readdirSync(DATA).filter(f => f.startsWith('atak-iconset-') && f.endsWith('.json'));

  for (const file of files) {
    const data = readJSON(resolve(DATA, file));
    const setName = data.iconset || file.replace('atak-iconset-', '').replace('.json', '');

    for (const icon of data.icons || []) {
      const iconName = basename(icon.name, extname(icon.name));
      const segment = toIdSegment(iconName);
      const id = `tak.iconset.${setName}.${segment}`;
      if (existingIds.has(id)) continue;

      const formats = {};
      const palettePath = `site/public/palettes/${setName}/${icon.path || icon.name}`;
      if (fileExists(palettePath)) formats.png = palettePath;

      entries.push({
        id,
        name: toLabel(iconName),
        source: 'iconset',
        category: setName,
        tags: ['iconset', setName],
        formats,
      });
      existingIds.add(id);
    }
  }
  return entries;
}

// ---------------------------------------------------------------------------
// rtmx:req REQ-XW-256
// Source: Palettes (atak-palette-*.json)
// ---------------------------------------------------------------------------

function processPalettes(existingIds) {
  const entries = [];
  const files = readdirSync(DATA).filter(f => f.startsWith('atak-palette-') && f.endsWith('.json'));

  for (const file of files) {
    const data = readJSON(resolve(DATA, file));
    const paletteName = data.name?.toLowerCase().replace(/\s+/g, '-') || file.replace('atak-palette-', '').replace('.json', '');

    for (const group of data.groups || []) {
      const groupName = group.name?.toLowerCase().replace(/\s+/g, '-') || 'other';

      for (const icon of group.icons || []) {
        const iconName = basename(icon.filename, extname(icon.filename));
        const segment = toIdSegment(iconName);
        const id = `tak.palette.${paletteName}.${groupName}.${segment}`;
        if (existingIds.has(id)) continue;

        const formats = {};
        const palettePath = `site/public/palettes/${paletteName}/${group.name}/${icon.filename}`;
        if (fileExists(palettePath)) formats.png = palettePath;

        entries.push({
          id,
          name: toLabel(iconName),
          source: 'palette',
          category: groupName,
          tags: ['palette', paletteName, groupName],
          formats,
        });
        existingIds.add(id);
      }
    }
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log('Building icon registry...');

const coreEntries = processCoreIcons();
console.log(`  Core icons: ${coreEntries.length}`);

const menuEntries = processMenuIcons();
console.log(`  Menu icons: ${menuEntries.length}`);

const navEntries = processNavIcons();
console.log(`  Nav icons: ${navEntries.length}`);

const { iconEntries: radialIcons, actionEntries } = processRadialMenus();
console.log(`  Radial icons: ${radialIcons.length}`);
console.log(`  Radial actions: ${actionEntries.length}`);

// Collect all IDs so far
const allEntries = [...coreEntries, ...menuEntries, ...navEntries, ...radialIcons];
const existingIds = new Set(allEntries.map(e => e.id));

// Add SVG-only icons not already covered
const svgFiles = readdirSync(ICONS_SVG).filter(f => f.endsWith('.svg'));
const svgEntries = [];
for (const file of svgFiles) {
  const name = basename(file, '.svg');
  const segment = toIdSegment(name);
  const candidateIds = [
    `tak.core.${segment}`,
    `tak.menu.${segment}`,
    `tak.nav.${segment}`,
    `tak.radial.${segment}`,
  ];
  if (candidateIds.some(id => existingIds.has(id))) continue;

  const id = `tak.svg.${segment}`;
  if (existingIds.has(id)) continue;

  const formats = { svg: `icons/svg/atak/${file}` };
  const pngPath = `site/public/icons/${name}.png`;
  if (fileExists(pngPath)) formats.png = pngPath;

  svgEntries.push({
    id,
    name: toLabel(name),
    source: 'svg',
    category: 'ui',
    tags: ['svg', segment.split('-')[0]].filter(Boolean),
    formats,
  });
  existingIds.add(id);
}
console.log(`  SVG-only icons: ${svgEntries.length}`);

// Process drawables, iconsets, and palettes
const drawableEntries = processDrawables(existingIds);
console.log(`  Drawable icons: ${drawableEntries.length}`);

const iconsetEntries = processIconsets(existingIds);
console.log(`  Iconset icons: ${iconsetEntries.length}`);

const paletteEntries = processPalettes(existingIds);
console.log(`  Palette icons: ${paletteEntries.length}`);

// Merge and sort
const registry = [...allEntries, ...svgEntries, ...drawableEntries, ...iconsetEntries, ...paletteEntries]
  .sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

// Deduplicate by ID (keep first occurrence -- source priority: radial > menu > nav > core > svg)
const deduped = [];
const finalIds = new Set();
for (const entry of registry) {
  if (!finalIds.has(entry.id)) {
    finalIds.add(entry.id);
    deduped.push(entry);
  }
}

console.log(`  Total unique entries: ${deduped.length}`);

// Write registry
const registryPath = resolve(DATA, 'tak-icon-registry.json');
writeFileSync(registryPath, JSON.stringify(deduped, null, 2) + '\n');
console.log(`  Wrote ${registryPath}`);

// Write radial action map
const radialMap = {
  $schema: '../schemas/tak-radial-action-icons.schema.json',
  actions: actionEntries.sort((a, b) => a.action < b.action ? -1 : a.action > b.action ? 1 : 0),
};
const radialPath = resolve(DATA, 'tak-radial-action-icons.json');
writeFileSync(radialPath, JSON.stringify(radialMap, null, 2) + '\n');
console.log(`  Wrote ${radialPath}`);

// ---------------------------------------------------------------------------
// rtmx:req REQ-XW-254
// Generate focused index files for lightweight consumption
// ---------------------------------------------------------------------------

// icons.index.json: id -> primary format path (prefer svg > png)
const iconsIndex = {};
for (const entry of deduped) {
  const path = entry.formats.svg || entry.formats.png || Object.values(entry.formats)[0];
  if (path) iconsIndex[entry.id] = path;
}
const iconsIndexPath = resolve(DATA, 'icons.index.json');
writeFileSync(iconsIndexPath, JSON.stringify(iconsIndex, null, 2) + '\n');
console.log(`  Wrote ${iconsIndexPath} (${Object.keys(iconsIndex).length} entries)`);

// radial.index.json: action path -> { id, format path }
const radialIndex = {};
for (const a of radialMap.actions) {
  const entry = deduped.find(e => e.id === a.iconId);
  const path = entry ? (entry.formats.png || entry.formats.svg || '') : '';
  radialIndex[a.action] = { id: a.iconId, path };
}
const radialIndexPath = resolve(DATA, 'radial.index.json');
writeFileSync(radialIndexPath, JSON.stringify(radialIndex, null, 2) + '\n');
console.log(`  Wrote ${radialIndexPath} (${Object.keys(radialIndex).length} entries)`);

// index.json: master manifest
const manifest = {
  version: '0.1.0',
  generated: new Date().toISOString(),
  indexes: {
    icons: './icons.index.json',
    radial: './radial.index.json',
  },
  registries: {
    icons: './tak-icon-registry.json',
    radialActions: './tak-radial-action-icons.json',
  },
  schemas: {
    iconRegistry: '../schemas/tak-icon-registry.schema.json',
    radialActions: '../schemas/tak-radial-action-icons.schema.json',
  },
};
const manifestPath = resolve(DATA, 'index.json');
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`  Wrote ${manifestPath}`);

console.log('Icon registry build complete.');
