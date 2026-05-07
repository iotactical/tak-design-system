import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DIST = resolve(ROOT, 'packages', 'react', 'dist');

// Verify exported APIs via type declarations (no DOM needed)
describe('React library exported APIs', () => {
  let dts;

  before(() => {
    // Build is handled by pretest script
    dts = readFileSync(resolve(DIST, 'index.d.ts'), 'utf8');
  });

  // rtmx:req REQ-RCT-001
  it('REQ-RCT-001: Button component exported with variant types', () => {
    assert.match(dts, /export declare const Button/);
    assert.match(dts, /ButtonVariant.*'primary'.*'secondary'.*'danger'/s);
    assert.match(dts, /ButtonHTMLAttributes/);
  });

  // rtmx:req REQ-RCT-002
  it('REQ-RCT-002: ToolBar component exported with slot props', () => {
    assert.match(dts, /export declare const ToolBar/);
    assert.match(dts, /leading\?.*ReactNode/);
    assert.match(dts, /title\?.*string/);
    assert.match(dts, /trailing\?.*ReactNode/);
  });

  // rtmx:req REQ-RCT-003
  it('REQ-RCT-003: Modal component exported with open/onClose props', () => {
    assert.match(dts, /export declare const Modal/);
    assert.match(dts, /open:\s*boolean/);
    assert.match(dts, /onClose\?/);
  });

  // rtmx:req REQ-RCT-004
  it('REQ-RCT-004: EditText component exported with label/error/slots', () => {
    assert.match(dts, /export declare const EditText/);
    assert.match(dts, /label\?.*string/);
    assert.match(dts, /error\?.*string/);
    assert.match(dts, /leading\?.*ReactNode/);
    assert.match(dts, /trailing\?.*ReactNode/);
    assert.match(dts, /InputHTMLAttributes/);
  });

  // rtmx:req REQ-RCT-005
  it('REQ-RCT-005: TabLayout component exported with controlled/uncontrolled', () => {
    assert.match(dts, /export declare const TabLayout/);
    assert.match(dts, /tabs:\s*Tab\[\]/);
    assert.match(dts, /defaultActiveKey\?/);
    assert.match(dts, /activeKey\?/);
    assert.match(dts, /onChange\?/);
  });

  // rtmx:req REQ-RCT-006
  it('REQ-RCT-006: TakThemeProvider and useTakTheme exported', () => {
    assert.match(dts, /export declare function TakThemeProvider/);
    assert.match(dts, /export declare function useTakTheme/);
    assert.match(dts, /defaultMode\?.*ThemeMode/);
    assert.match(dts, /mode:\s*ThemeMode/);
    assert.match(dts, /toggle:\s*\(\)\s*=>\s*void/);
  });
});
