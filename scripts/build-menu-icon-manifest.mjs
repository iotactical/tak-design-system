#!/usr/bin/env node
/**
 * TAK Design System - Menu Icon Manifest Builder
 *
 * Reads the ATAK drawable catalog, filters ic_menu entries, checks for
 * existing SVG conversions, and writes data/atak-menu-icons.json.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const catalog = JSON.parse(
  readFileSync(resolve(ROOT, 'data/atak-drawable-catalog.json'), 'utf8')
);

const svgDir = resolve(ROOT, 'icons/svg/atak');

const menuIcons = catalog
  .filter(entry => entry.category === 'ic_menu')
  .map(entry => {
    const svgPath = resolve(svgDir, `${entry.name}.svg`);
    const hasSvg = existsSync(svgPath);
    const description = entry.name
      .replace(/^ic_menu_/, '')
      .replace(/_/g, ' ');
    return {
      name: entry.name,
      hasSvg,
      format: hasSvg ? 'svg' : 'png',
      description,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const outPath = resolve(ROOT, 'data/atak-menu-icons.json');
writeFileSync(outPath, JSON.stringify(menuIcons, null, 2) + '\n');

console.log(`Wrote ${menuIcons.length} menu icons to data/atak-menu-icons.json`);
console.log(`  SVG available: ${menuIcons.filter(i => i.hasSvg).length}`);
console.log(`  PNG only: ${menuIcons.filter(i => !i.hasSvg).length}`);
