import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DIST = resolve(ROOT, 'packages', 'react', 'dist');

// Verify RangeBearing exported APIs via type declarations (no DOM needed)
describe('RangeBearing component exported APIs', () => {
  let dts;

  before(() => {
    dts = readFileSync(resolve(DIST, 'index.d.ts'), 'utf8');
  });

  // rtmx:req REQ-CMP-005
  it('REQ-CMP-005: RangeBearing component exported with range/bearing props', () => {
    assert.match(dts, /export declare const RangeBearing/);
    assert.match(dts, /distance:\s*number/);
    assert.match(dts, /bearing:\s*number/);
    assert.match(dts, /unit\?:\s*DistanceUnit/);
    assert.match(dts, /from\?/);
    assert.match(dts, /to\?/);
    assert.match(dts, /lat:\s*number/);
    assert.match(dts, /lon:\s*number/);
    assert.match(dts, /DistanceUnit.*'meters'.*'kilometers'.*'miles'.*'nautical-miles'/s);
    assert.match(dts, /HTMLAttributes/);
  });
});
