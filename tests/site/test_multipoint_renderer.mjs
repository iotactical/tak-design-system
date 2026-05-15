import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const SITE = resolve(ROOT, 'site', 'src');

// rtmx:req REQ-XW-138
describe('REQ-XW-138: Multi-point graphics runtime renderer', () => {
  it('multipoint-worker.ts exists and uses WebRenderer', () => {
    const p = resolve(SITE, 'workers', 'multipoint-worker.ts');
    assert.ok(existsSync(p), 'multipoint-worker.ts should exist');
    const src = readFileSync(p, 'utf8');
    assert.ok(src.includes('WebRenderer'), 'Worker should use WebRenderer');
    assert.ok(src.includes('RenderSymbol'), 'Worker should call RenderSymbol');
    assert.ok(src.includes('controlPoints'), 'Worker should accept controlPoints');
  });

  it('worker handles errors with try/catch', () => {
    const src = readFileSync(resolve(SITE, 'workers', 'multipoint-worker.ts'), 'utf8');
    assert.ok(src.includes('catch'), 'Worker should catch errors');
    assert.ok(src.includes('error'), 'Worker should post error responses');
  });

  it('useMultipointWorker.ts exists with cache/pending pattern', () => {
    const p = resolve(SITE, 'hooks', 'useMultipointWorker.ts');
    assert.ok(existsSync(p), 'useMultipointWorker.ts should exist');
    const src = readFileSync(p, 'utf8');
    assert.ok(src.includes('sharedCache') || src.includes('cacheRef'), 'Hook should have cache');
    assert.ok(src.includes('sharedPending') || src.includes('pendingRef'), 'Hook should have pending map');
    assert.ok(src.includes('renderMultipoint'), 'Hook should export renderMultipoint');
    assert.ok(src.includes('ready'), 'Hook should export ready state');
  });

  it('MultipointMap.tsx exists with maplibre-gl import', () => {
    const p = resolve(SITE, 'components', 'MultipointMap.tsx');
    assert.ok(existsSync(p), 'MultipointMap.tsx should exist');
    const src = readFileSync(p, 'utf8');
    assert.ok(src.includes('maplibre-gl'), 'Component should import maplibre-gl');
    assert.ok(src.includes('geojson'), 'Component should handle GeoJSON data');
    assert.ok(src.includes('addSource'), 'Component should add GeoJSON source');
    assert.ok(src.includes('addLayer'), 'Component should add map layers');
  });

  it('MultipointMap supports click interaction', () => {
    const src = readFileSync(resolve(SITE, 'components', 'MultipointMap.tsx'), 'utf8');
    assert.ok(src.includes('onClick'), 'Component should support onClick prop');
  });

  it('maplibre-gl is in site/package.json dependencies', () => {
    const pkg = JSON.parse(readFileSync(resolve(ROOT, 'site', 'package.json'), 'utf8'));
    assert.ok(pkg.dependencies['maplibre-gl'], 'maplibre-gl should be a dependency');
  });

  it('MultipointMap.module.css exists', () => {
    assert.ok(existsSync(resolve(SITE, 'components', 'MultipointMap.module.css')));
  });
});
