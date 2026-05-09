// rtmx:req REQ-XW-040
// rtmx:req REQ-XW-041
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const SITE_DIR = resolve(ROOT, 'site');
const PALETTES_DIR = resolve(SITE_DIR, 'public', 'palettes');
const DATA_DIR = resolve(ROOT, 'data');

// All 13 tab IDs and their expected data sources
const TABS = [
  { id: 'markers', label: 'Markers', type: 'markers' },
  { id: 'spotmap', label: 'Spot Map', type: 'spotmap' },
  { id: 'vehicle-models', label: 'Vehicle Models', type: 'vehicle-models' },
  { id: 'google', label: 'Google', type: 'sqlite-palette', dataFile: 'atak-palette-google.json' },
  { id: 'osm', label: 'OSM', type: 'sqlite-palette', dataFile: 'atak-palette-osm.json' },
  { id: 'generic', label: 'Generic Icons', type: 'sqlite-palette', dataFile: 'atak-palette-generic.json' },
  { id: 'fema', label: 'FEMA Icons', type: 'sqlite-palette', dataFile: 'atak-palette-fema.json' },
  { id: 'default', label: 'Default', type: 'sqlite-palette', dataFile: 'atak-palette-default.json' },
  { id: 'falconview', label: 'FalconView', type: 'iconset', dataFile: 'atak-iconset-falconview.json' },
  { id: 'incident', label: 'Incident Mgmt', type: 'iconset', dataFile: 'atak-iconset-incident.json' },
  { id: 'air', label: 'Public Safety Air', type: 'iconset', dataFile: 'atak-iconset-air.json' },
  { id: 'responder', label: 'Responder', type: 'iconset', dataFile: 'atak-iconset-responder.json' },
  { id: 'geoops', label: 'GeoOps', type: 'sqlite-palette', dataFile: 'atak-palette-geoops.json' },
];

const source = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Palettes.tsx'), 'utf8');

// --- XW-040: All 13 tabs have data loaded (no "Extracting" placeholder) ---

describe('REQ-XW-040: Fix broken icon paths across palette tabs', () => {
  it('all 13 tabs are defined in PALETTE_TABS', () => {
    for (const tab of TABS) {
      assert.ok(
        source.includes(`id: '${tab.id}'`),
        `Tab "${tab.id}" must be defined in PALETTE_TABS`
      );
    }
  });

  it('no "Extracting" placeholder text in Palettes.tsx', () => {
    assert.ok(
      !source.includes('Extracting'),
      'Palettes.tsx must not contain "Extracting" placeholder text'
    );
  });

  it('all icon data files exist and have icons', () => {
    for (const tab of TABS) {
      if (!tab.dataFile) continue;
      const filePath = resolve(DATA_DIR, tab.dataFile);
      assert.ok(existsSync(filePath), `Data file ${tab.dataFile} must exist`);
      const data = JSON.parse(readFileSync(filePath, 'utf8'));
      const count = data.count || data.iconCount || data.totalCount;
      assert.ok(count > 0, `${tab.dataFile} must have icons (count: ${count})`);
    }
  });

  it('paletteImgSrc uses icon.name for iconset type (flat ZIP extraction)', () => {
    // For iconset (ZIP-extracted) palettes, the primary path should use icon.name (filename only)
    // because extracted files are flat, not in subdirectories matching the manifest path
    assert.ok(
      source.includes("type === 'iconset'"),
      'paletteImgSrc must check for iconset type'
    );
    // The function should use icon.name for iconset types
    const imgSrcMatch = source.match(/function paletteImgSrc[\s\S]*?^}/m);
    assert.ok(imgSrcMatch, 'paletteImgSrc function must exist');
    assert.ok(
      imgSrcMatch[0].includes('icon.name'),
      'paletteImgSrc must use icon.name for flat ZIP iconsets'
    );
  });

  it('paletteImgSrc uses icon.path for sqlite-palette type (group subdirs)', () => {
    const imgSrcMatch = source.match(/function paletteImgSrc[\s\S]*?^}/m);
    assert.ok(imgSrcMatch, 'paletteImgSrc function must exist');
    assert.ok(
      imgSrcMatch[0].includes('icon.path'),
      'paletteImgSrc must use icon.path for SQLite palettes with group subdirectories'
    );
  });

  it('fallback function tries the opposite path strategy', () => {
    const fallbackMatch = source.match(/function paletteImgFallback[\s\S]*?^}/m);
    assert.ok(fallbackMatch, 'paletteImgFallback function must exist');
    // Fallback for iconset should try icon.path (subdirectory, e.g. responder)
    // Fallback for sqlite should try icon.name (filename only)
    assert.ok(
      fallbackMatch[0].includes('icon.path') && fallbackMatch[0].includes('icon.name'),
      'paletteImgFallback must try both icon.path and icon.name'
    );
  });

  // Spot-check that ZIP-extracted iconset files are flat
  for (const tab of TABS.filter(t => t.type === 'iconset')) {
    it(`${tab.id} palette directory has extracted icon files`, () => {
      const dir = resolve(PALETTES_DIR, tab.id);
      assert.ok(existsSync(dir), `Palette directory ${tab.id}/ must exist`);
      const files = readdirSync(dir).filter(f => f.endsWith('.png'));
      assert.ok(files.length > 0, `${tab.id}/ must contain .png files`);
    });
  }

  // Spot-check that SQLite palette directories have group subdirectories
  for (const tab of TABS.filter(t => t.type === 'sqlite-palette')) {
    it(`${tab.id} palette directory has group subdirectories`, () => {
      const dir = resolve(PALETTES_DIR, tab.id);
      assert.ok(existsSync(dir), `Palette directory ${tab.id}/ must exist`);
      const subdirs = readdirSync(dir).filter(f =>
        statSync(resolve(dir, f)).isDirectory()
      );
      assert.ok(subdirs.length > 0, `${tab.id}/ must contain group subdirectories`);
    });
  }
});

// --- XW-041: Search/filter on all palette tabs with icons ---

describe('REQ-XW-041: Add search/filter to all palette tabs', () => {
  it('search input is shown for all tabs with icons (no threshold)', () => {
    // The old code had "icons.length > 20" - it should now be "icons.length > 0"
    assert.ok(
      source.includes('icons.length > 0'),
      'Search input must be shown when icons.length > 0 (not a higher threshold)'
    );
    assert.ok(
      !source.includes('icons.length > 20'),
      'The old icons.length > 20 threshold must be removed'
    );
  });

  it('search count "X of Y" display is present when filtering', () => {
    assert.ok(
      source.includes('filtered.length'),
      'Must display filtered count'
    );
    assert.ok(
      source.includes('icons.length'),
      'Must display total count'
    );
    // Check for the "X of Y" pattern
    assert.ok(
      source.includes('searchCount'),
      'Must have a searchCount element for displaying filter results'
    );
  });

  it('searchCount CSS class is defined', () => {
    const css = readFileSync(
      resolve(SITE_DIR, 'src', 'pages', 'Palettes.module.css'),
      'utf8'
    );
    assert.ok(
      css.includes('.searchCount'),
      'Palettes.module.css must define .searchCount class'
    );
  });

  it('search input has aria-label for accessibility', () => {
    assert.ok(
      source.includes('aria-label='),
      'Search input must have an aria-label for accessibility'
    );
  });
});
