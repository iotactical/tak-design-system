// rtmx:req REQ-APK-008
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DATA_FILE = resolve(ROOT, 'data', 'atak-fonts.json');

describe('REQ-APK-008: ATAK font bundle', () => {
  let fonts;

  it('data/atak-fonts.json exists', () => {
    assert.ok(existsSync(DATA_FILE), 'atak-fonts.json should exist');
  });

  it('parses as valid JSON array', () => {
    const raw = readFileSync(DATA_FILE, 'utf8');
    fonts = JSON.parse(raw);
    assert.ok(Array.isArray(fonts), 'Should be an array');
  });

  it('contains at least 4 fonts', () => {
    if (!fonts) fonts = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    assert.ok(
      fonts.length >= 4,
      `Expected >= 4 fonts, found ${fonts.length}`
    );
  });

  it('every entry has name, file, source, and family fields', () => {
    if (!fonts) fonts = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    for (const entry of fonts) {
      assert.ok(typeof entry.name === 'string' && entry.name.length > 0,
        `Entry missing name: ${JSON.stringify(entry)}`);
      assert.ok(typeof entry.file === 'string' && entry.file.length > 0,
        `Entry missing file: ${JSON.stringify(entry)}`);
      assert.ok(entry.source === 'assets' || entry.source === 'res',
        `Entry source must be "assets" or "res": ${JSON.stringify(entry)}`);
      assert.ok(typeof entry.family === 'string' && entry.family.length > 0,
        `Entry missing family: ${JSON.stringify(entry)}`);
    }
  });

  it('includes Digital family', () => {
    if (!fonts) fonts = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    const digital = fonts.filter(f => f.family === 'Digital');
    assert.ok(digital.length > 0, 'Should include Digital family fonts');
  });

  it('includes Nunito family', () => {
    if (!fonts) fonts = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    const nunito = fonts.filter(f => f.family === 'Nunito');
    assert.ok(nunito.length > 0, 'Should include Nunito family fonts');
  });

  it('includes fonts from both assets and res sources', () => {
    if (!fonts) fonts = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    const sources = new Set(fonts.map(f => f.source));
    assert.ok(sources.has('assets'), 'Should have assets source');
    assert.ok(sources.has('res'), 'Should have res source');
  });
});
