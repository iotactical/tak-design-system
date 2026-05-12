import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

// rtmx:req REQ-XW-063
describe('REQ-XW-063: Interface browser page', () => {
  const pagePath = resolve(ROOT, 'site', 'src', 'pages', 'Interfaces.tsx');
  const appPath = resolve(ROOT, 'site', 'src', 'App.tsx');

  it('site/src/pages/Interfaces.tsx exists', () => {
    assert.ok(existsSync(pagePath), 'Interfaces page component must exist');
  });

  it('Interfaces.tsx imports tak-interfaces-external.json', () => {
    const content = readFileSync(pagePath, 'utf8');
    assert.ok(
      content.includes('tak-interfaces-external.json'),
      'Must import external interfaces JSON'
    );
  });

  it('Interfaces.tsx imports tak-interfaces-internal.json', () => {
    const content = readFileSync(pagePath, 'utf8');
    assert.ok(
      content.includes('tak-interfaces-internal.json'),
      'Must import internal interfaces JSON'
    );
  });

  it('App.tsx has /interfaces route', () => {
    const content = readFileSync(appPath, 'utf8');
    assert.ok(
      content.includes('/interfaces'),
      'App.tsx must contain /interfaces route'
    );
  });

  it('App.tsx imports Interfaces component', () => {
    const content = readFileSync(appPath, 'utf8');
    assert.ok(
      content.includes("./pages/Interfaces"),
      'App.tsx must import Interfaces component'
    );
  });
});
