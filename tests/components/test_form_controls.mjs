import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DIST = resolve(ROOT, 'packages', 'react', 'dist');

// rtmx:req REQ-CMP-013
describe('REQ-CMP-013: Form controls component set', () => {
  let dts;

  before(() => {
    dts = readFileSync(resolve(DIST, 'index.d.ts'), 'utf8');
  });

  // rtmx:req REQ-CMP-013
  it('Checkbox component exported with correct props', () => {
    assert.match(dts, /export declare const Checkbox/);
    assert.match(dts, /CheckboxProps/);
    assert.match(dts, /checked\?.*boolean/);
    assert.match(dts, /label\?.*string/);
    assert.match(dts, /disabled\?.*boolean/);
  });

  // rtmx:req REQ-CMP-013
  it('Toggle component exported with correct props', () => {
    assert.match(dts, /export declare const Toggle/);
    assert.match(dts, /ToggleProps/);
    assert.match(dts, /checked\?.*boolean/);
    assert.match(dts, /label\?.*string/);
    assert.match(dts, /disabled\?.*boolean/);
  });

  // rtmx:req REQ-CMP-013
  it('Spinner component exported with correct props', () => {
    assert.match(dts, /export declare const Spinner/);
    assert.match(dts, /SpinnerProps/);
    assert.match(dts, /options:\s*Array/);
    assert.match(dts, /value\?.*string/);
    assert.match(dts, /disabled\?.*boolean/);
  });

  // rtmx:req REQ-CMP-013
  it('RadioGroup component exported with correct props', () => {
    assert.match(dts, /export declare const RadioGroup/);
    assert.match(dts, /RadioGroupProps/);
    assert.match(dts, /options:\s*RadioOption\[\]/);
    assert.match(dts, /name:\s*string/);
    assert.match(dts, /onChange\?/);
  });

  // rtmx:req REQ-CMP-013
  it('ProgressBar component exported with correct props', () => {
    assert.match(dts, /export declare const ProgressBar/);
    assert.match(dts, /ProgressBarProps/);
    assert.match(dts, /value:\s*number/);
    assert.match(dts, /variant\?.*ProgressBarVariant/);
    assert.match(dts, /ProgressBarVariant.*'default'.*'small'/s);
  });
});
