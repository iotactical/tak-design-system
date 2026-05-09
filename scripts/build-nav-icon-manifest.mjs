#!/usr/bin/env node
/**
 * REQ-ICN-004: Build ATAK navigation icon manifest
 *
 * Reads data/atak-drawable-catalog.json, filters category === "nav",
 * checks SVG availability, classifies by sub-prefix section,
 * and writes data/atak-nav-icons.json.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const CATALOG_PATH = resolve(ROOT, 'data/atak-drawable-catalog.json');
const SVG_DIR = resolve(ROOT, 'icons/svg/atak');
const OUTPUT_PATH = resolve(ROOT, 'data/atak-nav-icons.json');

// Section classification by sub-prefix
function classifySection(name) {
  if (name.startsWith('nav_compass')) return 'nav_compass';
  if (name.startsWith('nav_dynamic')) return 'nav_dynamic';
  if (name.startsWith('nav_zoom')) return 'nav_zoom';
  if (name.startsWith('nav_tool')) return 'nav_tool';
  if (name.startsWith('nav_collapse')) return 'nav_collapse';
  if (name.startsWith('nav_child')) return 'nav_child';
  return 'other';
}

const catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));

const navEntries = catalog
  .filter(entry => entry.category === 'nav')
  .map(entry => {
    const svgPath = resolve(SVG_DIR, `${entry.name}.svg`);
    const hasSvg = existsSync(svgPath);
    return {
      name: entry.name,
      hasSvg,
      format: entry.format,
      section: classifySection(entry.name),
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

writeFileSync(OUTPUT_PATH, JSON.stringify(navEntries, null, 2) + '\n');

console.log(`Wrote ${navEntries.length} nav icon entries to ${OUTPUT_PATH}`);
const sections = [...new Set(navEntries.map(e => e.section))];
console.log(`Sections: ${sections.join(', ')}`);
console.log(`SVG coverage: ${navEntries.filter(e => e.hasSvg).length}/${navEntries.length}`);
