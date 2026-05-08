import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DIST = resolve(ROOT, 'packages', 'react', 'dist');

// rtmx:req REQ-CMP-014
describe('ListView component exports (REQ-CMP-014)', () => {
  let dts;

  before(() => {
    dts = readFileSync(resolve(DIST, 'index.d.ts'), 'utf8');
  });

  // rtmx:req REQ-CMP-014
  it('REQ-CMP-014: ListView component is exported', () => {
    assert.match(dts, /export declare const ListView/);
  });

  // rtmx:req REQ-CMP-014
  it('REQ-CMP-014: ListViewProps type is exported', () => {
    assert.match(dts, /ListViewProps/);
  });

  // rtmx:req REQ-CMP-014
  it('REQ-CMP-014: ListItem type is exported with key and title', () => {
    assert.match(dts, /ListItem/);
    assert.match(dts, /key:\s*string/);
    assert.match(dts, /title:\s*string/);
  });

  // rtmx:req REQ-CMP-014
  it('REQ-CMP-014: ListViewProps includes items array', () => {
    assert.match(dts, /items:\s*ListItem\[\]/);
  });

  // rtmx:req REQ-CMP-014
  it('REQ-CMP-014: ListViewProps includes selection props', () => {
    assert.match(dts, /onItemClick\?/);
    assert.match(dts, /selectedKeys\?.*string\[\]/);
    assert.match(dts, /onSelectionChange\?/);
    assert.match(dts, /multiSelect\?.*boolean/);
  });

  // rtmx:req REQ-CMP-014
  it('REQ-CMP-014: ListItem supports subtitle and tertiary text tiers', () => {
    assert.match(dts, /subtitle\?.*string/);
    assert.match(dts, /tertiary\?.*string/);
  });

  // rtmx:req REQ-CMP-014
  it('REQ-CMP-014: ListItem supports icon and action slots', () => {
    assert.match(dts, /icon\?.*ReactNode/);
    assert.match(dts, /action\?.*ReactNode/);
  });
});
