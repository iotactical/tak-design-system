// rtmx:req REQ-SITE-038
// rtmx:req REQ-SITE-039
// rtmx:req REQ-SITE-040
// rtmx:req REQ-SITE-041
// rtmx:req REQ-SITE-042
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

const appSrc = readFileSync(resolve(ROOT, 'site', 'src', 'App.tsx'), 'utf8');
const appCss = readFileSync(resolve(ROOT, 'site', 'src', 'App.module.css'), 'utf8');
const homeSrc = readFileSync(resolve(ROOT, 'site', 'src', 'pages', 'Home.tsx'), 'utf8');
const explorerSrc = readFileSync(resolve(ROOT, 'site', 'src', 'pages', 'Explorer.tsx'), 'utf8');
const sandboxSrc = readFileSync(resolve(ROOT, 'site', 'src', 'pages', 'Sandbox.tsx'), 'utf8');
const sandboxCss = readFileSync(resolve(ROOT, 'site', 'src', 'pages', 'Sandbox.module.css'), 'utf8');
const searchSrc = readFileSync(resolve(ROOT, 'site', 'src', 'components', 'GlobalSearch.tsx'), 'utf8');
const indexSrc = readFileSync(resolve(ROOT, 'site', 'src', 'data', 'searchIndex.ts'), 'utf8');

describe('REQ-SITE-038: Symbol Sandbox is a standalone first-class page', () => {
  it('test_sandbox_route: declares a dedicated /sandbox page', () => {
    assert.ok(existsSync(resolve(ROOT, 'site', 'src', 'pages', 'Sandbox.tsx')));
    assert.ok(appSrc.includes('path="/sandbox"'));
    assert.ok(appSrc.includes("./pages/Sandbox"));
    assert.ok(sandboxSrc.includes('data-testid="sandbox-page"'));
    assert.ok(!sandboxSrc.includes('Explorer'));
  });

  it('nav, Home, redirect, and search all point at /sandbox', () => {
    assert.ok(appSrc.includes("to: '/sandbox'"));
    assert.ok(appSrc.includes("label: 'Sandbox'"));
    assert.ok(homeSrc.includes("to: '/sandbox'"));
    assert.ok(homeSrc.includes("title: 'Sandbox'"));
    assert.ok(appSrc.includes('/explorer/build'));
    assert.ok(appSrc.includes('Navigate'));
    assert.ok(!explorerSrc.includes("id: 'build'"));
    assert.ok(!explorerSrc.includes('<BuildPanel'));
    assert.ok(searchSrc.includes("Build: '/sandbox'"));
    assert.ok(indexSrc.includes("name: 'Build'"));
    assert.ok(indexSrc.includes("path: '/sandbox'"));
  });
});

describe('REQ-SITE-039: Sandbox is a canvas-first layout on mobile', () => {
  it('test_sandbox_mobile_layout: large preview, no four-column SIDC grid, 44px targets', () => {
    const mobile = sandboxCss.substring(sandboxCss.indexOf('max-width: 767px'));
    assert.ok(sandboxCss.includes('min-height: 160px'));
    assert.ok(mobile.includes('min-height: 160px'));
    assert.ok(mobile.includes('.buildVersionGrid'));
    assert.ok(mobile.includes('display: none'));
    assert.ok(!mobile.includes('minmax(200px'));
    assert.ok(!mobile.includes('repeat(4'));
    assert.ok(mobile.includes('min-height: 44px'));
    const desktop = sandboxCss.substring(sandboxCss.indexOf('min-width: 768px'));
    assert.ok(desktop.includes('repeat(4, minmax(0, 1fr))') || sandboxCss.includes('repeat(4, minmax(0, 1fr))'));
  });
});

describe('REQ-SITE-040: Sandbox preview supports fullscreen', () => {
  it('test_sandbox_fullscreen: Fullscreen API with 100dvh fallback and chrome hidden', () => {
    assert.ok(sandboxSrc.includes('requestFullscreen'));
    assert.ok(sandboxSrc.includes('webkitRequestFullscreen'));
    assert.ok(sandboxCss.includes('100dvh'));
    assert.ok(sandboxSrc.includes('aria-pressed'));
    assert.ok(sandboxSrc.includes("'Escape'"));
    assert.ok(sandboxCss.includes('min-width: 44px') && sandboxCss.includes('.fullscreenBtn'));
    assert.ok(appCss.includes('html.sandbox-fullscreen'));
    assert.ok(appCss.includes('.shareFab'));
    assert.ok(appCss.includes('.hamburger'));
    assert.ok(appCss.includes('.sidebar'));
    assert.ok(appCss.includes('.topBar'));
  });
});

describe('REQ-SITE-041: Sandbox supports native touch interaction on the symbol', () => {
  it('test_sandbox_touch: Pointer Events scoped to the preview', () => {
    assert.ok(sandboxSrc.includes('onPointerDown'));
    assert.ok(sandboxSrc.includes('onPointerMove'));
    assert.ok(sandboxSrc.includes('onPointerUp'));
    assert.ok(!sandboxSrc.includes('onMouseDown={onPointer'));
    assert.ok(sandboxSrc.includes("touchAction: 'none'") || sandboxCss.includes('touch-action: none'));
    assert.ok(!sandboxSrc.includes("touchAction: 'none'") || !sandboxSrc.includes('document.body'));
    assert.ok(!sandboxCss.includes('body'));
    assert.ok(sandboxSrc.includes('sandbox-frame'));
    assert.ok(sandboxSrc.includes('sandbox-echelon-hit'));
    assert.ok(sandboxSrc.includes('SI_CYCLE'));
    assert.ok(sandboxSrc.includes('cycleEchelon'));
    assert.ok(sandboxSrc.includes('prefers-reduced-motion') || sandboxCss.includes('prefers-reduced-motion'));
    assert.ok(sandboxSrc.includes('sandbox-si-select'));
    assert.ok(sandboxSrc.includes('sandbox-echelon-select'));
  });
});

describe('REQ-SITE-042: Sandbox SIDC is addressable and construction is preserved', () => {
  it('test_sandbox_sidc_url: query hydrates SIDC; modifiers come from the catalog', () => {
    assert.ok(sandboxSrc.includes("searchParams.get('sidc')"));
    assert.ok(sandboxSrc.includes('replace: true'));
    assert.ok(sandboxSrc.includes('10031000001100000000') || sandboxSrc.includes('DEFAULT_D'));
    assert.ok(sandboxSrc.includes('SFGPU-----*****') || sandboxSrc.includes('DEFAULT_B'));
    assert.ok(sandboxSrc.includes('mod1Options'));
    assert.ok(sandboxSrc.includes('mod2Options'));
    assert.ok(sandboxSrc.includes('getModifierOptions'));
    assert.ok(sandboxSrc.includes('function BuildPanel'));
    assert.ok(sandboxSrc.includes('syncFromDFields'));
  });
});
