// rtmx:req REQ-APK-007
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DATA_FILE = resolve(ROOT, 'data', 'atak-lpt-icons.json');

describe('REQ-APK-007: Landing Point Tactical icons', () => {
  let icons;

  it('data/atak-lpt-icons.json exists', () => {
    assert.ok(existsSync(DATA_FILE), 'atak-lpt-icons.json should exist');
  });

  it('parses as valid JSON array', () => {
    const raw = readFileSync(DATA_FILE, 'utf8');
    icons = JSON.parse(raw);
    assert.ok(Array.isArray(icons), 'Should be an array');
  });

  it('contains 200+ entries', () => {
    if (!icons) icons = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    assert.ok(
      icons.length >= 200,
      `Expected >= 200 icons, found ${icons.length}`
    );
  });

  it('every entry has name and category fields', () => {
    if (!icons) icons = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    for (const entry of icons) {
      assert.ok(typeof entry.name === 'string' && entry.name.length > 0,
        `Entry missing name: ${JSON.stringify(entry)}`);
      assert.ok(typeof entry.category === 'string' && entry.category.length > 0,
        `Entry missing category: ${JSON.stringify(entry)}`);
    }
  });

  it('contains helicopter category', () => {
    if (!icons) icons = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    const helis = icons.filter(i => i.category === 'helicopter');
    assert.ok(helis.length > 0, 'Should have helicopter icons');
  });

  it('contains aircraft category', () => {
    if (!icons) icons = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    const aircraft = icons.filter(i => i.category === 'aircraft');
    assert.ok(aircraft.length > 0, 'Should have aircraft icons');
  });

  it('contains marker category', () => {
    if (!icons) icons = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    const markers = icons.filter(i => i.category === 'marker');
    assert.ok(markers.length > 0, 'Should have colored marker icons');
  });

  it('has multiple categories', () => {
    if (!icons) icons = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    const categories = new Set(icons.map(i => i.category));
    assert.ok(
      categories.size >= 3,
      `Expected >= 3 categories, found ${categories.size}: ${[...categories].join(', ')}`
    );
  });
});
