import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DIST = resolve(ROOT, 'packages', 'react', 'dist');

// rtmx:req REQ-CMP-011
describe('REQ-CMP-011: MarkerDetail component', () => {
  let dts;

  before(() => {
    dts = readFileSync(resolve(DIST, 'index.d.ts'), 'utf8');
  });

  // rtmx:req REQ-CMP-011
  it('MarkerDetail component exported', () => {
    assert.match(dts, /export declare const MarkerDetail/);
  });

  // rtmx:req REQ-CMP-011
  it('MarkerDetailProps type exported', () => {
    assert.match(dts, /MarkerDetailProps/);
  });

  // rtmx:req REQ-CMP-011
  it('MarkerAction type exported', () => {
    assert.match(dts, /MarkerAction/);
  });

  // rtmx:req REQ-CMP-011
  it('MarkerAffiliation type exported', () => {
    assert.match(dts, /MarkerAffiliation/);
  });

  // rtmx:req REQ-CMP-011
  it('callsign prop is required string', () => {
    assert.match(dts, /callsign:\s*string/);
  });

  // rtmx:req REQ-CMP-011
  it('type prop is optional string', () => {
    assert.match(dts, /type\?.*string/);
  });

  // rtmx:req REQ-CMP-011
  it('affiliation prop with correct union values', () => {
    assert.match(dts, /affiliation\?/);
    assert.match(dts, /'friendly'/);
    assert.match(dts, /'hostile'/);
    assert.match(dts, /'neutral'/);
    assert.match(dts, /'unknown'/);
    assert.match(dts, /'suspect'/);
    assert.match(dts, /'pending'/);
  });

  // rtmx:req REQ-CMP-011
  it('coordinate prop with lat, lon, and optional alt', () => {
    assert.match(dts, /coordinate\?/);
    assert.match(dts, /lat:\s*number/);
    assert.match(dts, /lon:\s*number/);
    assert.match(dts, /alt\?.*number/);
  });

  // rtmx:req REQ-CMP-011
  it('lastUpdate prop is optional Date', () => {
    assert.match(dts, /lastUpdate\?.*Date/);
  });

  // rtmx:req REQ-CMP-011
  it('stale prop is optional boolean', () => {
    assert.match(dts, /stale\?.*boolean/);
  });

  // rtmx:req REQ-CMP-011
  it('actions prop accepts MarkerAction array', () => {
    assert.match(dts, /actions\?.*MarkerAction\[\]/);
  });

  // rtmx:req REQ-CMP-011
  it('icon prop accepts ReactNode', () => {
    assert.match(dts, /icon\?/);
  });

  // rtmx:req REQ-CMP-011
  it('MarkerAction has key, label, onClick', () => {
    assert.match(dts, /key:\s*string/);
    assert.match(dts, /label:\s*string/);
    assert.match(dts, /onClick:\s*\(\)\s*=>\s*void/);
  });

  // rtmx:req REQ-CMP-011
  it('CSS module file exists with expected classes', () => {
    const cssPath = resolve(ROOT, 'packages', 'react', 'src', 'components', 'MarkerDetail', 'MarkerDetail.module.css');
    const css = readFileSync(cssPath, 'utf8');
    assert.match(css, /\.markerDetail/);
    assert.match(css, /\.header/);
    assert.match(css, /\.callsign/);
    assert.match(css, /\.callsignStale/);
    assert.match(css, /\.coordinates/);
    assert.match(css, /\.coordValue/);
    assert.match(css, /\.actionBar/);
    assert.match(css, /\.staleIndicator/);
  });
});
