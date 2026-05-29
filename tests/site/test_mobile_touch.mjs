// rtmx:req REQ-SITE-027
// rtmx:req REQ-SITE-028
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
