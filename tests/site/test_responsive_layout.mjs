// rtmx:req REQ-XW-262
// rtmx:req REQ-XW-263
// rtmx:req REQ-XW-264
// rtmx:req REQ-XW-265
// rtmx:req REQ-XW-266
// rtmx:req REQ-XW-267
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const SITE = resolve(ROOT, 'site', 'src');

const appCss = readFileSync(resolve(SITE, 'App.module.css'), 'utf8');
const appTsx = readFileSync(resolve(SITE, 'App.tsx'), 'utf8');

describe('REQ-XW-262: Define responsive breakpoints', () => {
  it('has mobile breakpoint media query (<768px)', () => {
    assert.ok(appCss.includes('max-width: 767px'), 'Should have mobile breakpoint at 767px');
  });

  it('has tablet breakpoint media query (1024px)', () => {
    assert.ok(appCss.includes('max-width: 1024px'), 'Should have tablet breakpoint at 1024px');
  });
});

describe('REQ-XW-263: Collapsible sidebar with hamburger toggle', () => {
  it('sidebar has translateX transform for mobile collapse', () => {
    assert.ok(appCss.includes('translateX(-100%)'), 'Sidebar should transform off-screen on mobile');
  });

  it('has sidebarOpen class for revealing sidebar', () => {
    assert.ok(appCss.includes('sidebarOpen'), 'Should have sidebarOpen modifier class');
    assert.ok(appCss.includes('translateX(0)'), 'sidebarOpen should bring sidebar back');
  });

  it('App.tsx has hamburger button', () => {
    assert.ok(appTsx.includes('hamburger'), 'Should have hamburger button');
    assert.ok(appTsx.includes('Toggle navigation'), 'Hamburger should have aria-label');
  });

  it('App.tsx has sidebarOpen state', () => {
    assert.ok(appTsx.includes('sidebarOpen'), 'Should have sidebarOpen state');
    assert.ok(appTsx.includes('setSidebarOpen'), 'Should have setSidebarOpen setter');
  });

  it('App.tsx has backdrop overlay', () => {
    assert.ok(appTsx.includes('backdrop'), 'Should have backdrop element');
    assert.ok(appTsx.includes('closeSidebar'), 'Should have closeSidebar handler');
  });

  it('nav links close sidebar on click', () => {
    assert.ok(appTsx.includes('onClick={closeSidebar}'), 'Nav links should close sidebar on click');
  });
});

describe('REQ-XW-264: Mobile topBar full-width layout', () => {
  it('topBar has left:0 in mobile media query', () => {
    // Check that within the mobile media query block, topBar gets left:0
    const mobileBlock = appCss.split('max-width: 767px')[1];
    assert.ok(mobileBlock, 'Mobile media query should exist');
    assert.ok(mobileBlock.includes('.topBar'), 'Mobile block should reference topBar');
    assert.ok(mobileBlock.includes('left: 0') || mobileBlock.includes('left:0'), 'topBar should have left:0 on mobile');
  });
});

describe('REQ-XW-265: Mobile content area padding and margins', () => {
  it('content has margin-left:0 on mobile', () => {
    const mobileBlock = appCss.split('max-width: 767px')[1];
    assert.ok(mobileBlock.includes('margin-left: 0') || mobileBlock.includes('margin-left:0'), 'Content should have margin-left:0 on mobile');
  });

  it('content has reduced padding on mobile', () => {
    const mobileBlock = appCss.split('max-width: 767px')[1];
    assert.ok(mobileBlock.includes('16px'), 'Content should have 16px padding on mobile');
  });

  it('pageTitle has smaller font on mobile', () => {
    const mobileBlock = appCss.split('max-width: 767px')[1];
    assert.ok(mobileBlock.includes('24px'), 'Page title should be 24px on mobile');
  });
});

describe('REQ-XW-266: Touch-friendly tap targets', () => {
  it('navLink has minimum 44px tap target on mobile', () => {
    const mobileBlock = appCss.split('max-width: 767px')[1];
    assert.ok(mobileBlock.includes('44px'), 'Nav links should have 44px min-height on mobile');
  });
});

describe('REQ-XW-267: Tablet intermediate layout', () => {
  it('sidebar is 200px on tablet', () => {
    const tabletBlock = appCss.split('max-width: 1024px')[1]?.split('@media')[0];
    assert.ok(tabletBlock, 'Tablet media query should exist');
    assert.ok(tabletBlock.includes('200px'), 'Sidebar should be 200px on tablet');
  });

  it('content has 24px padding on tablet', () => {
    const tabletBlock = appCss.split('max-width: 1024px')[1]?.split('@media')[0];
    assert.ok(tabletBlock.includes('24px'), 'Content should have 24px padding on tablet');
  });
});
