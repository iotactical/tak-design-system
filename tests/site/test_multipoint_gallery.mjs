import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const SITE = resolve(ROOT, 'site', 'src');

// rtmx:req REQ-XW-088
describe('REQ-XW-088: Multi-point graphics gallery with map preview', () => {
  it('MultipointGallery.tsx exists and imports MultipointMap', () => {
    const p = resolve(SITE, 'pages', 'MultipointGallery.tsx');
    assert.ok(existsSync(p), 'MultipointGallery.tsx should exist');
    const src = readFileSync(p, 'utf8');
    assert.ok(src.includes('MultipointMap'), 'Gallery should use MultipointMap');
    assert.ok(src.includes('useMultipointWorker'), 'Gallery should use multipoint worker hook');
  });

  it('multipoint-examples.ts exists with at least 5 canonical graphics', () => {
    const p = resolve(SITE, 'data', 'multipoint-examples.ts');
    assert.ok(existsSync(p), 'multipoint-examples.ts should exist');
    const src = readFileSync(p, 'utf8');
    const nameMatches = src.match(/name:\s*'/g) || [];
    assert.ok(nameMatches.length >= 5, `Should have at least 5 examples, found ${nameMatches.length}`);
  });

  it('examples include required graphic types', () => {
    const src = readFileSync(resolve(SITE, 'data', 'multipoint-examples.ts'), 'utf8');
    const required = ['Boundary', 'Phase Line', 'Axis of Advance', 'Direction of Attack', 'Engagement Area'];
    for (const name of required) {
      assert.ok(src.includes(name), `Missing required example: ${name}`);
    }
  });

  it('examples define controlPoints and point counts', () => {
    const src = readFileSync(resolve(SITE, 'data', 'multipoint-examples.ts'), 'utf8');
    assert.ok(src.includes('controlPoints'), 'Examples should define controlPoints');
    assert.ok(src.includes('minPoints'), 'Examples should define minPoints');
    assert.ok(src.includes('maxPoints'), 'Examples should define maxPoints');
  });

  it('gallery supports category filtering', () => {
    const src = readFileSync(resolve(SITE, 'pages', 'MultipointGallery.tsx'), 'utf8');
    assert.ok(src.includes('activeCategory'), 'Gallery should support category filtering');
    assert.ok(src.includes('MULTIPOINT_CATEGORIES'), 'Gallery should use category constants');
  });

  it('gallery supports affiliation selection', () => {
    const src = readFileSync(resolve(SITE, 'pages', 'MultipointGallery.tsx'), 'utf8');
    assert.ok(src.includes('affiliation'), 'Gallery should support affiliation selection');
    assert.ok(src.includes('Friendly'), 'Gallery should list friendly affiliation');
    assert.ok(src.includes('Hostile'), 'Gallery should list hostile affiliation');
  });

  it('App.tsx includes /multipoint route', () => {
    const src = readFileSync(resolve(SITE, 'App.tsx'), 'utf8');
    assert.ok(src.includes('/multipoint'), 'App should have /multipoint route');
    assert.ok(src.includes('MultipointGallery'), 'App should reference MultipointGallery');
  });

  it('MultipointGallery.module.css exists', () => {
    assert.ok(existsSync(resolve(SITE, 'pages', 'MultipointGallery.module.css')));
  });

  it('preview map fills its frame without reserved bottom padding', () => {
    const mapCss = readFileSync(resolve(SITE, 'components', 'MultipointMap.module.css'), 'utf8');
    assert.match(mapCss, /\.mapContainerSmall\s*\{[^}]*height:\s*100%/);
    assert.ok(!mapCss.includes('height: 200px'), 'Small map must not use a shorter fixed height than its frame');
    const gallery = readFileSync(resolve(SITE, 'pages', 'MultipointGallery.tsx'), 'utf8');
    assert.ok(gallery.includes('padding: 16'), 'Thumbnail fitBounds padding must stay tight so the graphic fills the preview');
    assert.ok(!gallery.includes('padding: 80'), '80px fitBounds padding left an empty band under the graphic');
  });
});
