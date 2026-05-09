import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DIST = resolve(ROOT, 'packages', 'react', 'dist');

// rtmx:req REQ-CMP-002
describe('RadialMenu component exports (REQ-CMP-002)', () => {
  let dts;

  before(() => {
    dts = readFileSync(resolve(DIST, 'index.d.ts'), 'utf8');
  });

  // rtmx:req REQ-CMP-002
  it('REQ-CMP-002: RadialMenu component exported with correct props', () => {
    assert.match(dts, /export declare const RadialMenu/);
    assert.match(dts, /open:\s*boolean/);
    assert.match(dts, /onClose\?.*\(\)\s*=>\s*void/);
    assert.match(dts, /items:\s*RadialMenuItem\[\]/);
    assert.match(dts, /position\?/);
    assert.match(dts, /sectors\?.*4\s*\|\s*6\s*\|\s*8/);
  });

  // rtmx:req REQ-CMP-002
  it('REQ-CMP-002: RadialMenuItem type exported with key, label, onClick, icon, disabled', () => {
    assert.match(dts, /RadialMenuItem/);
    assert.match(dts, /key:\s*string/);
    assert.match(dts, /label:\s*string/);
    assert.match(dts, /onClick:\s*\(\)\s*=>\s*void/);
    assert.match(dts, /icon\?.*ReactNode/);
    assert.match(dts, /disabled\?.*boolean/);
  });
});
