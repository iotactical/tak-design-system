#!/usr/bin/env node
/**
 * REQ-ICN-008: Extract ATAK radial menu XML definitions to structured JSON.
 *
 * Scans ~/Downloads/atak-master/ATAK/app/src/main/assets/menus/*.xml,
 * parses each radial/pie menu, and writes a unified JSON to
 * data/atak-radial-menus.json.
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'fs';
import { resolve, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const MENUS_DIR = resolve(
  homedir(),
  'Downloads/atak-master/ATAK/app/src/main/assets/menus'
);
const OUTPUT = resolve(ROOT, 'data', 'atak-radial-menus.json');

/**
 * Extract attribute value from an XML tag string.
 * Returns null if the attribute is not found.
 */
function attr(tag, name) {
  // Match name='value' or name="value"
  const re = new RegExp(`${name}\\s*=\\s*['"]([^'"]*?)['"]`);
  const m = tag.match(re);
  return m ? m[1] : null;
}

/**
 * Parse a single radial menu XML string into a menu object.
 */
function parseMenu(xml, filename) {
  const name = basename(filename, extname(filename));

  // Extract <button .../> elements (may span multiple lines)
  const items = [];
  const buttonRegex = /<button\b([\s\S]*?)\/>/g;
  let match;
  while ((match = buttonRegex.exec(xml)) !== null) {
    const tag = match[1];
    const item = {};

    const action = attr(tag, 'onClick');
    if (action) item.action = action;

    const icon = attr(tag, 'icon');
    if (icon) item.icon = icon;

    const label = attr(tag, 'label') || attr(tag, 'title');
    if (label) item.label = label;

    const submenu = attr(tag, 'submenu');
    if (submenu) item.submenu = submenu;

    // Include additional useful attributes when present
    const angle = attr(tag, 'angle');
    if (angle) item.angle = angle;

    const disabled = attr(tag, 'disabled');
    if (disabled) item.disabled = disabled;

    const selected = attr(tag, 'selected');
    if (selected) item.selected = selected;

    const capability = attr(tag, 'dependsOnCapability');
    if (capability) item.dependsOnCapability = capability;

    items.push(item);
  }

  return { name, items };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const files = readdirSync(MENUS_DIR)
  .filter(f => f.endsWith('.xml'))
  .sort((a, b) => a.localeCompare(b));

console.log(`Found ${files.length} menu XML files in ${MENUS_DIR}`);

const menus = [];
for (const file of files) {
  const xml = readFileSync(resolve(MENUS_DIR, file), 'utf8');
  menus.push(parseMenu(xml, file));
}

// Sort by menu name (without extension) for stable output
menus.sort((a, b) => a.name.localeCompare(b.name));

// Ensure output directory exists
mkdirSync(dirname(OUTPUT), { recursive: true });

const output = { menus };
writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + '\n', 'utf8');

const totalItems = menus.reduce((sum, m) => sum + m.items.length, 0);
console.log(`Wrote ${menus.length} menus (${totalItems} total items) to ${OUTPUT}`);
