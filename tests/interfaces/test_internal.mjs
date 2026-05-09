import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

// rtmx:req REQ-XW-061
describe('REQ-XW-061: Internal interfaces catalog', () => {
  const filePath = resolve(ROOT, 'data', 'tak-interfaces-internal.json');

  it('data/tak-interfaces-internal.json exists', () => {
    assert.ok(existsSync(filePath), 'Internal interfaces file must exist');
  });

  it('is valid JSON', () => {
    const raw = readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    assert.ok(Array.isArray(data), 'File must contain a JSON array');
  });

  it('has at least 8 entries', () => {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    assert.ok(data.length >= 8, `Expected 8+ entries, got ${data.length}`);
  });

  it('each entry has required fields: name, type, mechanism', () => {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    const validTypes = ['lifecycle', 'event', 'storage', 'render', 'plugin'];
    for (const entry of data) {
      assert.ok(typeof entry.name === 'string' && entry.name.length > 0, `Missing or empty name`);
      assert.ok(
        validTypes.includes(entry.type),
        `Invalid type "${entry.type}" in "${entry.name}", expected one of: ${validTypes.join(', ')}`
      );
      assert.ok(typeof entry.mechanism === 'string' && entry.mechanism.length > 0, `Missing or empty mechanism in "${entry.name}"`);
    }
  });

  it('each entry has a description', () => {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    for (const entry of data) {
      assert.ok(typeof entry.description === 'string' && entry.description.length > 0, `Missing description in "${entry.name}"`);
    }
  });
});
