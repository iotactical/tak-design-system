// rtmx:req REQ-ICN-009
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MARKERS_PATH = resolve(__dirname, '..', '..', 'data', 'atak-location-markers.json');

describe('REQ-ICN-009: ATAK location marker manifest', () => {
  it('data/atak-location-markers.json exists', () => {
    assert.ok(existsSync(MARKERS_PATH), 'Location markers manifest must exist');
  });

  it('is valid JSON', () => {
    const raw = readFileSync(MARKERS_PATH, 'utf8');
    assert.doesNotThrow(() => JSON.parse(raw), 'Manifest must be valid JSON');
  });

  let markers;
  try {
    markers = JSON.parse(readFileSync(MARKERS_PATH, 'utf8'));
  } catch {
    markers = [];
  }

  it('contains at least 40 entries', () => {
    assert.ok(markers.length >= 40, `Expected >= 40 entries, got ${markers.length}`);
  });

  it('each entry has name and color fields', () => {
    const missing = [];
    for (const entry of markers) {
      if (!entry.name) missing.push('(unnamed) missing name');
      if (!entry.color) missing.push(`${entry.name || '(unnamed)'} missing color`);
    }
    assert.equal(missing.length, 0, `Entries with missing fields: ${missing.slice(0, 10).join('; ')}`);
  });

  it('each entry has hasSvg and format fields', () => {
    const missing = [];
    for (const entry of markers) {
      if (entry.hasSvg === undefined) missing.push(`${entry.name} missing hasSvg`);
      if (!entry.format) missing.push(`${entry.name} missing format`);
    }
    assert.equal(missing.length, 0, `Entries with missing fields: ${missing.slice(0, 10).join('; ')}`);
  });

  it('all entries have enter_location prefix', () => {
    const bad = markers.filter(e => !e.name.startsWith('enter_location'));
    assert.equal(bad.length, 0, `${bad.length} entries without enter_location prefix`);
  });

  it('includes known marker colors', () => {
    const colors = new Set(markers.map(e => e.color));
    const expected = ['red', 'blue', 'green', 'yellow', 'black', 'white'];
    for (const c of expected) {
      assert.ok(colors.has(c), `Missing expected color: ${c}`);
    }
  });
});
