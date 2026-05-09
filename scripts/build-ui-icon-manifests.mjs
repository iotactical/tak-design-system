#!/usr/bin/env node
/**
 * TAK Design System - UI Icon Manifest Builder
 *
 * REQ-ICN-009: Generates data/atak-location-markers.json from the drawable catalog
 *              (entries with category === "enter_location").
 *
 * REQ-ICN-010: Generates data/atak-chrome-drawables.json from the drawable catalog
 *              (entries with category in toolbar, tab, toggle).
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const catalogPath = resolve(ROOT, 'data', 'atak-drawable-catalog.json');
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));

const svgDir = resolve(ROOT, 'icons', 'svg', 'atak');

// ---------------------------------------------------------------------------
// REQ-ICN-009: Location markers
// ---------------------------------------------------------------------------

const KNOWN_COLORS = [
  'black', 'blue', 'brown', 'cyan', 'green', 'grey', 'magenta',
  'orange', 'red', 'white', 'yellow'
];

function extractColor(name) {
  // Pattern: enter_location_spot_<color> or enter_location_spot_<color>_default etc.
  // Also handles enter_location_label variants (no color)
  for (const color of KNOWN_COLORS) {
    if (name.includes(`_${color}`) || name.includes(`_${color}_`)) {
      return color;
    }
  }
  // For "custom" variants, use "custom"
  if (name.includes('_custom_')) {
    return 'custom';
  }
  return null;
}

const locationMarkers = catalog
  .filter(e => e.category === 'enter_location')
  .map(e => {
    const svgFile = resolve(svgDir, `${e.name}.svg`);
    const hasSvg = existsSync(svgFile);
    const color = extractColor(e.name);
    return {
      name: e.name,
      color: color || 'none',
      hasSvg,
      format: e.format
    };
  });

const markersPath = resolve(ROOT, 'data', 'atak-location-markers.json');
writeFileSync(markersPath, JSON.stringify(locationMarkers, null, 2) + '\n');
console.log(`Wrote ${locationMarkers.length} location markers to data/atak-location-markers.json`);

// ---------------------------------------------------------------------------
// REQ-ICN-010: Chrome drawables (toolbar, tab, toggle)
// ---------------------------------------------------------------------------

const CHROME_CATEGORIES = ['toolbar', 'tab', 'toggle'];

const chromeDrawables = catalog
  .filter(e => CHROME_CATEGORIES.includes(e.category))
  .map(e => {
    const svgFile = resolve(svgDir, `${e.name}.svg`);
    const hasSvg = existsSync(svgFile);
    return {
      name: e.name,
      chromeType: e.category,
      hasSvg,
      format: e.format
    };
  });

const chromePath = resolve(ROOT, 'data', 'atak-chrome-drawables.json');
writeFileSync(chromePath, JSON.stringify(chromeDrawables, null, 2) + '\n');
console.log(`Wrote ${chromeDrawables.length} chrome drawables to data/atak-chrome-drawables.json`);
