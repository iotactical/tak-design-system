import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DIST = resolve(ROOT, 'packages', 'react', 'dist');

// rtmx:req REQ-CMP-015
describe('REQ-CMP-015: DialogPanel component set', () => {
  let dts;

  before(() => {
    dts = readFileSync(resolve(DIST, 'index.d.ts'), 'utf8');
  });

  // rtmx:req REQ-CMP-015
  it('DialogPanel component exported', () => {
    assert.match(dts, /export declare const DialogPanel/);
  });

  // rtmx:req REQ-CMP-015
  it('DialogPanelProps type exported', () => {
    assert.match(dts, /DialogPanelProps/);
  });

  // rtmx:req REQ-CMP-015
  it('DialogAction type exported', () => {
    assert.match(dts, /DialogAction/);
  });

  // rtmx:req REQ-CMP-015
  it('open prop is required boolean', () => {
    assert.match(dts, /open:\s*boolean/);
  });

  // rtmx:req REQ-CMP-015
  it('onClose callback prop exists', () => {
    assert.match(dts, /onClose\?.*\(\)\s*=>\s*void/);
  });

  // rtmx:req REQ-CMP-015
  it('title prop exists', () => {
    assert.match(dts, /title\?.*string/);
  });

  // rtmx:req REQ-CMP-015
  it('variant prop with standard, alert, fullscreen options', () => {
    assert.match(dts, /variant\?/);
    assert.match(dts, /'standard'/);
    assert.match(dts, /'alert'/);
    assert.match(dts, /'fullscreen'/);
  });

  // rtmx:req REQ-CMP-015
  it('actions prop accepts DialogAction array', () => {
    assert.match(dts, /actions\?.*DialogAction\[\]/);
  });

  // rtmx:req REQ-CMP-015
  it('destructive prop exists', () => {
    assert.match(dts, /destructive\?.*boolean/);
  });

  // rtmx:req REQ-CMP-015
  it('DialogAction has label, onClick, and variant', () => {
    assert.match(dts, /label:\s*string/);
    assert.match(dts, /onClick:\s*\(\)\s*=>\s*void/);
  });
});
