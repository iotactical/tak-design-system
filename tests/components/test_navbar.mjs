import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DIST = resolve(ROOT, 'packages', 'react', 'dist');

// rtmx:req REQ-CMP-001
describe('NavBar component exports (REQ-CMP-001)', () => {
  let dts;

  before(() => {
    dts = readFileSync(resolve(DIST, 'index.d.ts'), 'utf8');
  });

  // rtmx:req REQ-CMP-001
  it('REQ-CMP-001: NavBar component exported with correct props', () => {
    assert.match(dts, /export declare const NavBar/);
    assert.match(dts, /onMenuClick\?.*\(\)\s*=>\s*void/);
    assert.match(dts, /title\?.*string/);
    assert.match(dts, /actions\?.*NavBarAction\[\]/);
    assert.match(dts, /onSearch\?.*\(query:\s*string\)\s*=>\s*void/);
  });

  // rtmx:req REQ-CMP-001
  it('REQ-CMP-001: NavBarAction type exported with key, icon, onClick, label', () => {
    assert.match(dts, /NavBarAction/);
    assert.match(dts, /key:\s*string/);
    assert.match(dts, /icon:\s*ReactNode/);
    assert.match(dts, /onClick:\s*\(\)\s*=>\s*void/);
    assert.match(dts, /label\?.*string/);
  });
});
