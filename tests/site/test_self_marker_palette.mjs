// rtmx:req REQ-XW-082
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const PALETTES_SRC = resolve(ROOT, 'site', 'src', 'pages', 'Palettes.tsx');

const source = readFileSync(PALETTES_SRC, 'utf8');

describe('REQ-XW-082: Self Marker palette tab', () => {
  it('Self Marker tab exists in PALETTE_TABS', () => {
    assert.ok(
      source.includes("id: 'self-marker'"),
      'PALETTE_TABS must have self-marker id'
    );
    assert.ok(
      source.includes("label: 'Self Marker'"),
      'Tab label must be Self Marker'
    );
    assert.ok(
      source.includes("type: 'self-marker'"),
      'Tab type must be self-marker'
    );
  });

  it('SelfMarkerPanel renders arrow/heading content', () => {
    assert.ok(
      source.includes('function SelfMarkerPanel'),
      'SelfMarkerPanel function must exist'
    );
    // Check for SVG arrow polygon (heading indicator)
    assert.ok(
      source.includes('polygon'),
      'SelfMarkerPanel must render SVG polygon arrows'
    );
    // Check for heading variations
    assert.ok(
      source.includes('Heading'),
      'SelfMarkerPanel must show heading content'
    );
  });

  it('SelfMarkerPanel shows directional arrows by team color', () => {
    assert.ok(
      source.includes('Heading Arrows by Team Color'),
      'Must show heading arrows section'
    );
    assert.ok(
      source.includes('self-marker-arrow-'),
      'Must have self-marker-arrow test IDs'
    );
  });

  it('SelfMarkerPanel shows heading variations', () => {
    assert.ok(
      source.includes('Heading Variations'),
      'Must show heading variations section'
    );
    assert.ok(
      source.includes('Cardinal directions'),
      'Must reference cardinal directions'
    );
  });

  it('routes self-marker type to SelfMarkerPanel', () => {
    assert.ok(
      source.includes("active.type === 'self-marker'") &&
      source.includes('<SelfMarkerPanel'),
      'Must route self-marker type to SelfMarkerPanel component'
    );
  });
});
