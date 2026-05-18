// rtmx:req REQ-SITE-018
// rtmx:req REQ-SITE-019
// rtmx:req REQ-SITE-020
// rtmx:req REQ-SITE-021
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distAssets = resolve(__dirname, '..', '..', 'site', 'dist', 'assets');
const distIndex = resolve(__dirname, '..', '..', 'site', 'dist', 'index.html');

describe('REQ-SITE-018: Single mil-sym renderer chunk', () => {
  it('build output contains exactly one C5Ren chunk', () => {
    const files = readdirSync(distAssets);
    const c5renChunks = files.filter(f => f.startsWith('C5Ren') && f.endsWith('.js'));
    assert.equal(c5renChunks.length, 1, `Expected 1 C5Ren chunk, found ${c5renChunks.length}: ${c5renChunks.join(', ')}`);
  });

  it('milsym-worker imports mil-sym-ts-web not mil-sym-ts', () => {
    const src = readFileSync(
      resolve(__dirname, '..', '..', 'site', 'src', 'workers', 'milsym-worker.ts'),
      'utf8',
    );
    assert.ok(src.includes('mil-sym-ts-web'), 'milsym-worker should import mil-sym-ts-web');
    assert.ok(!src.includes("'@armyc2.c5isr.renderer/mil-sym-ts'"), 'milsym-worker should not import mil-sym-ts (non-web)');
  });
});

describe('REQ-SITE-019: Preconnect to tile server origins', () => {
  let html;

  it('built index.html exists', () => {
    html = readFileSync(distIndex, 'utf8');
    assert.ok(html.length > 0);
  });

  it('has preconnect for Carto basemaps', () => {
    assert.ok(html.includes('rel="preconnect" href="https://a.basemaps.cartocdn.com"'),
      'Missing preconnect for Carto');
  });

  it('has preconnect for Esri satellite tiles', () => {
    assert.ok(html.includes('rel="preconnect" href="https://server.arcgisonline.com"'),
      'Missing preconnect for Esri');
  });

  it('has preconnect for MapLibre glyphs', () => {
    assert.ok(html.includes('rel="preconnect" href="https://demotiles.maplibre.org"'),
      'Missing preconnect for MapLibre glyphs');
  });
});

describe('REQ-SITE-020: Lazy-load search index', () => {
  it('GlobalSearch does not statically import searchIndex', () => {
    const src = readFileSync(
      resolve(__dirname, '..', '..', 'site', 'src', 'components', 'GlobalSearch.tsx'),
      'utf8',
    );
    // Should use dynamic import(), not static import { searchIndex }
    const staticImport = /^import\s+\{[^}]*searchIndex[^}]*\}\s+from/m;
    assert.ok(!staticImport.test(src), 'GlobalSearch should not statically import searchIndex');
    assert.ok(src.includes("import('../data/searchIndex')"), 'GlobalSearch should dynamically import searchIndex');
  });

  it('SearchResults does not statically import searchIndex', () => {
    const src = readFileSync(
      resolve(__dirname, '..', '..', 'site', 'src', 'pages', 'SearchResults.tsx'),
      'utf8',
    );
    const staticImport = /^import\s+\{[^}]*searchIndex[^}]*\}\s+from/m;
    assert.ok(!staticImport.test(src), 'SearchResults should not statically import searchIndex');
    assert.ok(src.includes("import('../data/searchIndex')"), 'SearchResults should dynamically import searchIndex');
  });

  it('search index is a separate chunk in build output', () => {
    const files = readdirSync(distAssets);
    const searchChunks = files.filter(f => f.startsWith('searchIndex') && f.endsWith('.js'));
    assert.ok(searchChunks.length >= 1, `Expected searchIndex chunk, found: ${searchChunks.join(', ')}`);
  });

  it('main bundle is under 250 KB', () => {
    const files = readdirSync(distAssets);
    const mainBundle = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
    assert.ok(mainBundle, 'Main bundle should exist');
    const size = statSync(resolve(distAssets, mainBundle)).size;
    const sizeKB = Math.round(size / 1024);
    assert.ok(sizeKB < 250, `Main bundle is ${sizeKB} KB, expected under 250 KB`);
  });
});

describe('REQ-SITE-021: Virtualized gallery grid', () => {
  it('gallery uses IntersectionObserver for lazy card rendering', () => {
    const src = readFileSync(
      resolve(__dirname, '..', '..', 'site', 'src', 'pages', 'MultipointGallery.tsx'),
      'utf8',
    );
    assert.ok(src.includes('IntersectionObserver'), 'Gallery should use IntersectionObserver');
    assert.ok(src.includes('LazyGalleryCard'), 'Gallery grid should use LazyGalleryCard wrapper');
  });

  it('lazy wrapper defers rendering until in view', () => {
    const src = readFileSync(
      resolve(__dirname, '..', '..', 'site', 'src', 'pages', 'MultipointGallery.tsx'),
      'utf8',
    );
    // The useInView hook should disconnect after first intersection
    assert.ok(src.includes('observer.disconnect'), 'Observer should disconnect after first intersection');
    // Cards should have data-testid for E2E tests
    assert.ok(src.includes('data-testid="gallery-card"'), 'Lazy cards should have gallery-card testid');
  });
});
