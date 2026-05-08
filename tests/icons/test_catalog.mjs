// rtmx:req REQ-ICN-001
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = resolve(__dirname, '..', '..', 'data', 'atak-drawable-catalog.json');

describe('REQ-ICN-001: ATAK drawable resource catalog', () => {
  it('data/atak-drawable-catalog.json exists', () => {
    assert.ok(existsSync(CATALOG_PATH), 'Catalog file must exist');
  });

  it('is valid JSON', () => {
    const raw = readFileSync(CATALOG_PATH, 'utf8');
    assert.doesNotThrow(() => JSON.parse(raw), 'Catalog must be valid JSON');
  });

  let catalog;
  try {
    catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));
  } catch {
    catalog = [];
  }

  it('contains at least 1000 entries', () => {
    assert.ok(catalog.length >= 1000, `Expected >= 1000 entries, got ${catalog.length}`);
  });

  it('each entry has name, type, category, format fields', () => {
    const required = ['name', 'type', 'category', 'format'];
    const missing = [];
    for (const entry of catalog) {
      for (const field of required) {
        if (entry[field] === undefined || entry[field] === null) {
          missing.push(`${entry.name || '(unnamed)'} missing ${field}`);
        }
      }
    }
    assert.equal(missing.length, 0, `Entries with missing fields: ${missing.slice(0, 10).join('; ')}`);
  });

  it('at least 150 entries categorized as vector type', () => {
    const vectors = catalog.filter(e => e.type === 'vector');
    assert.ok(vectors.length >= 150, `Expected >= 150 vectors, got ${vectors.length}`);
  });

  it('at least 300 entries with ic_ prefix category', () => {
    const icEntries = catalog.filter(e => e.category.startsWith('ic_'));
    assert.ok(icEntries.length >= 300, `Expected >= 300 ic_ entries, got ${icEntries.length}`);
  });

  it('at least 100 entries with nav_ prefix category', () => {
    const navEntries = catalog.filter(e => e.category === 'nav');
    assert.ok(navEntries.length >= 100, `Expected >= 100 nav entries, got ${navEntries.length}`);
  });

  it('each entry has a densities array', () => {
    const bad = catalog.filter(e => !Array.isArray(e.densities) || e.densities.length === 0);
    assert.equal(bad.length, 0, `${bad.length} entries have empty or missing densities`);
  });

  it('entries are sorted alphabetically by name', () => {
    for (let i = 1; i < catalog.length; i++) {
      assert.ok(
        catalog[i].name.localeCompare(catalog[i - 1].name) >= 0,
        `Entries not sorted: ${catalog[i - 1].name} > ${catalog[i].name}`
      );
    }
  });
});
