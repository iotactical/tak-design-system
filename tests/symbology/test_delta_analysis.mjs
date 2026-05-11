// rtmx:req REQ-XW-152
import { strict as assert } from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const deltaPath = resolve(__dirname, '..', '..', 'data', 'mil-std-2525', 'delta-analysis.json');

describe('REQ-XW-152: MIL-STD-2525 delta analysis', () => {
  it('delta-analysis.json exists', () => {
    assert.ok(existsSync(deltaPath), 'data/mil-std-2525/delta-analysis.json must exist');
  });

  const delta = JSON.parse(readFileSync(deltaPath, 'utf8'));

  it('has d_to_e section', () => {
    assert.ok(delta.d_to_e, 'missing d_to_e section');
    assert.ok(typeof delta.d_to_e.d_only === 'number');
    assert.ok(typeof delta.d_to_e.e_only === 'number');
    assert.ok(typeof delta.d_to_e.shared === 'number');
    assert.ok(typeof delta.d_to_e.d_total === 'number');
    assert.ok(typeof delta.d_to_e.e_total === 'number');
    assert.ok(delta.d_to_e.changes_by_symbol_set);
  });

  it('has c_to_d section', () => {
    assert.ok(delta.c_to_d, 'missing c_to_d section');
    assert.ok(typeof delta.c_to_d.c_mapped === 'number');
    assert.ok(typeof delta.c_to_d.d_total === 'number');
    assert.ok(typeof delta.c_to_d.d_new === 'number');
    assert.ok(typeof delta.c_to_d.mapping_coverage === 'string');
  });

  it('d_to_e.shared > 1000', () => {
    assert.ok(delta.d_to_e.shared > 1000,
      `Expected d_to_e.shared > 1000, got ${delta.d_to_e.shared}`);
  });

  it('c_to_d.c_mapped > 1500', () => {
    assert.ok(delta.c_to_d.c_mapped > 1500,
      `Expected c_to_d.c_mapped > 1500, got ${delta.c_to_d.c_mapped}`);
  });
});
