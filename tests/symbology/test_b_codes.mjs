import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// rtmx:req REQ-XW-001

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const REF_PATH = resolve(ROOT, 'data', 'mil-std-2525', 'c2d-reference.json');

describe('REQ-XW-001: MIL-STD-2525 C-to-D reference data', () => {
  it('c2d-reference.json exists', () => {
    assert.ok(existsSync(REF_PATH), 'c2d-reference.json should exist');
  });

  it('is valid JSON with a symbols array', () => {
    const data = JSON.parse(readFileSync(REF_PATH, 'utf8'));
    assert.ok(data.c2d, 'should have c2d key');
    assert.ok(Array.isArray(data.c2d.symbols), 'c2d.symbols should be an array');
  });

  it('has 1900+ symbol entries', () => {
    const data = JSON.parse(readFileSync(REF_PATH, 'utf8'));
    const count = data.c2d.symbols.length;
    assert.ok(count >= 1900, `expected >= 1900 entries, got ${count}`);
  });

  it('each entry has basic, ss, and ec fields', () => {
    const data = JSON.parse(readFileSync(REF_PATH, 'utf8'));
    for (const sym of data.c2d.symbols) {
      assert.ok(typeof sym.basic === 'string', 'basic must be a string');
      assert.ok(typeof sym.ss === 'string', 'ss must be a string');
      assert.ok(typeof sym.ec === 'string', 'ec must be a string');
    }
  });

  it('basic SIDCs are 14 or 15 characters', () => {
    const data = JSON.parse(readFileSync(REF_PATH, 'utf8'));
    for (const sym of data.c2d.symbols) {
      assert.ok(
        sym.basic.length === 14 || sym.basic.length === 15,
        `SIDC "${sym.basic}" should be 14 or 15 chars, got ${sym.basic.length}`
      );
    }
  });
});
