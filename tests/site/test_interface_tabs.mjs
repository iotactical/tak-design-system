// rtmx:req REQ-XW-090
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

describe('REQ-XW-090: Interfaces page horizontal tabs', () => {
  const pagePath = resolve(ROOT, 'site', 'src', 'pages', 'Interfaces.tsx');
  const cssPath = resolve(ROOT, 'site', 'src', 'pages', 'Interfaces.module.css');

  let content;
  let css;

  it('Interfaces.tsx exists and can be read', () => {
    content = readFileSync(pagePath, 'utf8');
    assert.ok(content.length > 0, 'File must have content');
  });

  it('Interfaces.module.css exists and can be read', () => {
    css = readFileSync(cssPath, 'utf8');
    assert.ok(css.length > 0, 'CSS file must have content');
  });

  it('has External tab definition', () => {
    content = readFileSync(pagePath, 'utf8');
    assert.ok(
      content.includes("'external'") || content.includes('"external"'),
      'Must define an external tab ID'
    );
    assert.ok(
      content.includes("'External'") || content.includes('"External"'),
      'Must have External tab label'
    );
  });

  it('has Internal tab definition', () => {
    content = readFileSync(pagePath, 'utf8');
    assert.ok(
      content.includes("'internal'") || content.includes('"internal"'),
      'Must define an internal tab ID'
    );
    assert.ok(
      content.includes("'Internal'") || content.includes('"Internal"'),
      'Must have Internal tab label'
    );
  });

  it('has Intents tab definition', () => {
    content = readFileSync(pagePath, 'utf8');
    assert.ok(
      content.includes("'intents'") || content.includes('"intents"'),
      'Must define an intents tab ID'
    );
    assert.ok(
      content.includes('Intents'),
      'Must have Intents tab label'
    );
  });

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

  it('filters intent interfaces from internal interfaces', () => {
    content = readFileSync(pagePath, 'utf8');
    assert.ok(
      content.includes('intentCatalog') || content.includes('atak-intents'),
      'Must import intent catalog data'
    );
  });

  it('renders content conditionally based on activeTab', () => {
    content = readFileSync(pagePath, 'utf8');
    // Should show/hide sections based on activeTab
    assert.ok(
      content.includes("activeTab === 'external'") || content.includes('activeTab === "external"'),
      'Must conditionally render external section'
    );
    assert.ok(
      content.includes("activeTab === 'internal'") || content.includes('activeTab === "internal"'),
      'Must conditionally render internal section'
    );
    assert.ok(
      content.includes("activeTab === 'intents'") || content.includes('activeTab === "intents"'),
      'Must conditionally render intents section'
    );
  });
});
