// rtmx:req REQ-XW-275
// rtmx:req REQ-XW-276
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(__dirname, '..', '..', 'site', 'src');

describe('REQ-XW-275: Multiple basemap style definitions', () => {
  const src = readFileSync(resolve(SITE, 'components', 'MultipointMap.tsx'), 'utf8');

  it('exports BASEMAP_STYLES constant', () => {
    assert.ok(src.includes('BASEMAP_STYLES'), 'Should export BASEMAP_STYLES');
  });

  it('defines at least 3 basemap styles', () => {
    assert.ok(src.includes("id: 'dark'"), 'Should have dark basemap');
    assert.ok(src.includes("id: 'terrain'"), 'Should have terrain basemap');
    assert.ok(src.includes("id: 'satellite'"), 'Should have satellite basemap');
  });

  it('dark basemap uses CartoDB dark tiles', () => {
    assert.ok(src.includes('dark_all'), 'Dark basemap should use CartoDB dark raster tiles');
  });

  it('terrain basemap uses CartoDB voyager', () => {
    assert.ok(src.includes('voyager'), 'Terrain basemap should use CartoDB voyager');
  });

  it('satellite basemap uses ESRI World Imagery', () => {
    assert.ok(src.includes('World_Imagery'), 'Satellite basemap should use ESRI World Imagery');
  });
});

describe('REQ-XW-276: Basemap toggle control in MultipointMap', () => {
  const src = readFileSync(resolve(SITE, 'components', 'MultipointMap.tsx'), 'utf8');
  const css = readFileSync(resolve(SITE, 'components', 'MultipointMap.module.css'), 'utf8');

  it('has basemap state in component', () => {
    assert.ok(src.includes('basemapIdx') || src.includes('basemapId'), 'Should have basemap state');
    assert.ok(src.includes('setBasemap') || src.includes('setBasemapIdx'), 'Should have basemap setter');
  });

  it('renders basemap toggle buttons', () => {
    assert.ok(src.includes('basemapToggle'), 'Should render basemapToggle container');
    assert.ok(src.includes('basemapBtn'), 'Should render basemapBtn buttons');
  });

  it('has active state for selected basemap', () => {
    assert.ok(src.includes('basemapBtnActive'), 'Should have active button style');
  });

  it('calls setStyle on basemap change', () => {
    assert.ok(src.includes('setStyle'), 'Should call setStyle to switch basemap');
  });

  it('CSS has basemap toggle styles', () => {
    assert.ok(css.includes('basemapToggle'), 'CSS should have basemapToggle');
    assert.ok(css.includes('basemapBtn'), 'CSS should have basemapBtn');
    assert.ok(css.includes('basemapBtnActive'), 'CSS should have basemapBtnActive');
  });

  it('re-adds GeoJSON layers after style change', () => {
    assert.ok(src.includes('style.load'), 'Should listen for style.load event');
    assert.ok(src.includes('addSource'), 'Should re-add source after style change');
  });
});
