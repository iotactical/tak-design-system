import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DIST = resolve(ROOT, 'packages', 'react', 'dist');

// Verify CoordinateDisplay exported APIs via type declarations (no DOM needed)
describe('CoordinateDisplay component exported APIs', () => {
  let dts;

  before(() => {
    dts = readFileSync(resolve(DIST, 'index.d.ts'), 'utf8');
  });

  // rtmx:req REQ-CMP-004
  it('REQ-CMP-004: CoordinateDisplay component exported with coordinate props', () => {
    assert.match(dts, /export declare const CoordinateDisplay/);
    assert.match(dts, /latitude:\s*number/);
    assert.match(dts, /longitude:\s*number/);
    assert.match(dts, /altitude\?:\s*number/);
    assert.match(dts, /format\?:\s*CoordinateFormat/);
    assert.match(dts, /onFormatChange\?/);
    assert.match(dts, /CoordinateFormat.*'MGRS'.*'DD'.*'DMS'.*'UTM'/s);
    assert.match(dts, /HTMLAttributes/);
  });
});
