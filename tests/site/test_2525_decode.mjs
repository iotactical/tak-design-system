// rtmx:req REQ-XW-102
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const EXPLORER = resolve(ROOT, 'site', 'src', 'pages', 'Explorer.tsx');
const source = readFileSync(EXPLORER, 'utf8');

describe('REQ-XW-102: 2525 Decode mode', () => {
  it('Explorer.tsx has DecodePanel component', () => {
    assert.ok(
      source.includes('function DecodePanel()'),
      'Explorer.tsx must define a DecodePanel component'
    );
  });

  it('Decode tab is rendered when activeTab is decode', () => {
    assert.ok(
      source.includes("activeTab === 'decode' && <DecodePanel"),
      'Explorer must render DecodePanel for decode tab'
    );
  });

  it('handles 15-char B/C SIDCs', () => {
    assert.ok(
      source.includes('sidc.length === 15'),
      'DecodePanel must detect 15-char (B/C) SIDCs'
    );
    assert.ok(
      source.includes("format: 'B/C (15-char)'"),
      'DecodePanel must label 15-char SIDCs as B/C format'
    );
  });

  it('handles 20-char D/E SIDCs', () => {
    assert.ok(
      source.includes('sidc.length === 20'),
      'DecodePanel must detect 20-char (D/E) SIDCs'
    );
    assert.ok(
      source.includes("format: 'D/E (20-char)'"),
      'DecodePanel must label 20-char SIDCs as D/E format'
    );
  });

  it('parses B/C fields (Coding Scheme, Affiliation, Battle Dimension, Function ID)', () => {
    const bcFields = ['Coding Scheme', 'Affiliation', 'Battle Dimension', 'Function ID', 'Country Code'];
    for (const field of bcFields) {
      assert.ok(
        source.includes(`name: '${field}'`),
        `DecodePanel must parse B/C field: ${field}`
      );
    }
  });

  it('parses D/E fields (Version, Standard Identity, Symbol Set, Entity)', () => {
    const deFields = ['Version', 'Standard Identity', 'Symbol Set', 'Status', 'Entity'];
    for (const field of deFields) {
      assert.ok(
        source.includes(`name: '${field}'`),
        `DecodePanel must parse D/E field: ${field}`
      );
    }
  });

  it('integrates B2D crosswalk for format conversion', () => {
    assert.ok(
      source.includes('b2dMappings'),
      'Explorer must use b2dMappings for crosswalk'
    );
    assert.ok(
      source.includes('crosswalkSection'),
      'DecodePanel must render a crosswalk section'
    );
    assert.ok(
      source.includes('crosswalk.bSidc') && source.includes('crosswalk.dSidc'),
      'Crosswalk must show both B and D SIDCs'
    );
  });
});
