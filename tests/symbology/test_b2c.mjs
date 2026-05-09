import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// rtmx:req REQ-XW-003

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const B2C_PATH = resolve(ROOT, 'data', 'mil-std-2525', 'b2c.json');

describe('REQ-XW-003: B-to-C mapping', () => {
  it('b2c.json exists', () => {
    assert.ok(existsSync(B2C_PATH), 'b2c.json should exist');
  });

  it('is valid JSON array', () => {
    const data = JSON.parse(readFileSync(B2C_PATH, 'utf8'));
    assert.ok(Array.isArray(data), 'b2c.json should be an array');
  });

  it('has 1500+ entries', () => {
    const data = JSON.parse(readFileSync(B2C_PATH, 'utf8'));
    assert.ok(data.length >= 1500, `expected >= 1500 entries, got ${data.length}`);
  });

  it('each entry has b_sidc and c_sidc fields', () => {
    const data = JSON.parse(readFileSync(B2C_PATH, 'utf8'));
    for (const entry of data) {
      assert.ok(typeof entry.b_sidc === 'string', 'b_sidc must be a string');
      assert.ok(typeof entry.c_sidc === 'string', 'c_sidc must be a string');
    }
  });

  it('each entry has match_type field', () => {
    const data = JSON.parse(readFileSync(B2C_PATH, 'utf8'));
    for (const entry of data) {
      assert.ok(
        entry.match_type === 'identity' || entry.match_type === 'approximate',
        `match_type must be "identity" or "approximate", got "${entry.match_type}"`
      );
    }
  });

  it('all identity mappings have b_sidc equal to c_sidc', () => {
    const data = JSON.parse(readFileSync(B2C_PATH, 'utf8'));
    const identities = data.filter((e) => e.match_type === 'identity');
    assert.ok(identities.length > 0, 'should have identity mappings');
    for (const entry of identities) {
      assert.equal(entry.b_sidc, entry.c_sidc, 'identity mapping should have equal SIDCs');
    }
  });
});
