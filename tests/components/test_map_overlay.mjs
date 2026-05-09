import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DIST = resolve(ROOT, 'packages', 'react', 'dist');

// rtmx:req REQ-CMP-010
describe('MapOverlay component exports (REQ-CMP-010)', () => {
  let dts;

  before(() => {
    dts = readFileSync(resolve(DIST, 'index.d.ts'), 'utf8');
  });

  // rtmx:req REQ-CMP-010
  it('REQ-CMP-010: ScaleBar component exported with distance and unit props', () => {
    assert.match(dts, /export declare const ScaleBar/);
    assert.match(dts, /distance:\s*number/);
    assert.match(dts, /unit\?.*'metric'.*'imperial'/s);
  });

  // rtmx:req REQ-CMP-010
  it('REQ-CMP-010: CompassHeading component exported with heading and size props', () => {
    assert.match(dts, /export declare const CompassHeading/);
    assert.match(dts, /heading:\s*number/);
    assert.match(dts, /size\?.*number/);
  });

  // rtmx:req REQ-CMP-010
  it('REQ-CMP-010: ElevationProfile component exported with points, width, height props', () => {
    assert.match(dts, /export declare const ElevationProfile/);
    assert.match(dts, /points:\s*ElevationPoint\[\]/);
    assert.match(dts, /width\?.*number/);
    assert.match(dts, /height\?.*number/);
  });

  // rtmx:req REQ-CMP-010
  it('REQ-CMP-010: ElevationPoint type exported with distance and elevation fields', () => {
    assert.match(dts, /ElevationPoint/);
    assert.match(dts, /distance:\s*number/);
    assert.match(dts, /elevation:\s*number/);
  });
});
