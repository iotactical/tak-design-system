// rtmx:req REQ-XW-111
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const INDEX_PATH = resolve(ROOT, 'site', 'src', 'data', 'searchIndex.ts');

describe('REQ-XW-111: Build-time search index', () => {
  it('site/src/data/searchIndex.ts exists', () => {
    assert.ok(existsSync(INDEX_PATH), 'searchIndex.ts must exist');
  });

  const source = readFileSync(INDEX_PATH, 'utf8');

  it('indexes tokens', () => {
    assert.ok(
      source.includes('buildTokenEntries'),
      'searchIndex must build token entries'
    );
    assert.ok(
      source.includes("category: 'Tokens'"),
      'searchIndex must categorize tokens'
    );
  });

  it('indexes components', () => {
    assert.ok(
      source.includes('buildComponentEntries'),
      'searchIndex must build component entries'
    );
    assert.ok(
      source.includes("category: 'Components'"),
      'searchIndex must categorize components'
    );
  });

  it('indexes icons', () => {
    assert.ok(
      source.includes('buildIconEntries'),
      'searchIndex must build icon entries'
    );
    assert.ok(
      source.includes("category: 'Icons'"),
      'searchIndex must categorize icons'
    );
  });

  it('indexes palettes', () => {
    assert.ok(
      source.includes('buildPaletteEntries'),
      'searchIndex must build palette entries'
    );
    assert.ok(
      source.includes("category: 'Palettes'"),
      'searchIndex must categorize palettes'
    );
  });

  it('indexes 2525 entities', () => {
    assert.ok(
      source.includes('build2525Entries'),
      'searchIndex must build 2525 entity entries'
    );
    assert.ok(
      source.includes("category: '2525'"),
      'searchIndex must categorize 2525 entities'
    );
  });

  it('indexes intents', () => {
    assert.ok(
      source.includes('buildIntentEntries'),
      'searchIndex must build intent entries'
    );
    assert.ok(
      source.includes('atakIntents'),
      'searchIndex must import atak-intents data'
    );
  });

  it('has scoring via Fuse.js in GlobalSearch', () => {
    const globalSearchPath = resolve(ROOT, 'site', 'src', 'components', 'GlobalSearch.tsx');
    const gsSource = readFileSync(globalSearchPath, 'utf8');
    assert.ok(
      gsSource.includes('includeScore'),
      'GlobalSearch must use Fuse.js scoring (includeScore)'
    );
    assert.ok(
      gsSource.includes('weight:'),
      'GlobalSearch must use weighted scoring for search keys'
    );
  });

  it('exports a flat searchIndex array', () => {
    assert.ok(
      source.includes('export const searchIndex: SearchEntry[]'),
      'searchIndex must export a typed SearchEntry array'
    );
  });
});
