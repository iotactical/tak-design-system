import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST = resolve(__dirname, '..', '..', 'data', 'atak-core-icons.json');

// rtmx:req REQ-APK-001
describe('REQ-APK-001: ATAK core asset icon inventory', () => {
  it('data/atak-core-icons.json exists and is valid JSON', () => {
    assert.ok(existsSync(MANIFEST), 'Manifest file missing');
    const raw = readFileSync(MANIFEST, 'utf-8');
    JSON.parse(raw); // throws on invalid JSON
  });

  let entries;
  it('has at least 200 entries', () => {
    entries = JSON.parse(readFileSync(MANIFEST, 'utf-8'));
    assert.ok(
      Array.isArray(entries) && entries.length >= 200,
      `Expected >= 200 entries, found ${entries?.length}`
    );
  });

  it('each entry has name and category fields', () => {
    entries = entries || JSON.parse(readFileSync(MANIFEST, 'utf-8'));
    for (const entry of entries) {
      assert.ok(typeof entry.name === 'string' && entry.name.length > 0, `Bad name: ${JSON.stringify(entry)}`);
      assert.ok(typeof entry.category === 'string' && entry.category.length > 0, `Bad category: ${JSON.stringify(entry)}`);
    }
  });

  it('has multiple categories represented', () => {
    entries = entries || JSON.parse(readFileSync(MANIFEST, 'utf-8'));
    const categories = new Set(entries.map(e => e.category));
    assert.ok(
      categories.size >= 3,
      `Expected >= 3 categories, found ${categories.size}: ${[...categories].join(', ')}`
    );
  });
});
