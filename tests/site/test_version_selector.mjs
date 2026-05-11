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

  it('VersionSelector contains TAK version options', () => {
    const content = readFileSync(componentPath, 'utf8');
    assert.ok(content.includes('ATAK 4.x'), 'Must include ATAK 4.x');
    assert.ok(content.includes('ATAK 5.0'), 'Must include ATAK 5.0');
    assert.ok(content.includes('ATAK 5.1'), 'Must include ATAK 5.1');
    assert.ok(content.includes('ATAK 5.2'), 'Must include ATAK 5.2');
  });

  it('VersionSelector uses localStorage for persistence', () => {
    const content = readFileSync(componentPath, 'utf8');
    assert.ok(content.includes('localStorage'), 'Must use localStorage for persistence');
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
