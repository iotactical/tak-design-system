// rtmx:req REQ-APK-009
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DATA_FILE = resolve(ROOT, 'data', 'atak-map-styles.json');

describe('REQ-APK-009: ATAK map tile style definitions', () => {
  let styles;

  it('data/atak-map-styles.json exists', () => {
    assert.ok(existsSync(DATA_FILE), 'atak-map-styles.json should exist');
  });

  it('parses as valid JSON array', () => {
    const raw = readFileSync(DATA_FILE, 'utf8');
    styles = JSON.parse(raw);
    assert.ok(Array.isArray(styles), 'Should be an array');
  });

  it('every entry has provider, variant, and files fields', () => {
    if (!styles) styles = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    for (const entry of styles) {
      assert.ok(typeof entry.provider === 'string' && entry.provider.length > 0,
        `Entry missing provider: ${JSON.stringify(entry)}`);
      assert.ok(typeof entry.variant === 'string' && entry.variant.length > 0,
        `Entry missing variant: ${JSON.stringify(entry)}`);
      assert.ok(Array.isArray(entry.files),
        `Entry files must be an array: ${JSON.stringify(entry)}`);
    }
  });

  it('has at least 2 providers', () => {
    if (!styles) styles = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    const providers = new Set(styles.map(s => s.provider));
    assert.ok(
      providers.size >= 2,
      `Expected >= 2 providers, found ${providers.size}: ${[...providers].join(', ')}`
    );
  });

  it('has at least 3 variants', () => {
    if (!styles) styles = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    const variants = new Set(styles.map(s => s.variant));
    assert.ok(
      variants.size >= 3,
      `Expected >= 3 variants, found ${variants.size}: ${[...variants].join(', ')}`
    );
  });

  it('includes omt provider', () => {
    if (!styles) styles = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    const omt = styles.filter(s => s.provider === 'omt');
    assert.ok(omt.length > 0, 'Should have omt provider entries');
  });

  it('includes rbt provider', () => {
    if (!styles) styles = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    const rbt = styles.filter(s => s.provider === 'rbt');
    assert.ok(rbt.length > 0, 'Should have rbt provider entries');
  });
});
