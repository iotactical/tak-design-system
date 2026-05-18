// rtmx:req REQ-SITE-006
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const PUBLIC = resolve(ROOT, 'site', 'public', 'palettes');
const DATA = resolve(ROOT, 'data');

describe('REQ-SITE-006: Palette icon rendering', () => {
  const sqlitePalettes = [
    { id: 'default', file: 'atak-palette-default.json' },
    { id: 'google', file: 'atak-palette-google.json' },
    { id: 'osm', file: 'atak-palette-osm.json' },
    { id: 'generic', file: 'atak-palette-generic.json' },
    { id: 'fema', file: 'atak-palette-fema.json' },
    { id: 'geoops', file: 'atak-palette-geoops.json' },
  ];

  const iconsetPalettes = [
    { id: 'responder', file: 'atak-iconset-responder.json' },
    { id: 'falconview', file: 'atak-iconset-falconview.json' },
    { id: 'air', file: 'atak-iconset-air.json' },
    { id: 'incident', file: 'atak-iconset-incident.json' },
  ];

  for (const { id, file } of sqlitePalettes) {
    it(`sqlite palette "${id}" has all icons on disk`, () => {
      const data = JSON.parse(readFileSync(resolve(DATA, file), 'utf8'));
      let missing = 0;
      let firstMissing = '';
      for (const g of data.groups) {
        for (const icon of g.icons) {
          const p = resolve(PUBLIC, id, g.name, icon.filename);
          if (!existsSync(p)) {
            missing++;
            if (!firstMissing) firstMissing = `${g.name}/${icon.filename}`;
          }
        }
      }
      assert.equal(missing, 0,
        `${id}: ${missing} icons missing (e.g. ${firstMissing})`);
    });
  }

  for (const { id, file } of iconsetPalettes) {
    it(`iconset palette "${id}" has all icons on disk`, () => {
      const data = JSON.parse(readFileSync(resolve(DATA, file), 'utf8'));
      let missing = 0;
      let firstMissing = '';
      for (const icon of data.icons) {
        const flat = resolve(PUBLIC, id, icon.name);
        const nested = resolve(PUBLIC, id, icon.path);
        if (!existsSync(flat) && !existsSync(nested)) {
          missing++;
          if (!firstMissing) firstMissing = icon.name;
        }
      }
      assert.equal(missing, 0,
        `${id}: ${missing} icons missing (e.g. ${firstMissing})`);
    });
  }

  it('all palette directories exist', () => {
    const expected = ['default', 'google', 'osm', 'generic', 'fema', 'geoops',
      'responder', 'falconview', 'air', 'incident'];
    for (const id of expected) {
      assert.ok(existsSync(resolve(PUBLIC, id)),
        `Palette directory missing: ${id}`);
    }
  });

  it('palette image paths use correct strategy in Palettes.tsx', () => {
    const src = readFileSync(
      resolve(ROOT, 'site', 'src', 'pages', 'Palettes.tsx'), 'utf8');
    // Verify the path resolution functions exist
    assert.match(src, /function paletteImgSrc/,
      'paletteImgSrc function must exist');
    assert.match(src, /function paletteImgFallback/,
      'paletteImgFallback function must exist');
    // Verify onError fallback is wired up
    assert.match(src, /onError.*paletteImgFallback/s,
      'img onError must use paletteImgFallback');
  });
});
