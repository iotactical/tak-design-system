import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DIST = resolve(ROOT, 'packages', 'react', 'dist');

// rtmx:req REQ-XW-010
// rtmx:req REQ-XW-011
// rtmx:req REQ-XW-012
// rtmx:req REQ-XW-013
// rtmx:req REQ-XW-014
// rtmx:req REQ-XW-015
describe('SkittleMarker component exports (REQ-XW-010 through XW-015)', () => {
  let dts;

  before(() => {
    dts = readFileSync(resolve(DIST, 'index.d.ts'), 'utf8');
  });

  // rtmx:req REQ-XW-010
  it('REQ-XW-010: SkittleMarker component is exported', () => {
    assert.match(dts, /export declare const SkittleMarker/);
  });

  // rtmx:req REQ-XW-011
  it('REQ-XW-011: teamColor prop accepts ATAK team colors', () => {
    assert.match(dts, /teamColor\?.*TeamColor/);
    assert.match(dts, /TeamColor.*'white'.*'yellow'.*'orange'.*'magenta'.*'red'.*'maroon'.*'purple'.*'dark-blue'.*'blue'.*'cyan'.*'teal'.*'green'.*'dark-green'.*'brown'.*'pink'/s);
  });

  // rtmx:req REQ-XW-012
  it('REQ-XW-012: heading prop for arrow rotation', () => {
    assert.match(dts, /heading\?.*number/);
  });

  // rtmx:req REQ-XW-013
  it('REQ-XW-013: state prop for connectivity (connected, stale, expired)', () => {
    assert.match(dts, /state\?.*SkittleState/);
    assert.match(dts, /SkittleState.*'connected'.*'stale'.*'expired'/s);
  });

  // rtmx:req REQ-XW-014
  it('REQ-XW-014: role prop for team role indicator', () => {
    assert.match(dts, /role\?.*SkittleRole/);
    assert.match(dts, /SkittleRole.*'team-member'.*'team-lead'.*'hq'.*'sniper'.*'medic'.*'forward-observer'.*'rto'.*'k9'/s);
  });

  // rtmx:req REQ-XW-015
  it('REQ-XW-015: variant and affiliation props', () => {
    assert.match(dts, /variant\?.*SkittleVariant/);
    assert.match(dts, /SkittleVariant.*'arrow'.*'dot'/s);
    assert.match(dts, /affiliation\?.*SkittleAffiliation/);
    assert.match(dts, /SkittleAffiliation.*'friendly'.*'hostile'.*'neutral'.*'unknown'/s);
    assert.match(dts, /size\?.*number/);
  });
});
