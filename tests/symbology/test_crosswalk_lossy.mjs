import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// rtmx:req REQ-XW-005

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const B2D_PATH = resolve(ROOT, 'data', 'mil-std-2525', 'b2d.json');

describe('REQ-XW-005: Crosswalk bidirectionality and lossy annotation', () => {
  it('b2d.json exists', () => {
    assert.ok(existsSync(B2D_PATH), 'b2d.json should exist');
  });

  it('every entry has a lossy boolean field', () => {
    const data = JSON.parse(readFileSync(B2D_PATH, 'utf8'));
    for (const entry of data.mappings) {
      assert.equal(typeof entry.lossy, 'boolean', `lossy must be boolean, got ${typeof entry.lossy}`);
    }
  });

  it('some entries are lossy (true)', () => {
    const data = JSON.parse(readFileSync(B2D_PATH, 'utf8'));
    const lossyEntries = data.mappings.filter((e) => e.lossy === true);
    assert.ok(lossyEntries.length > 0, 'should have at least one lossy entry');
  });

  it('some entries are non-lossy (false)', () => {
    const data = JSON.parse(readFileSync(B2D_PATH, 'utf8'));
    const nonLossyEntries = data.mappings.filter((e) => e.lossy === false);
    assert.ok(nonLossyEntries.length > 0, 'should have at least one non-lossy entry');
  });

  it('summary includes d_without_b_equivalent count', () => {
    const data = JSON.parse(readFileSync(B2D_PATH, 'utf8'));
    assert.ok(
      typeof data.summary.d_without_b_equivalent === 'number',
      'summary should have d_without_b_equivalent count'
    );
  });

  it('lossy count in summary matches actual lossy entries', () => {
    const data = JSON.parse(readFileSync(B2D_PATH, 'utf8'));
    const actualLossy = data.mappings.filter((e) => e.lossy === true).length;
    assert.equal(data.summary.lossy_count, actualLossy, 'summary lossy_count should match');
  });

  it('lossy entries have non-zero sector modifiers', () => {
    const data = JSON.parse(readFileSync(B2D_PATH, 'utf8'));
    const lossyEntries = data.mappings.filter((e) => e.lossy === true);
    for (const entry of lossyEntries) {
      const hasModifier = entry.d_s1 !== '00' || entry.d_s2 !== '00';
      assert.ok(hasModifier, `lossy entry ${entry.b_sidc} should have non-zero s1 or s2`);
    }
  });
});
