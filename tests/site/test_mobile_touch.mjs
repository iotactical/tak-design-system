// rtmx:req REQ-SITE-027
// rtmx:req REQ-SITE-028
// rtmx:req REQ-SITE-037
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteDir = resolve(__dirname, '..', '..', 'site', 'src');

function readCss(page) {
  return readFileSync(resolve(siteDir, 'pages', `${page}.module.css`), 'utf8');
}

describe('REQ-SITE-027: Component tab touch targets meet 44px minimum', () => {
  const pages = ['Components', 'Palettes', 'Explorer', 'Interfaces', 'Platforms'];

  for (const page of pages) {
    it(`${page} tabs have min-height: 44px on mobile`, () => {
      const css = readCss(page);
      assert.ok(css.includes('min-height: 44px'), `${page} mobile tabs should have min-height: 44px`);
    });
  }

  it('Components mobile tab padding is at least 12px vertical', () => {
    const css = readCss('Components');
    // Mobile section should have padding: 12px
    assert.ok(css.includes('padding: 12px'), 'Tab vertical padding should be at least 12px');
  });
});

describe('REQ-SITE-028: Safe-area-inset handling for notched phones', () => {
  const appCss = readFileSync(resolve(siteDir, 'App.module.css'), 'utf8');
  const indexHtml = readFileSync(resolve(siteDir, '..', 'index.html'), 'utf8');

  it('App shell uses env(safe-area-inset-bottom) on bottom bar', () => {
    assert.ok(appCss.includes('env(safe-area-inset-bottom'), 'Bottom bar should use safe-area-inset-bottom');
  });

  it('content area accounts for safe-area-inset in padding', () => {
    assert.ok(appCss.includes('env(safe-area-inset-right') || appCss.includes('env(safe-area-inset-left'),
      'Content should account for side safe-area insets');
  });

  it('sidebar bottom padding uses safe-area-inset', () => {
    assert.ok(appCss.includes('env(safe-area-inset-bottom'),
      'Sidebar should use safe-area-inset-bottom');
  });

  it('viewport meta tag includes viewport-fit=cover', () => {
    assert.ok(indexHtml.includes('viewport-fit=cover'),
      'Viewport meta should include viewport-fit=cover for safe-area to work');
  });

  it('does not block zoom with maximum-scale or user-scalable=no', () => {
    assert.ok(!indexHtml.includes('user-scalable=no'),
      'Should not block user zoom (WCAG violation)');
    assert.ok(!indexHtml.includes('maximum-scale=1'),
      'Should not restrict maximum scale');
  });
});

describe('REQ-SITE-037: Floating navigation controls stay visible with the drawer open', () => {
  const appCss = readFileSync(resolve(siteDir, 'App.module.css'), 'utf8');
  const appTsx = readFileSync(resolve(siteDir, 'App.tsx'), 'utf8');

  function zIndexOf(selector) {
    const rules = [...appCss.matchAll(new RegExp(`\\${selector}\\s*\\{([^}]*)\\}`, 'g'))];
    const values = rules
      .map((m) => m[1].match(/z-index:\s*(\d+)/))
      .filter(Boolean)
      .map((m) => Number(m[1]));
    assert.ok(values.length > 0, `${selector} declares no z-index`);
    return Math.max(...values);
  }

  it('paints both controls above the backdrop and the drawer', () => {
    const backdrop = zIndexOf('.backdrop');
    const sidebar = zIndexOf('.sidebar');
    for (const control of ['.hamburger', '.shareFab']) {
      const z = zIndexOf(control);
      assert.ok(z > backdrop, `${control} (${z}) must paint above the backdrop (${backdrop})`);
      assert.ok(z > sidebar, `${control} (${z}) must paint above the drawer (${sidebar})`);
    }
  });

  // The bottom bar is positioned with a z-index of its own, so a control nested
  // inside it can only be ordered against its siblings, never the backdrop.
  it('keeps the menu button out of the bottom bar stacking context', () => {
    const topBar = appTsx.match(/<div className=\{styles\.topBar\}>([\s\S]*?)<\/div>/);
    assert.ok(topBar, 'expected a topBar element');
    assert.ok(
      !topBar[1].includes('styles.hamburger'),
      'menu button must not be nested inside the bottom bar',
    );
    assert.ok(appTsx.includes('styles.hamburger'), 'menu button must still be rendered');
  });

  it('reflects drawer state on the menu button', () => {
    assert.match(appTsx, /aria-expanded=\{sidebarOpen\}/, 'menu button should carry aria-expanded');
    assert.match(appTsx, /sidebarOpen \? '\\u00D7'/, 'menu button should show a close glyph while open');
  });
});
