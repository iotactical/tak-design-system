import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// rtmx:req REQ-XW-139

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const VALIDATION_PATH = resolve(ROOT, 'data', 'mil-std-2525', 'crosswalk-validation.json');

describe('REQ-XW-139: Visual crosswalk validation', () => {
  it('crosswalk-validation.json exists', () => {
    assert.ok(existsSync(VALIDATION_PATH), 'crosswalk-validation.json should exist');
  });

  it('is valid JSON with summary and entries', () => {
    const data = JSON.parse(readFileSync(VALIDATION_PATH, 'utf8'));
    assert.ok(data.summary, 'should have summary field');
    assert.ok(data.entries, 'should have entries field');
    assert.ok(Array.isArray(data.entries), 'entries should be an array');
  });

  it('summary has required count fields', () => {
    const data = JSON.parse(readFileSync(VALIDATION_PATH, 'utf8'));
    const { summary } = data;
    assert.ok(typeof summary.total === 'number', 'summary.total must be a number');
    assert.ok(typeof summary.exact_match === 'number', 'summary.exact_match must be a number');
    assert.ok(typeof summary.modified === 'number', 'summary.modified must be a number');
    assert.ok(typeof summary.missing === 'number', 'summary.missing must be a number');
  });

  it('total entries matches b2d.json mapping count', () => {
    const data = JSON.parse(readFileSync(VALIDATION_PATH, 'utf8'));
    assert.strictEqual(data.summary.total, 1915);
  });

  it('each entry has a validation status', () => {
    const data = JSON.parse(readFileSync(VALIDATION_PATH, 'utf8'));
    const validStatuses = ['exact', 'modifier', 'unverified'];
    for (const entry of data.entries) {
      assert.ok(validStatuses.includes(entry.status),
        `entry ${entry.b_sidc} has invalid status: ${entry.status}`);
    }
  });
});
