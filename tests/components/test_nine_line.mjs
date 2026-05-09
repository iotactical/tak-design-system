import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DIST = resolve(ROOT, 'packages', 'react', 'dist');

// rtmx:req REQ-CMP-008
describe('REQ-CMP-008: NineLineForm component', () => {
  let dts;

  before(() => {
    dts = readFileSync(resolve(DIST, 'index.d.ts'), 'utf8');
  });

  // rtmx:req REQ-CMP-008
  it('NineLineForm component is exported', () => {
    assert.match(dts, /export declare const NineLineForm/);
  });

  // rtmx:req REQ-CMP-008
  it('NineLineFormProps type is exported', () => {
    assert.match(dts, /NineLineFormProps/);
  });

  // rtmx:req REQ-CMP-008
  it('NineLineTemplate type is exported with name and lines', () => {
    assert.match(dts, /NineLineTemplate/);
    assert.match(dts, /name:\s*string/);
    assert.match(dts, /lines:\s*NineLineLine\[\]/);
  });

  // rtmx:req REQ-CMP-008
  it('NineLineLine type has required fields', () => {
    assert.match(dts, /NineLineLine/);
    assert.match(dts, /number:\s*number/);
    assert.match(dts, /label:\s*string/);
    assert.match(dts, /field:\s*string/);
  });

  // rtmx:req REQ-CMP-008
  it('NineLineLine type supports text, coordinate, and select types', () => {
    assert.match(dts, /type\?:.*'text'.*'coordinate'.*'select'/);
  });

  // rtmx:req REQ-CMP-008
  it('NineLineLine type supports options for select fields', () => {
    assert.match(dts, /options\?:.*string\[\]/);
  });

  // rtmx:req REQ-CMP-008
  it('NineLineFormProps has template prop', () => {
    assert.match(dts, /template:\s*NineLineTemplate/);
  });

  // rtmx:req REQ-CMP-008
  it('NineLineFormProps has values prop', () => {
    assert.match(dts, /values\?:.*Record<string,\s*string>/);
  });

  // rtmx:req REQ-CMP-008
  it('NineLineFormProps has onChange callback', () => {
    assert.match(dts, /onChange\?:.*field:\s*string.*value:\s*string/);
  });

  // rtmx:req REQ-CMP-008
  it('NineLineFormProps has onSubmit callback', () => {
    assert.match(dts, /onSubmit\?:.*values:\s*Record<string,\s*string>/);
  });

  // rtmx:req REQ-CMP-008
  it('NineLineFormProps has readOnly prop', () => {
    assert.match(dts, /readOnly\?:.*boolean/);
  });

  // rtmx:req REQ-CMP-008
  it('NineLineFormProps has children prop', () => {
    assert.match(dts, /children\?:.*ReactNode/);
  });

  // rtmx:req REQ-CMP-008
  it('CSS module exists with dark background and compact layout', () => {
    const css = readFileSync(
      resolve(ROOT, 'packages', 'react', 'src', 'components', 'NineLineForm', 'NineLineForm.module.css'),
      'utf8'
    );
    assert.match(css, /--tak-nineline-line-height.*32px/, 'uses 32px line height token');
    assert.match(css, /--tak-nineline-line-height-tight.*22px/, 'uses 22px tight variant');
    assert.match(css, /--tak-surface-base-dark/, 'uses dark background token');
    assert.match(css, /font-weight:\s*700/, 'numbered labels are bold');
  });
});
