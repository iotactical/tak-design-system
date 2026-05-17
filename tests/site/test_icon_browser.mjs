// rtmx:req REQ-SITE-003
// rtmx:req REQ-SITE-010
// rtmx:req REQ-SITE-011
// rtmx:req REQ-SITE-012
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

// REQ-SITE-010: 100% icon preview coverage
describe('REQ-SITE-010: 100% icon preview coverage', () => {
  it('test_all_icons_have_preview', () => {
    const source = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Icons.tsx'), 'utf8');
    // Selector cards must use pre-rendered PNGs, not the old placeholder approach
    assert.ok(source.includes('icons/selectors/'), 'Must reference selector preview PNGs');
    // Layer-list cards must use inline composition
    assert.ok(source.includes('LayerListPreview'), 'Must have LayerListPreview component');
  });

  it('test_no_placeholder_glyphs', () => {
    const source = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Icons.tsx'), 'utf8');
    // The old placeholder Unicode glyphs should not be used for selector/layer-list
    assert.ok(!source.includes('\\u21C4'), 'Must not use selector placeholder glyph');
    assert.ok(!source.includes('\\u29C9'), 'Must not use layer-list placeholder glyph');
  });

  it('test_selector_previews_loaded', () => {
    const source = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Icons.tsx'), 'utf8');
    // Selector preview path must reference the selectors/ directory from ICN-013
    assert.match(source, /icons\/selectors\/.*\.png/, 'Must load selector PNGs from selectors dir');
  });

  it('test_layer_list_previews_loaded', () => {
    const source = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Icons.tsx'), 'utf8');
    assert.ok(source.includes('atak-layer-lists.json'), 'Must import layer-list data');
    assert.ok(source.includes('layerListMap'), 'Must build layer-list lookup map');
  });

  it('test_selector_preview_pngs_exist', () => {
    const selectorsDir = resolve(ROOT, 'site', 'public', 'icons', 'selectors');
    assert.ok(existsSync(selectorsDir), 'selectors preview directory must exist');
    const pngs = readdirSync(selectorsDir).filter(f => f.endsWith('.png'));
    assert.ok(pngs.length >= 100, `Expected 100+ selector PNGs, got ${pngs.length}`);
  });

  it('test_layer_list_data_exists', () => {
    const llPath = resolve(ROOT, 'data', 'atak-layer-lists.json');
    assert.ok(existsSync(llPath), 'atak-layer-lists.json must exist');
    const data = JSON.parse(readFileSync(llPath, 'utf8'));
    assert.ok(data.length >= 36, `Expected 36+ layer-lists, got ${data.length}`);
  });

  it('test_fallback_logs_warning', () => {
    const source = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Icons.tsx'), 'utf8');
    assert.ok(source.includes('console.warn'), 'Fallback must log a console warning');
  });
});

// REQ-SITE-011: Selector state inspector
describe('REQ-SITE-011: Selector state inspector', () => {
  it('test_selector_inspector_opens', () => {
    const source = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Icons.tsx'), 'utf8');
    assert.ok(source.includes('SelectorInspector'), 'Must have SelectorInspector component');
    assert.ok(source.includes('inspectedSelector'), 'Must track inspected selector state');
  });

  it('test_selector_inspector_shows_all_states', () => {
    const source = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Icons.tsx'), 'utf8');
    assert.ok(source.includes('selector.states.map'), 'Must iterate all states');
    assert.ok(source.includes('StatePreview'), 'Must render StatePreview for each state');
  });

  it('test_selector_inspector_default_label', () => {
    const source = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Icons.tsx'), 'utf8');
    assert.ok(source.includes('Default (fallback)'), 'Must label default state');
  });

  it('test_selector_inspector_escape_close', () => {
    const source = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Icons.tsx'), 'utf8');
    assert.ok(source.includes('Escape'), 'Must handle Escape key to close');
  });

  it('test_selector_inspector_accessibility', () => {
    const source = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Icons.tsx'), 'utf8');
    assert.ok(source.includes('role="dialog"'), 'Inspector must have dialog role');
    assert.ok(source.includes('aria-label'), 'Inspector must have aria-label');
    assert.ok(source.includes('Close inspector'), 'Close button must have accessible label');
  });
});

// REQ-SITE-012: Layer-list inspector
describe('REQ-SITE-012: Layer-list layer inspector', () => {
  it('test_layer_list_inspector_opens', () => {
    const source = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Icons.tsx'), 'utf8');
    assert.ok(source.includes('LayerListInspector'), 'Must have LayerListInspector component');
    assert.ok(source.includes('inspectedLayerList'), 'Must track inspected layer-list state');
  });

  it('test_layer_list_inspector_shows_layers', () => {
    const source = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Icons.tsx'), 'utf8');
    assert.ok(source.includes('layerList.layers.map'), 'Must iterate all layers');
    assert.ok(source.includes('layer.index'), 'Must show layer index');
  });

  it('test_layer_list_inspector_toggle_layer', () => {
    const source = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Icons.tsx'), 'utf8');
    assert.ok(source.includes('visibleLayers'), 'Must track layer visibility');
    assert.ok(source.includes('toggleLayer'), 'Must have toggle function');
    assert.ok(source.includes('type="checkbox"'), 'Must have checkbox for toggling');
  });

  it('test_layer_list_inspector_stacking_order', () => {
    const source = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Icons.tsx'), 'utf8');
    // Composite preview renders layers in array order (0 = bottom)
    assert.ok(source.includes('layerList.layers.map'), 'Must render layers in order');
    assert.ok(source.includes("position: 'absolute'"), 'Must use absolute positioning for stacking');
  });

  it('test_layer_list_inspector_accessibility', () => {
    const source = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Icons.tsx'), 'utf8');
    assert.ok(source.includes('Layer-list inspector'), 'Must have inspector aria-label');
    assert.ok(source.includes('role="dialog"'), 'Must have dialog role');
  });
});
