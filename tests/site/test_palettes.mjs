// rtmx:req REQ-SITE-005
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const SITE_DIR = resolve(ROOT, 'site');

describe('REQ-SITE-005: Palettes page', () => {
  it('site/src/pages/Palettes.tsx exists', () => {
    const palettesPage = resolve(SITE_DIR, 'src', 'pages', 'Palettes.tsx');
    assert.ok(existsSync(palettesPage), 'Palettes.tsx page must exist');
  });

  it('site/src/pages/Palettes.module.css exists', () => {
    const palettesCss = resolve(SITE_DIR, 'src', 'pages', 'Palettes.module.css');
    assert.ok(existsSync(palettesCss), 'Palettes.module.css must exist');
  });

  it('Palettes.tsx contains all 14 palette tab names', () => {
    const source = readFileSync(
      resolve(SITE_DIR, 'src', 'pages', 'Palettes.tsx'),
      'utf8'
    );

    const tabNames = [
      'Markers',
      'Spot Map',
      'Vehicle Models',
      'Reference Point',
      'Google',
      'OSM',
      'Generic Icons',
      'FEMA Icons',
      'Default',
      'FalconView',
      'Incident Mgmt',
      'Public Safety Air',
      'Responder',
      'GeoOps',
    ];

    for (const name of tabNames) {
      assert.ok(
        source.includes(name),
        `Palettes.tsx must contain tab name: ${name}`
      );
    }
  });

  it('App.tsx includes Palettes route', () => {
    const appSource = readFileSync(
      resolve(SITE_DIR, 'src', 'App.tsx'),
      'utf8'
    );
    assert.ok(
      appSource.includes("'/palettes'"),
      'App.tsx must have /palettes route'
    );
    assert.ok(
      appSource.includes('Palettes'),
      'App.tsx must reference Palettes component'
    );
  });

  it('App.tsx navItems includes Palettes entry', () => {
    const appSource = readFileSync(
      resolve(SITE_DIR, 'src', 'App.tsx'),
      'utf8'
    );
    assert.ok(
      appSource.includes("label: 'Palettes'"),
      'navItems must include Palettes label'
    );
  });
});
