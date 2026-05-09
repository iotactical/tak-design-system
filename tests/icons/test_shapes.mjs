// rtmx:req REQ-ICN-006
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, '..', '..', 'data', 'atak-shapes.json');

describe('REQ-ICN-006: ATAK shape drawable metadata', () => {
  it('data/atak-shapes.json exists', () => {
    assert.ok(existsSync(DATA_PATH), 'Shapes file must exist');
  });

  it('is valid JSON', () => {
    const raw = readFileSync(DATA_PATH, 'utf8');
    assert.doesNotThrow(() => JSON.parse(raw), 'Shapes must be valid JSON');
  });

  let shapes;
  try {
    shapes = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
  } catch {
    shapes = [];
  }

  it('contains at least 60 entries', () => {
    assert.ok(shapes.length >= 60, `Expected >= 60 entries, got ${shapes.length}`);
  });

  it('each entry has name and shapeType', () => {
    const bad = shapes.filter(e => !e.name || !e.shapeType);
    assert.equal(bad.length, 0, `${bad.length} entries missing name or shapeType`);
  });

  it('shapeType values are valid Android shape types', () => {
    const validTypes = ['rectangle', 'oval', 'ring', 'line'];
    const invalid = shapes.filter(e => !validTypes.includes(e.shapeType));
    assert.equal(invalid.length, 0,
      `Invalid shape types: ${invalid.map(e => `${e.name}=${e.shapeType}`).join(', ')}`);
  });

  it('entries are sorted alphabetically by name', () => {
    for (let i = 1; i < shapes.length; i++) {
      assert.ok(
        shapes[i].name.localeCompare(shapes[i - 1].name) >= 0,
        `Entries not sorted: ${shapes[i - 1].name} > ${shapes[i].name}`
      );
    }
  });
});
