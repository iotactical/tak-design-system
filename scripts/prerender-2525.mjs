#!/usr/bin/env node
/**
 * Pre-render MIL-STD-2525 symbols to static SVG files using mil-sym-ts (Node).
 * Uses 20-char D-format SIDCs for proper rendering with entity icons.
 * Maps B/C entities to their D equivalents via crosswalk.
 */

import { createRequire } from 'module';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const milsym = require('@armyc2.c5isr.renderer/mil-sym-ts');
const { MilStdIconRenderer, MilStdAttributes, RendererSettings } = milsym;

const rs = RendererSettings.getInstance();
rs.setDefaultPixelSize(50);
const renderer = MilStdIconRenderer.getInstance();
console.log('mil-sym-ts ready:', renderer.isReady());

// Load crosswalk: B entities -> D mapping
const b2dData = JSON.parse(readFileSync(resolve(ROOT, 'data/mil-std-2525/b2d.json'), 'utf8'));
const mappings = b2dData.mappings;
console.log(`Processing ${mappings.length} B-to-D mappings...`);

const affiliations = [
  { si: '3', name: 'friendly' },   // Friend
  { si: '6', name: 'hostile' },    // Hostile
  { si: '4', name: 'neutral' },    // Neutral
  { si: '1', name: 'unknown' },    // Unknown
];

const outDir = resolve(ROOT, 'site/public/2525');

let rendered = 0;
let failed = 0;
const manifest = {};

for (const aff of affiliations) {
  const affDir = resolve(outDir, aff.name);
  mkdirSync(affDir, { recursive: true });
  manifest[aff.name] = {};

  for (const mapping of mappings) {
    // Build 20-char D SIDC: version(10) + SI(2chars) + SS(2) + status(0) + hqtffd(0) + echelon(00) + entity(6) + s1(2) + s2(2)
    const version = '10';
    const si = '0' + aff.si; // 2 chars: context(0=reality) + affiliation
    const ss = mapping.d_ss.padStart(2, '0');
    const status = '0';
    const hqtffd = '0';
    const echelon = '00';
    const entity = mapping.d_ec.padStart(6, '0');
    const s1 = (mapping.d_s1 || '00').padStart(2, '0');
    const s2 = (mapping.d_s2 || '00').padStart(2, '0');
    const sidc = `${version}${si}${ss}${status}${hqtffd}${echelon}${entity}${s1}${s2}`;

    // Use B basic pattern as the manifest key (for lookup from both B/C and D/E views)
    const bKey = mapping.b_sidc;
    const dKey = `${mapping.d_ss}-${mapping.d_ec}`;
    const filename = `${sidc}.svg`;

    try {
      const mods = new Map();
      const attrs = new Map();
      attrs.set('PIXELSIZE', '50');
      attrs.set('DRAWASICON', 'true');

      // RenderSVG signature: (symbolID, modifiers, attributes)
      const result = renderer.RenderSVG(sidc, mods, attrs);
      if (result && result.getSVG) {
        const ib = result.getImageBounds();
        const w = ib ? ib.getWidth() : 50;
        const h = ib ? ib.getHeight() : 50;
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${result.getSVG()}</svg>`;
        writeFileSync(resolve(affDir, filename), svgContent);
        rendered++;

        // Map both B-format key and D-format key to the same filename
        manifest[aff.name][bKey] = filename;
        manifest[aff.name][dKey] = filename;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }
}

console.log(`Done: ${rendered} rendered, ${failed} failed`);
writeFileSync(resolve(ROOT, 'data/2525-svg-manifest.json'), JSON.stringify(manifest, null, 2));
console.log('Manifest written with both B-key and D-key lookups');
