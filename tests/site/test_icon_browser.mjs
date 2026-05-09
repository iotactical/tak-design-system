// rtmx:req REQ-SITE-003
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const SITE_DIR = resolve(ROOT, 'site');
const DIST_DIR = resolve(SITE_DIR, 'dist');

describe('REQ-SITE-003: Icon and drawable browser', () => {
  it('site/src/pages/Icons.tsx exists', () => {
    const iconsPage = resolve(SITE_DIR, 'src', 'pages', 'Icons.tsx');
    assert.ok(existsSync(iconsPage), 'Icons.tsx page must exist');
  });

  it('site/src/pages/Icons.module.css exists', () => {
    const iconsCss = resolve(SITE_DIR, 'src', 'pages', 'Icons.module.css');
    assert.ok(existsSync(iconsCss), 'Icons.module.css must exist');
  });

  it('Icons.tsx imports the drawable catalog', () => {
    const source = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Icons.tsx'), 'utf8');
    assert.ok(
      source.includes('atak-drawable-catalog.json'),
      'Icons.tsx must import atak-drawable-catalog.json'
    );
  });

  it('Icons.tsx has search input', () => {
    const source = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Icons.tsx'), 'utf8');
    assert.ok(source.includes('search') || source.includes('Search'), 'Must have search functionality');
    assert.ok(source.includes('<input'), 'Must have an input element for search');
  });

  it('Icons.tsx has category filter buttons', () => {
    const source = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Icons.tsx'), 'utf8');
    for (const cat of ['ic_menu', 'nav', 'btn', 'enter_location', 'toolbar', 'tab', 'toggle', 'other']) {
      assert.ok(source.includes(cat), `Must have category filter for: ${cat}`);
    }
  });

  it('Icons.tsx has type filter buttons', () => {
    const source = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Icons.tsx'), 'utf8');
    for (const type of ['vector', 'shape', 'selector', 'png', 'nine-patch']) {
      assert.ok(source.includes(type), `Must have type filter for: ${type}`);
    }
  });

  it('Icons.tsx shows item count', () => {
    const source = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Icons.tsx'), 'utf8');
    assert.ok(
      source.includes('of') && source.includes('items'),
      'Must display "X of Y items" count'
    );
  });

  it('Icons.tsx attempts SVG preview for vector types', () => {
    const source = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Icons.tsx'), 'utf8');
    assert.ok(
      source.includes('icons/svg/atak') || source.includes('.svg'),
      'Must reference SVG path for vector previews'
    );
  });

  it('site builds successfully', () => {
    // Install deps and build site
    execSync('npm install', { cwd: SITE_DIR, stdio: 'pipe', timeout: 120000 });
    execSync('npm run build', { cwd: SITE_DIR, stdio: 'pipe', timeout: 120000 });
    assert.ok(existsSync(DIST_DIR), 'dist directory must exist after build');
  });

  it('built JS references drawable catalog data', () => {
    assert.ok(existsSync(DIST_DIR), 'dist must exist from prior build');

    // Find the JS assets
    const assetsDir = resolve(DIST_DIR, 'assets');
    assert.ok(existsSync(assetsDir), 'dist/assets must exist');

    const jsFiles = readdirSync(assetsDir).filter(f => f.endsWith('.js'));
    assert.ok(jsFiles.length > 0, 'Must have at least one JS bundle');

    // Check that at least one JS file contains catalog entry names
    const allJs = jsFiles.map(f => readFileSync(resolve(assetsDir, f), 'utf8')).join('\n');

    // Check for a few known drawable names from the catalog
    assert.ok(
      allJs.includes('ab_solid_shadow_holo') || allJs.includes('ic_menu'),
      'Built JS must contain drawable catalog data (entry names or categories)'
    );
  });
});
