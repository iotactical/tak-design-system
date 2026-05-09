// rtmx:req REQ-ICN-004
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const MANIFEST_PATH = resolve(ROOT, 'data/atak-nav-icons.json');

describe('REQ-ICN-004: ATAK navigation icon library', () => {
  it('data/atak-nav-icons.json exists and is valid JSON', () => {
    assert.ok(existsSync(MANIFEST_PATH), 'Manifest file must exist');
    const raw = readFileSync(MANIFEST_PATH, 'utf8');
    const data = JSON.parse(raw); // throws if invalid JSON
    assert.ok(Array.isArray(data), 'Manifest must be a JSON array');
  });

  it('has at least 100 entries', () => {
    const data = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
    assert.ok(
      data.length >= 100,
      `Expected >= 100 nav icon entries, got ${data.length}`
    );
  });

  it('each entry has name, hasSvg, format, and section fields', () => {
    const data = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
    const invalid = [];

    for (const entry of data) {
      const missing = [];
      if (typeof entry.name !== 'string') missing.push('name');
      if (typeof entry.hasSvg !== 'boolean') missing.push('hasSvg');
      if (typeof entry.format !== 'string') missing.push('format');
      if (typeof entry.section !== 'string') missing.push('section');
      if (missing.length > 0) {
        invalid.push(`${entry.name ?? '(unnamed)'}: missing ${missing.join(', ')}`);
      }
    }

    assert.equal(
      invalid.length,
      0,
      `Entries with missing fields:\n${invalid.join('\n')}`
    );
  });

  it('multiple sections are represented', () => {
    const data = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
    const sections = [...new Set(data.map(e => e.section))];
    assert.ok(
      sections.length >= 3,
      `Expected >= 3 distinct sections, got ${sections.length}: ${sections.join(', ')}`
    );
  });

  it('entries are sorted alphabetically by name', () => {
    const data = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
    const names = data.map(e => e.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    assert.deepEqual(names, sorted, 'Entries must be sorted alphabetically');
  });
});
