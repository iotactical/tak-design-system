// rtmx:req REQ-XW-100
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const SITE_DIR = resolve(ROOT, 'site');

describe('REQ-XW-100: 2525 Explorer page', () => {
  it('site/src/pages/Explorer.tsx exists', () => {
    const explorerPage = resolve(SITE_DIR, 'src', 'pages', 'Explorer.tsx');
    assert.ok(existsSync(explorerPage), 'Explorer.tsx page must exist');
  });

  it('site/src/pages/Explorer.module.css exists', () => {
    const explorerCss = resolve(SITE_DIR, 'src', 'pages', 'Explorer.module.css');
    assert.ok(existsSync(explorerCss), 'Explorer.module.css must exist');
  });

  it('Explorer.tsx contains Browse, Decode, Build, and Compare tabs', () => {
    const source = readFileSync(
      resolve(SITE_DIR, 'src', 'pages', 'Explorer.tsx'),
      'utf8'
    );

    const tabNames = ['Browse', 'Decode', 'Build', 'Compare'];
    for (const tab of tabNames) {
      assert.ok(
        source.includes(tab),
        `Explorer.tsx must reference the "${tab}" tab`
      );
    }
  });

  it('Explorer.tsx imports MilSymRenderer', () => {
    const source = readFileSync(
      resolve(SITE_DIR, 'src', 'pages', 'Explorer.tsx'),
      'utf8'
    );
    assert.ok(
      source.includes('MilSymRenderer'),
      'Explorer.tsx must import MilSymRenderer'
    );
  });

  it('Explorer.tsx imports entity data and crosswalk data', () => {
    const source = readFileSync(
      resolve(SITE_DIR, 'src', 'pages', 'Explorer.tsx'),
      'utf8'
    );
    assert.ok(
      source.includes('b-entities.json'),
      'Explorer.tsx must import b-entities.json'
    );
    assert.ok(
      source.includes('b2d.json'),
      'Explorer.tsx must import b2d.json'
    );
  });

  it('App.tsx has /explorer route', () => {
    const appSource = readFileSync(
      resolve(SITE_DIR, 'src', 'App.tsx'),
      'utf8'
    );
    assert.ok(
      appSource.includes("'/explorer'"),
      'App.tsx must have /explorer route'
    );
    assert.ok(
      appSource.includes('2525 Explorer'),
      'App.tsx must have 2525 Explorer nav item'
    );
  });

  it('App.tsx imports Explorer component', () => {
    const appSource = readFileSync(
      resolve(SITE_DIR, 'src', 'App.tsx'),
      'utf8'
    );
    assert.ok(
      appSource.includes("import Explorer from './pages/Explorer'"),
      'App.tsx must import Explorer'
    );
  });

  it('Explorer.tsx defines SYMBOL_SET_NAMES mapping', () => {
    const source = readFileSync(
      resolve(SITE_DIR, 'src', 'pages', 'Explorer.tsx'),
      'utf8'
    );
    assert.ok(
      source.includes('SYMBOL_SET_NAMES'),
      'Explorer.tsx must define SYMBOL_SET_NAMES'
    );
    // Verify key symbol sets are present
    for (const name of ['Air', 'Land Unit', 'Sea Surface', 'Activities']) {
      assert.ok(
        source.includes(name),
        `SYMBOL_SET_NAMES must include "${name}"`
      );
    }
  });
});
