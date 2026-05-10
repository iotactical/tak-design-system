#!/usr/bin/env node
/**
 * Pre-render MIL-STD-2525 symbols to static SVG files using mil-sym-ts (Node).
 * Generates SVGs for all 1,915 entities across 4 affiliations.
 */

import { createRequire } from 'module';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Load mil-sym-ts
const milsym = require('@armyc2.c5isr.renderer/mil-sym-ts');
const { MilStdIconRenderer, MilStdAttributes, RendererSettings } = milsym;

const rs = RendererSettings.getInstance();
rs.setDefaultPixelSize(50);

const renderer = MilStdIconRenderer.getInstance();
console.log('mil-sym-ts ready:', renderer.isReady());

// Load entity data
const entities = JSON.parse(readFileSync(resolve(ROOT, 'data/mil-std-2525/b-entities.json'), 'utf8')).entities;
console.log(`Rendering ${entities.length} entities...`);

const affiliations = [
  { char15: 'F', char20: '3', name: 'friendly' },
  { char15: 'H', char20: '6', name: 'hostile' },
  { char15: 'N', char20: '4', name: 'neutral' },
  { char15: 'U', char20: '1', name: 'unknown' },
];

const outDir = resolve(ROOT, 'site/public/2525');
mkdirSync(outDir, { recursive: true });

let rendered = 0;
let failed = 0;

for (const aff of affiliations) {
  const affDir = resolve(outDir, aff.name);
  mkdirSync(affDir, { recursive: true });

  for (const entity of entities) {
    // Build a clean 15-char SIDC
    let sidc = entity.basic;
    sidc = sidc.charAt(0) + aff.char15 + sidc.substring(2);
    if (sidc.charAt(3) === '*') sidc = sidc.substring(0, 3) + 'P' + sidc.substring(4);
    sidc = sidc.replace(/\*/g, '-');

    const filename = sidc.replace(/[^A-Za-z0-9-]/g, '_') + '.svg';
    const outPath = resolve(affDir, filename);

    try {
      const attrs = new Map();
      attrs.set(MilStdAttributes.PixelSize, '50');
      attrs.set(MilStdAttributes.DrawAsIcon, 'true');

      const result = renderer.RenderSVG(sidc, attrs);
      if (result && result.getSVG) {
        writeFileSync(outPath, result.getSVG());
        rendered++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }
}

console.log(`Done: ${rendered} rendered, ${failed} failed`);
console.log(`Output: ${outDir}`);

// Write a manifest mapping SIDC -> SVG filename
const manifest = {};
for (const aff of affiliations) {
  manifest[aff.name] = {};
  for (const entity of entities) {
    let sidc = entity.basic;
    sidc = sidc.charAt(0) + aff.char15 + sidc.substring(2);
    if (sidc.charAt(3) === '*') sidc = sidc.substring(0, 3) + 'P' + sidc.substring(4);
    sidc = sidc.replace(/\*/g, '-');
    const filename = sidc.replace(/[^A-Za-z0-9-]/g, '_') + '.svg';
    manifest[aff.name][entity.basic] = filename;
  }
}
writeFileSync(resolve(ROOT, 'data/2525-svg-manifest.json'), JSON.stringify(manifest, null, 2));
console.log('Manifest written to data/2525-svg-manifest.json');
