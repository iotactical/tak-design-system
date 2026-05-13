// rtmx:req REQ-XW-291
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(__dirname, '..', '..', 'site', 'src');
const src = readFileSync(resolve(SITE, 'components', 'MultipointMap.tsx'), 'utf8');

describe('REQ-XW-291: Symbol text labels on map', () => {
  it('defines a label layer ID constant', () => {
    assert.ok(src.includes('LABEL_LAYER_ID'), 'Should define LABEL_LAYER_ID');
  });

  it('adds a symbol layer for text labels', () => {
    assert.ok(src.includes("type: 'symbol'"), 'Should add a symbol type layer');
  });

  it('uses text-field from GeoJSON properties', () => {
    assert.ok(src.includes('text-field'), 'Should set text-field layout property');
  });

  it('sets text-size', () => {
    assert.ok(src.includes('text-size'), 'Should set text-size');
  });

  it('applies text-color from stroke property', () => {
    assert.ok(src.includes('text-color'), 'Should set text-color paint property');
  });

  it('applies text-halo for readability', () => {
    assert.ok(src.includes('text-halo-color'), 'Should have text-halo-color');
    assert.ok(src.includes('text-halo-width'), 'Should have text-halo-width');
  });
});
