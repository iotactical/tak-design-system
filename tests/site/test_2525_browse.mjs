// rtmx:req REQ-XW-086
// rtmx:req REQ-XW-101
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const EXPLORER_SRC = resolve(ROOT, 'site', 'src', 'pages', 'Explorer.tsx');

const source = readFileSync(EXPLORER_SRC, 'utf8');

describe('REQ-XW-086 + REQ-XW-101: Browse mode', () => {
  it('Explorer.tsx has BrowsePanel component', () => {
    assert.ok(
      source.includes('function BrowsePanel'),
      'Explorer.tsx must define BrowsePanel component'
    );
    assert.ok(
      source.includes('<BrowsePanel'),
      'Explorer.tsx must render BrowsePanel'
    );
  });

  it('SYMBOL_SET_NAMES mapping exists with key symbol sets', () => {
    assert.ok(
      source.includes('SYMBOL_SET_NAMES'),
      'Explorer.tsx must define SYMBOL_SET_NAMES'
    );
    const expectedSets = ['Air', 'Land Unit', 'Sea Surface', 'Activities', 'Land Equipment', 'Space'];
    for (const name of expectedSets) {
      assert.ok(
        source.includes(`'${name}'`),
        `SYMBOL_SET_NAMES must include "${name}"`
      );
    }
  });

  it('symbol set grouping logic uses SYMBOL_SET_NAMES entries', () => {
    assert.ok(
      source.includes('symbolSets'),
      'BrowsePanel must compute symbolSets'
    );
    assert.ok(
      source.includes('symbolSetList'),
      'BrowsePanel must render a symbolSetList'
    );
    assert.ok(
      source.includes('selectedSS'),
      'BrowsePanel must track selected symbol set'
    );
    assert.ok(
      source.includes('Object.entries(SYMBOL_SET_NAMES)'),
      'symbolSets must derive from SYMBOL_SET_NAMES entries'
    );
  });

  it('affiliation filtering exists', () => {
    assert.ok(
      source.includes('BROWSE_AFFILIATIONS'),
      'Explorer.tsx must define BROWSE_AFFILIATIONS'
    );
    const affiliations = ['friendly', 'hostile', 'neutral', 'unknown'];
    for (const aff of affiliations) {
      assert.ok(
        source.includes(`key: '${aff}'`),
        `BROWSE_AFFILIATIONS must include ${aff}`
      );
    }
    assert.ok(
      source.includes('setAffiliation'),
      'BrowsePanel must have setAffiliation state setter'
    );
  });

  it('browse tab is declared in TABS array', () => {
    assert.ok(
      source.includes("id: 'browse'"),
      'TABS must include browse tab'
    );
    assert.ok(
      source.includes("label: 'Browse'"),
      'Browse tab must have Browse label'
    );
  });
});
