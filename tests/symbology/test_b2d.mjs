import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// rtmx:req REQ-XW-004

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const B2D_PATH = resolve(ROOT, 'data', 'mil-std-2525', 'b2d.json');

describe('REQ-XW-004: B-to-D crosswalk', () => {
  it('b2d.json exists', () => {
    assert.ok(existsSync(B2D_PATH), 'b2d.json should exist');
  });

  it('is valid JSON with mappings array', () => {
    const data = JSON.parse(readFileSync(B2D_PATH, 'utf8'));
    assert.ok(data.mappings, 'should have mappings field');
    assert.ok(Array.isArray(data.mappings), 'mappings should be an array');
  });

  it('has 1500+ entries', () => {
    const data = JSON.parse(readFileSync(B2D_PATH, 'utf8'));
    const count = data.mappings.length;
    assert.ok(count >= 1500, `expected >= 1500 entries, got ${count}`);
  });

  it('each entry has b_sidc, d_ss, and d_ec fields', () => {
    const data = JSON.parse(readFileSync(B2D_PATH, 'utf8'));
    for (const entry of data.mappings) {
      assert.ok(typeof entry.b_sidc === 'string', 'b_sidc must be a string');
      assert.ok(typeof entry.d_ss === 'string', 'd_ss must be a string');
      assert.ok(typeof entry.d_ec === 'string', 'd_ec must be a string');
    }
  });

  it('each entry has d_s1 and d_s2 fields', () => {
    const data = JSON.parse(readFileSync(B2D_PATH, 'utf8'));
    for (const entry of data.mappings) {
      assert.ok(typeof entry.d_s1 === 'string', 'd_s1 must be a string');
      assert.ok(typeof entry.d_s2 === 'string', 'd_s2 must be a string');
    }
  });

  it('each entry has a label', () => {
    const data = JSON.parse(readFileSync(B2D_PATH, 'utf8'));
    for (const entry of data.mappings) {
      assert.ok(typeof entry.label === 'string', 'label must be a string');
    }
  });

  it('summary counts are consistent', () => {
    const data = JSON.parse(readFileSync(B2D_PATH, 'utf8'));
    assert.equal(data.summary.b_to_d_count, data.mappings.length);
    assert.equal(
      data.summary.lossy_count + data.summary.non_lossy_count,
      data.mappings.length,
      'lossy + non_lossy should equal total'
    );
  });
});
