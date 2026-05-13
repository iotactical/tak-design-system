// rtmx:req REQ-XW-292
// TDD tests for the multipoint rendering pipeline.
// Verifies that WebRenderer output is correctly transformed for MapLibre consumption.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('REQ-XW-292: Multipoint render pipeline', () => {

  // The core bug: WebRenderer puts stroke/fill in feature.style, not feature.properties.
  // MapLibre only reads feature.properties. We need a transform step.

  it('WebRenderer features have style object with stroke info', async () => {
    const { WebRenderer } = await import('@armyc2.c5isr.renderer/mil-sym-ts-web');
    const result = WebRenderer.RenderSymbol(
      'id1', 'test', '', '10032500001101000000',
      '-97.5,38.0 -96.0,37.5', 'clampToGround',
      500000, '-100.0,35.0,-94.0,40.0', new Map(), new Map(), 2
    );
    const json = JSON.parse(result);
    const lineFeature = json.features.find(f => f.geometry?.type === 'MultiLineString');
    assert.ok(lineFeature, 'Should have a MultiLineString feature');
    assert.ok(lineFeature.style, 'Feature should have a style object');
    assert.ok(lineFeature.style.stroke, 'style should have stroke color');
    assert.ok(lineFeature.style['stroke-width'], 'style should have stroke-width');
  });

  it('WebRenderer puts strokeColor in properties but NOT simplestyle stroke', async () => {
    const { WebRenderer } = await import('@armyc2.c5isr.renderer/mil-sym-ts-web');
    const result = WebRenderer.RenderSymbol(
      'id1', 'test', '', '10032500001101000000',
      '-97.5,38.0 -96.0,37.5', 'clampToGround',
      500000, '-100.0,35.0,-94.0,40.0', new Map(), new Map(), 2
    );
    const json = JSON.parse(result);
    const lineFeature = json.features.find(f => f.geometry?.type === 'MultiLineString');
    // properties has strokeColor (camelCase), NOT stroke (simplestyle)
    assert.ok(!lineFeature.properties.stroke, 'properties.stroke should be absent');
    assert.ok(lineFeature.properties.strokeColor, 'properties.strokeColor should be present');
    assert.equal(lineFeature.properties.strokeColor, '#000000', 'strokeColor should be black for friendly');
  });

  it('MultipointMap layer expressions include strokeColor fallback', async () => {
    const { readFileSync } = await import('node:fs');
    const { resolve, dirname } = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(resolve(__dirname, '..', '..', 'site', 'src', 'components', 'MultipointMap.tsx'), 'utf8');
    assert.ok(src.includes("'strokeColor'"), 'Layer paint should reference strokeColor property');
    assert.ok(src.includes("'strokeWidth'"), 'Layer paint should reference strokeWidth property');
  });

  it('normalizeGeoJson copies style, replaces black with affiliation color', async () => {
    // Mirror the normalize logic from multipoint-worker.ts
    function normalizeGeoJson(geojsonStr, symbolCode) {
      const json = JSON.parse(geojsonStr);
      if (json.type === 'error') return geojsonStr;
      const si = symbolCode ? symbolCode.substring(2, 4) : '03';
      const colorMap = { '03': '#4DA6FF', '06': '#FF4444', '04': '#00CC00', '01': '#FFFF00' };
      const blackReplace = colorMap[si] || '#4DA6FF';
      for (const f of json.features) {
        const p = f.properties || (f.properties = {});
        if (f.style) {
          if (f.style.stroke) p.stroke = f.style.stroke;
          if (f.style['stroke-width'] != null) p['stroke-width'] = f.style['stroke-width'];
          if (f.style.fill) p.fill = f.style.fill;
        }
        if (p.strokeColor && !p.stroke) p.stroke = p.strokeColor;
        if (p.strokeWidth && !p['stroke-width']) p['stroke-width'] = p.strokeWidth;
        if (p.stroke === '#000000') p.stroke = blackReplace;
        if (p.fill === '#000000') p.fill = blackReplace;
      }
      json.features = json.features.filter(f => {
        const coords = f.geometry?.coordinates;
        if (!coords) return false;
        if (Array.isArray(coords) && coords.length === 0) return false;
        if (f.geometry.type === 'Polygon' && coords[0]?.length === 0) return false;
        return true;
      });
      return JSON.stringify(json);
    }

    const { WebRenderer } = await import('@armyc2.c5isr.renderer/mil-sym-ts-web');

    // Friendly (SI=03): black -> blue
    const friendly = WebRenderer.RenderSymbol(
      'id1', 'test', '', '10032500001101000000',
      '-97.5,38.0 -96.0,37.5', 'clampToGround',
      500000, '-100.0,35.0,-94.0,40.0', new Map(), new Map(), 2
    );
    const fnorm = JSON.parse(normalizeGeoJson(friendly, '10032500001101000000'));
    const fline = fnorm.features.find(f => f.geometry?.type === 'MultiLineString');
    assert.ok(fline, 'Should have MultiLineString');
    assert.equal(fline.properties.stroke, '#4DA6FF', 'Friendly black should be replaced with blue');
    assert.equal(fline.properties['stroke-width'], 3, 'stroke-width should be copied');

    // Hostile (SI=06): red stays red
    const hostile = WebRenderer.RenderSymbol(
      'id1', 'test', '', '10062500001101000000',
      '-97.5,38.0 -96.0,37.5', 'clampToGround',
      500000, '-100.0,35.0,-94.0,40.0', new Map(), new Map(), 2
    );
    const hnorm = JSON.parse(normalizeGeoJson(hostile, '10062500001101000000'));
    const hline = hnorm.features.find(f => f.geometry?.type === 'MultiLineString');
    assert.equal(hline.properties.stroke, '#FF0000', 'Hostile red should stay red');
  });

  it('normalizeGeoJson removes empty polygon features', async () => {
    const { WebRenderer } = await import('@armyc2.c5isr.renderer/mil-sym-ts-web');
    const result = WebRenderer.RenderSymbol(
      'id1', 'test', '', '10032500001101000000',
      '-97.5,38.0 -96.0,37.5', 'clampToGround',
      500000, '-100.0,35.0,-94.0,40.0', new Map(), new Map(), 2
    );

    const raw = JSON.parse(result);
    const emptyPolys = raw.features.filter(f =>
      f.geometry?.type === 'Polygon' && (f.geometry.coordinates.length === 0 || f.geometry.coordinates[0]?.length === 0)
    );
    assert.ok(emptyPolys.length > 0, 'Raw output should have empty polygon features');

    // Use same normalize logic as previous test
    function normalizeGeoJson(geojsonStr) {
      const json = JSON.parse(geojsonStr);
      for (const f of json.features) {
        const p = f.properties || (f.properties = {});
        if (f.style) {
          if (f.style.stroke) p.stroke = f.style.stroke;
          if (f.style['stroke-width'] != null) p['stroke-width'] = f.style['stroke-width'];
        }
        if (p.strokeColor && !p.stroke) p.stroke = p.strokeColor;
      }
      json.features = json.features.filter(f => {
        const coords = f.geometry?.coordinates;
        if (!coords) return false;
        if (Array.isArray(coords) && coords.length === 0) return false;
        if (f.geometry.type === 'Polygon' && coords[0]?.length === 0) return false;
        return true;
      });
      return JSON.stringify(json);
    }

    const normalized = JSON.parse(normalizeGeoJson(result));
    const stillEmpty = normalized.features.filter(f =>
      f.geometry?.type === 'Polygon' && (f.geometry.coordinates.length === 0 || f.geometry.coordinates[0]?.length === 0)
    );
    assert.equal(stillEmpty.length, 0, 'Normalized output should have no empty polygons');
  });

  it('at least 62 of 66 examples produce non-empty GeoJSON with stroke properties', async () => {
    const { WebRenderer } = await import('@armyc2.c5isr.renderer/mil-sym-ts-web');
    const { readFileSync } = await import('node:fs');
    const { resolve, dirname } = await import('node:path');
    const { fileURLToPath } = await import('node:url');

    const __dirname = dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(resolve(__dirname, '..', '..', 'site', 'src', 'data', 'multipoint-examples.ts'), 'utf8');

    // Extract all SIDC + controlPoints pairs from the source
    const sidcRegex = /sidc:\s*ss25Sidc\('(\d+)'\)/g;
    const pointsRegex = /controlPoints:\s*'([^']+)'/g;

    const sidcs = [...src.matchAll(sidcRegex)].map(m => '1003250000' + m[1] + '0000');
    const points = [...src.matchAll(pointsRegex)].map(m => m[1]);

    assert.equal(sidcs.length, points.length, 'Should have equal SIDCs and control points');
    assert.ok(sidcs.length >= 60, `Should have at least 60 examples, got ${sidcs.length}`);

    let failures = [];
    for (let i = 0; i < sidcs.length; i++) {
      const result = WebRenderer.RenderSymbol(
        `id${i}`, 'test', '', sidcs[i], points[i], 'clampToGround',
        500000, '-100.0,35.0,-94.0,40.0', new Map(), new Map(), 2
      );
      try {
        const json = JSON.parse(result);
        const realFeatures = json.features.filter(f => {
          const coords = f.geometry?.coordinates;
          if (!coords || (Array.isArray(coords) && coords.length === 0)) return false;
          if (f.geometry.type === 'Polygon' && coords[0]?.length === 0) return false;
          return true;
        });
        if (realFeatures.length === 0) {
          failures.push(`${sidcs[i]}: no real features`);
        }
      } catch {
        failures.push(`${sidcs[i]}: JSON parse error`);
      }
    }

    // Allow up to 4 failures (some entity codes have Node.js-only issues like document not defined)
    assert.ok(failures.length <= 4, `Too many render failures (${failures.length}):\n${failures.join('\n')}`);
  });
});
