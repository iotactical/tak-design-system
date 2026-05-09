// rtmx:req REQ-APK-011
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DATA_FILE = resolve(ROOT, 'data', 'atak-vehicle-models.json');

describe('REQ-APK-011: ATAK vehicle models palette', () => {
  let manifest;

  it('data/atak-vehicle-models.json exists', () => {
    assert.ok(existsSync(DATA_FILE), 'atak-vehicle-models.json should exist');
  });

  it('parses as valid JSON with categories and totalCount', () => {
    const raw = readFileSync(DATA_FILE, 'utf8');
    manifest = JSON.parse(raw);
    assert.ok(Array.isArray(manifest.categories), 'Should have categories array');
    assert.ok(typeof manifest.totalCount === 'number', 'Should have totalCount');
  });

  it('has at least 3 categories', () => {
    if (!manifest) manifest = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    assert.ok(
      manifest.categories.length >= 3,
      `Expected >= 3 categories, found ${manifest.categories.length}`
    );
  });

  it('has at least 20 total models', () => {
    if (!manifest) manifest = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    assert.ok(
      manifest.totalCount >= 20,
      `Expected >= 20 models, found ${manifest.totalCount}`
    );
  });

  it('aircraft category has the most models', () => {
    if (!manifest) manifest = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    const aircraft = manifest.categories.find(c => c.name === 'aircraft');
    assert.ok(aircraft, 'Should have aircraft category');
    for (const cat of manifest.categories) {
      assert.ok(
        aircraft.models.length >= cat.models.length,
        `Aircraft (${aircraft.models.length}) should have >= models than ${cat.name} (${cat.models.length})`
      );
    }
  });
});
