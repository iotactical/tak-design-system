import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

// rtmx:req REQ-XW-114
describe('REQ-XW-114: ATAK Plugin API reference', () => {
  const dataPath = resolve(ROOT, 'data', 'tak-plugin-api.json');

  it('data/tak-plugin-api.json exists', () => {
    assert.ok(existsSync(dataPath), 'Plugin API data file must exist');
  });

  it('has lifecycle array with expected methods', () => {
    const data = JSON.parse(readFileSync(dataPath, 'utf8'));
    assert.ok(Array.isArray(data.lifecycle), 'lifecycle must be an array');
    assert.ok(data.lifecycle.length >= 3, 'lifecycle must have at least 3 entries');
    const methods = data.lifecycle.map((l) => l.method);
    assert.ok(methods.includes('onStart'), 'Must include onStart');
    assert.ok(methods.includes('onStop'), 'Must include onStop');
    assert.ok(methods.includes('onDestroyView'), 'Must include onDestroyView');
  });

  it('has components array with expected entries', () => {
    const data = JSON.parse(readFileSync(dataPath, 'utf8'));
    assert.ok(Array.isArray(data.components), 'components must be an array');
    assert.ok(data.components.length >= 3, 'components must have at least 3 entries');
    const names = data.components.map((c) => c.name);
    assert.ok(names.includes('DropDownReceiver'), 'Must include DropDownReceiver');
    assert.ok(names.includes('AbstractMapComponent'), 'Must include AbstractMapComponent');
  });

  it('has patterns array with expected entries', () => {
    const data = JSON.parse(readFileSync(dataPath, 'utf8'));
    assert.ok(Array.isArray(data.patterns), 'patterns must be an array');
    assert.ok(data.patterns.length >= 3, 'patterns must have at least 3 entries');
    const names = data.patterns.map((p) => p.name);
    assert.ok(names.includes('CotEvent'), 'Must include CotEvent');
    assert.ok(names.includes('MapGroup'), 'Must include MapGroup');
  });
});
