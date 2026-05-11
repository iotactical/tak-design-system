import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// rtmx:req REQ-XW-153

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const VERIFIED_PATH = resolve(ROOT, 'data', 'mil-std-2525', 'verified-crosswalk.json');

describe('REQ-XW-153: Verified crosswalk', () => {
  it('verified-crosswalk.json exists', () => {
    assert.ok(existsSync(VERIFIED_PATH), 'verified-crosswalk.json should exist');
  });

  it('is valid JSON with mappings array', () => {
    const data = JSON.parse(readFileSync(VERIFIED_PATH, 'utf8'));
    assert.ok(data.mappings, 'should have mappings field');
    assert.ok(Array.isArray(data.mappings), 'mappings should be an array');
  });

  it('has confidence field on every entry', () => {
    const data = JSON.parse(readFileSync(VERIFIED_PATH, 'utf8'));
    const validConfidence = ['exact', 'modifier', 'unverified'];
    for (const entry of data.mappings) {
      assert.ok(validConfidence.includes(entry.confidence),
        `entry ${entry.b_sidc} has invalid confidence: ${entry.confidence}`);
    }
  });

  it('has summary with confidence counts', () => {
    const data = JSON.parse(readFileSync(VERIFIED_PATH, 'utf8'));
    const { summary } = data;
    assert.ok(typeof summary.exact === 'number', 'summary.exact must be a number');
    assert.ok(typeof summary.modifier === 'number', 'summary.modifier must be a number');
    assert.ok(typeof summary.unverified === 'number', 'summary.unverified must be a number');
    assert.strictEqual(summary.exact + summary.modifier + summary.unverified, summary.total,
      'confidence counts should sum to total');
  });

  it('references study-results.json', () => {
    const data = JSON.parse(readFileSync(VERIFIED_PATH, 'utf8'));
    assert.ok(data.references, 'should have references field');
    assert.ok(data.references.study, 'should reference study-results.json');
  });

  it('non-lossy entries have exact confidence', () => {
    const data = JSON.parse(readFileSync(VERIFIED_PATH, 'utf8'));
    const nonLossy = data.mappings.filter(m => !m.lossy);
    for (const entry of nonLossy) {
      assert.strictEqual(entry.confidence, 'exact',
        `non-lossy entry ${entry.b_sidc} should have exact confidence`);
    }
  });
});
