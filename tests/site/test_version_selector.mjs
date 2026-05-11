import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

// rtmx:req REQ-XW-116
describe('REQ-XW-116: TAK version selector', () => {
  const componentPath = resolve(ROOT, 'site', 'src', 'components', 'VersionSelector.tsx');
  const appPath = resolve(ROOT, 'site', 'src', 'App.tsx');

  it('VersionSelector component exists', () => {
    assert.ok(existsSync(componentPath), 'VersionSelector.tsx must exist');
  });

  it('VersionSelector shows supported TAK versions', () => {
    const content = readFileSync(componentPath, 'utf8');
    assert.ok(content.includes('5.7.0'), 'Must show ATAK 5.7.0 (latest)');
    assert.ok(content.includes('5.5.1'), 'Must show ATAK 5.5.1 (N-2)');
  });

  it('App.tsx imports VersionSelector', () => {
    const content = readFileSync(appPath, 'utf8');
    assert.ok(
      content.includes('VersionSelector'),
      'App.tsx must import VersionSelector'
    );
  });

  it('App.tsx renders VersionSelector in sidebar', () => {
    const content = readFileSync(appPath, 'utf8');
    assert.ok(
      content.includes('<VersionSelector'),
      'App.tsx must render VersionSelector component'
    );
  });
});
