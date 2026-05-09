import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// rtmx:req REQ-XW-002

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const ENTITIES_PATH = resolve(ROOT, 'data', 'mil-std-2525', 'b-entities.json');

describe('REQ-XW-002: MIL-STD-2525B entity code table', () => {
  it('b-entities.json exists', () => {
    assert.ok(existsSync(ENTITIES_PATH), 'b-entities.json should exist');
  });

  it('is valid JSON', () => {
    const data = JSON.parse(readFileSync(ENTITIES_PATH, 'utf8'));
    assert.ok(data, 'should parse without error');
  });

  it('has version and source metadata', () => {
    const data = JSON.parse(readFileSync(ENTITIES_PATH, 'utf8'));
    assert.equal(data.version, '2525B');
    assert.ok(data.source, 'should have source field');
  });

  it('has 1500+ entity entries', () => {
    const data = JSON.parse(readFileSync(ENTITIES_PATH, 'utf8'));
    const count = data.entities.length;
    assert.ok(count >= 1500, `expected >= 1500 entities, got ${count}`);
  });

  it('each entity has basic, ss, and ec fields', () => {
    const data = JSON.parse(readFileSync(ENTITIES_PATH, 'utf8'));
    for (const ent of data.entities) {
      assert.ok(typeof ent.basic === 'string', 'basic must be a string');
      assert.ok(typeof ent.ss === 'string', 'ss must be a string');
      assert.ok(typeof ent.ec === 'string', 'ec must be a string');
    }
  });

  it('each entity has b_compat flag', () => {
    const data = JSON.parse(readFileSync(ENTITIES_PATH, 'utf8'));
    for (const ent of data.entities) {
      assert.equal(typeof ent.b_compat, 'boolean', 'b_compat must be boolean');
    }
  });

  it('basic SIDCs are 14 or 15 characters', () => {
    const data = JSON.parse(readFileSync(ENTITIES_PATH, 'utf8'));
    for (const ent of data.entities) {
      assert.ok(
        ent.basic.length === 14 || ent.basic.length === 15,
        `SIDC "${ent.basic}" should be 14 or 15 chars, got ${ent.basic.length}`
      );
    }
  });

  it('count field matches entities array length', () => {
    const data = JSON.parse(readFileSync(ENTITIES_PATH, 'utf8'));
    assert.equal(data.count, data.entities.length);
  });
});
