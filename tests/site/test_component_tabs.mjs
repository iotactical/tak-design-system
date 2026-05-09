// rtmx:req REQ-XW-091
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

describe('REQ-XW-091: Components page horizontal tabs', () => {
  const pagePath = resolve(ROOT, 'site', 'src', 'pages', 'Components.tsx');
  const cssPath = resolve(ROOT, 'site', 'src', 'pages', 'Components.module.css');

  const EXPECTED_CATEGORIES = [
    'Layout',
    'Inputs',
    'Data Display',
    'Overlay',
    'Tactical',
    'Status',
  ];

  let content;
  let css;

  it('Components.tsx exists and can be read', () => {
    content = readFileSync(pagePath, 'utf8');
    assert.ok(content.length > 0, 'File must have content');
  });

  it('Components.module.css exists and can be read', () => {
    css = readFileSync(cssPath, 'utf8');
    assert.ok(css.length > 0, 'CSS file must have content');
  });

  for (const category of EXPECTED_CATEGORIES) {
    it(`has "${category}" category defined`, () => {
      content = readFileSync(pagePath, 'utf8');
      assert.ok(
        content.includes(`'${category}'`) || content.includes(`"${category}"`),
        `Must define category: ${category}`
      );
    });
  }

  it('uses tabBar CSS class', () => {
    content = readFileSync(pagePath, 'utf8');
    assert.ok(
      content.includes('styles.tabBar'),
      'Must use styles.tabBar for the tab container'
    );
  });

  it('uses tab and tabActive CSS classes', () => {
    content = readFileSync(pagePath, 'utf8');
    assert.ok(
      content.includes('styles.tab') && content.includes('styles.tabActive'),
      'Must use styles.tab and styles.tabActive for tab styling'
    );
  });

  it('CSS defines tabBar, tab, and tabActive classes', () => {
    css = readFileSync(cssPath, 'utf8');
    assert.ok(css.includes('.tabBar'), 'CSS must define .tabBar');
    assert.ok(css.includes('.tab'), 'CSS must define .tab');
    assert.ok(css.includes('.tabActive'), 'CSS must define .tabActive');
  });

  it('uses useState for activeTab state', () => {
    content = readFileSync(pagePath, 'utf8');
    assert.ok(
      content.includes('activeTab'),
      'Must track active tab in state'
    );
  });

  it('renders only the active category (not all categories at once)', () => {
    content = readFileSync(pagePath, 'utf8');
    // Should find the active group and render only that one
    assert.ok(
      content.includes('activeGroup') || content.includes('activeTab'),
      'Must filter components to show only active category'
    );
    // Should NOT iterate all groups rendering all at once (the old pattern)
    const allGroupsRender = /componentGallery\.map\(\(group\)/.test(content);
    assert.ok(
      !allGroupsRender,
      'Must NOT render all category groups at once -- should use tabs'
    );
  });

  it('derives tab list from componentGallery categories', () => {
    content = readFileSync(pagePath, 'utf8');
    assert.ok(
      content.includes('CATEGORY_TABS') || content.includes('componentGallery.map'),
      'Must derive tabs from component gallery categories'
    );
  });

  it('keeps all 28 components across all categories', () => {
    content = readFileSync(pagePath, 'utf8');
    // Check a sampling of component names from each category
    const sampleComponents = [
      'NavBar', 'ToolBar', 'DockPane',           // Layout
      'Button', 'EditText', 'Checkbox',            // Inputs
      'ListView', 'TabLayout', 'ProgressBar',      // Data Display
      'Modal', 'DialogPanel', 'RadialMenu',        // Overlay
      'ChatPanel', 'RoutePlanner', 'NineLineForm', // Tactical
      'ConnectionStatus', 'GPSStatus',             // Status
    ];
    for (const name of sampleComponents) {
      assert.ok(
        content.includes(`'${name}'`) || content.includes(`"${name}"`),
        `Must still include component: ${name}`
      );
    }
  });
});
