import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DIST = resolve(ROOT, 'packages', 'react', 'dist');

// rtmx:req REQ-CMP-003
describe('DockPane component exports (REQ-CMP-003)', () => {
  let dts;

  before(() => {
    dts = readFileSync(resolve(DIST, 'index.d.ts'), 'utf8');
  });

  // rtmx:req REQ-CMP-003
  it('REQ-CMP-003: DockPane component is exported', () => {
    assert.match(dts, /export declare const DockPane/);
  });

  // rtmx:req REQ-CMP-003
  it('REQ-CMP-003: DockPaneProps includes open boolean prop', () => {
    assert.match(dts, /open:\s*boolean/);
  });

  // rtmx:req REQ-CMP-003
  it('REQ-CMP-003: DockPaneProps includes onClose callback', () => {
    assert.match(dts, /onClose\?.*\(\)\s*=>\s*void/);
  });

  // rtmx:req REQ-CMP-003
  it('REQ-CMP-003: DockPaneProps includes title prop', () => {
    assert.match(dts, /title\?.*string/);
  });

  // rtmx:req REQ-CMP-003
  it('REQ-CMP-003: DockPaneProps includes position prop with left, right, bottom', () => {
    assert.match(dts, /position\?.*'left'.*'right'.*'bottom'/s);
  });

  // rtmx:req REQ-CMP-003
  it('REQ-CMP-003: DockPaneProps includes width prop', () => {
    assert.match(dts, /width\?.*string\s*\|\s*number/);
  });

  // rtmx:req REQ-CMP-003
  it('REQ-CMP-003: DockPaneProps includes minimized prop', () => {
    assert.match(dts, /minimized\?.*boolean/);
  });

  // rtmx:req REQ-CMP-003
  it('REQ-CMP-003: DockPaneProps includes onMinimize callback', () => {
    assert.match(dts, /onMinimize\?.*\(\)\s*=>\s*void/);
  });
});
