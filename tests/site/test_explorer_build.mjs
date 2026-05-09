// rtmx:req REQ-XW-119
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const EXPLORER_PATH = resolve(ROOT, 'site', 'src', 'pages', 'Explorer.tsx');

function readExplorer() {
  return readFileSync(EXPLORER_PATH, 'utf8');
}

describe('REQ-XW-119: Unified Build view with 4 SIDC versions', () => {
  it('Build tab contains 4 SIDC inputs (B, C, D, E)', () => {
    const source = readExplorer();
    assert.ok(source.includes('b-sidc-input'), 'Must have B SIDC input');
    assert.ok(source.includes('c-sidc-input'), 'Must have C SIDC input');
    assert.ok(source.includes('d-sidc-input'), 'Must have D SIDC input');
    assert.ok(source.includes('e-sidc-input'), 'Must have E SIDC input');
  });

  it('contains cross-update logic with b2c, c2d-reference imports', () => {
    const source = readExplorer();
    assert.ok(source.includes("b2c.json"), 'Must import b2c.json crosswalk data');
    assert.ok(source.includes("c2d-reference.json"), 'Must import c2d-reference.json crosswalk data');
    assert.ok(source.includes("b2d.json"), 'Must import b2d.json crosswalk data');
  });

  it('contains entity search input', () => {
    const source = readExplorer();
    assert.ok(source.includes('entity-search-input'), 'Must have entity search input');
    assert.ok(source.includes('entitySearch'), 'Must have entity search state');
  });

  it('contains version labels for all four versions', () => {
    const source = readExplorer();
    assert.ok(source.includes('2525B'), 'Must show 2525B label');
    assert.ok(source.includes('2525C'), 'Must show 2525C label');
    assert.ok(source.includes('2525D'), 'Must show 2525D label');
    assert.ok(source.includes('2525E'), 'Must show 2525E label');
  });

  it('contains cross-update helper functions', () => {
    const source = readExplorer();
    assert.ok(source.includes('lookupB2C'), 'Must have B-to-C lookup');
    assert.ok(source.includes('lookupC2D'), 'Must have C-to-D lookup');
    assert.ok(source.includes('lookupD2C'), 'Must have D-to-C reverse lookup');
    assert.ok(source.includes('lookupC2B'), 'Must have C-to-B reverse lookup');
  });

  it('renders MilSymRenderer for each version card', () => {
    const source = readExplorer();
    // The BuildPanel should have 4 MilSymRenderer usages for bSidc, cSidc, dSidc, eSidc
    const buildSection = source.substring(source.indexOf('function BuildPanel'));
    const rendererMatches = buildSection.match(/MilSymRenderer/g);
    assert.ok(rendererMatches && rendererMatches.length >= 4,
      'BuildPanel must render at least 4 MilSymRenderer instances');
  });

  it('retains Browse, Decode, and Compare tabs', () => {
    const source = readExplorer();
    assert.ok(source.includes('BrowsePanel'), 'Must still have BrowsePanel');
    assert.ok(source.includes('DecodePanel'), 'Must still have DecodePanel');
    assert.ok(source.includes('ComparePanel'), 'Must still have ComparePanel');
  });
});
