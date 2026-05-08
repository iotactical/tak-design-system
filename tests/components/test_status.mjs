import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DIST = resolve(ROOT, 'packages', 'react', 'dist');

// rtmx:req REQ-CMP-009
describe('StatusIndicators component exports (REQ-CMP-009)', () => {
  let dts;

  before(() => {
    dts = readFileSync(resolve(DIST, 'index.d.ts'), 'utf8');
  });

  // rtmx:req REQ-CMP-009
  it('REQ-CMP-009: ConnectionStatus component exported with status and label props', () => {
    assert.match(dts, /export declare const ConnectionStatus/);
    assert.match(dts, /status:\s*ConnectionStatusValue/);
    assert.match(dts, /ConnectionStatusValue.*'online'.*'offline'.*'connecting'.*'error'/s);
    assert.match(dts, /label\?.*string/);
  });

  // rtmx:req REQ-CMP-009
  it('REQ-CMP-009: GPSStatus component exported with fixType, satellites, accuracy props', () => {
    assert.match(dts, /export declare const GPSStatus/);
    assert.match(dts, /fixType:\s*GPSFixType/);
    assert.match(dts, /GPSFixType.*'none'.*'2d'.*'3d'/s);
    assert.match(dts, /satellites\?.*number/);
    assert.match(dts, /accuracy\?.*number/);
  });
});
