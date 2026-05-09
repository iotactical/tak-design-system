import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DIST = resolve(ROOT, 'packages', 'react', 'dist');

// rtmx:req REQ-CMP-012
describe('UserList component exports (REQ-CMP-012)', () => {
  let dts;

  before(() => {
    dts = readFileSync(resolve(DIST, 'index.d.ts'), 'utf8');
  });

  // rtmx:req REQ-CMP-012
  it('REQ-CMP-012: UserList component is exported', () => {
    assert.match(dts, /export declare const UserList/);
  });

  // rtmx:req REQ-CMP-012
  it('REQ-CMP-012: UserListProps type is exported', () => {
    assert.match(dts, /UserListProps/);
  });

  // rtmx:req REQ-CMP-012
  it('REQ-CMP-012: UserEntry type is exported', () => {
    assert.match(dts, /UserEntry/);
  });

  // rtmx:req REQ-CMP-012
  it('REQ-CMP-012: UserEntry includes uid and callsign', () => {
    assert.match(dts, /uid:\s*string/);
    assert.match(dts, /callsign:\s*string/);
  });

  // rtmx:req REQ-CMP-012
  it('REQ-CMP-012: UserEntry includes status with online, stale, offline', () => {
    assert.match(dts, /status:\s*['"]online['"]\s*\|\s*['"]stale['"]\s*\|\s*['"]offline['"]/);
  });

  // rtmx:req REQ-CMP-012
  it('REQ-CMP-012: UserEntry includes optional team and role', () => {
    assert.match(dts, /team\?.*string/);
    assert.match(dts, /role\?.*string/);
  });

  // rtmx:req REQ-CMP-012
  it('REQ-CMP-012: UserEntry includes optional lastUpdate as Date', () => {
    assert.match(dts, /lastUpdate\?.*Date/);
  });

  // rtmx:req REQ-CMP-012
  it('REQ-CMP-012: UserListProps includes users array', () => {
    assert.match(dts, /users:\s*UserEntry\[\]/);
  });

  // rtmx:req REQ-CMP-012
  it('REQ-CMP-012: UserListProps includes onUserClick callback', () => {
    assert.match(dts, /onUserClick\?/);
  });

  // rtmx:req REQ-CMP-012
  it('REQ-CMP-012: UserListProps includes selection props', () => {
    assert.match(dts, /selectedKeys\?.*string\[\]/);
    assert.match(dts, /onSelectionChange\?/);
  });

  // rtmx:req REQ-CMP-012
  it('REQ-CMP-012: UserListProps includes filter prop', () => {
    assert.match(dts, /filter\?.*['"]all['"]\s*\|\s*['"]online['"]\s*\|\s*['"]stale['"]/);
  });
});
