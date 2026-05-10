// rtmx:req REQ-XW-151
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../../data/mil-std-2525');

test('version-summary.json exists with 6+ versions', () => {
  const path = resolve(DATA_DIR, 'version-summary.json');
  assert.ok(existsSync(path), 'version-summary.json must exist');
  const data = JSON.parse(readFileSync(path, 'utf8'));
  assert.ok(Array.isArray(data.versions), 'versions must be an array');
  assert.ok(data.versions.length >= 6, `Expected 6+ versions, got ${data.versions.length}`);
  // Verify required fields
  for (const v of data.versions) {
    assert.ok(v.id, 'each version must have an id');
    assert.ok(v.name, 'each version must have a name');
    assert.ok(v.year, 'each version must have a year');
  }
});

test('msd.json exists locally with 2000+ entries', () => {
  const path = resolve(DATA_DIR, 'msd.json');
  assert.ok(existsSync(path), 'msd.json must exist');
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const symbols = data.msd?.SYMBOL || data.SYMBOL || [];
  assert.ok(
    symbols.length >= 2000,
    `Expected 2000+ SYMBOL entries in msd.json, got ${symbols.length}`
  );
});

test('mse.json exists locally with 2000+ entries', () => {
  const path = resolve(DATA_DIR, 'mse.json');
  assert.ok(existsSync(path), 'mse.json must exist');
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const symbols = data.mse?.SYMBOL || data.SYMBOL || [];
  assert.ok(
    symbols.length >= 2000,
    `Expected 2000+ SYMBOL entries in mse.json, got ${symbols.length}`
  );
});
