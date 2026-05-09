// rtmx:req REQ-APK-010
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '..', '..', 'data');

/**
 * Helper: load and validate an SQLite palette manifest.
 * Returns the parsed manifest object.
 */
function loadPaletteManifest(slug) {
  const filename = `atak-palette-${slug}.json`;
  const filePath = resolve(DATA_DIR, filename);
  assert.ok(existsSync(filePath), `Manifest file missing: ${filename}`);
  const raw = readFileSync(filePath, 'utf-8');
  const manifest = JSON.parse(raw);
  return manifest;
}

function assertManifestStructure(manifest) {
  assert.ok(typeof manifest.name === 'string' && manifest.name.length > 0,
    'manifest must have a non-empty name');
  assert.ok(typeof manifest.uid === 'string' && manifest.uid.length > 0,
    'manifest must have a non-empty uid');
  assert.ok(typeof manifest.iconCount === 'number' && manifest.iconCount > 0,
    'manifest must have a positive iconCount');
  assert.ok(Array.isArray(manifest.groups), 'manifest must have groups array');
  assert.ok(manifest.groups.length > 0, 'manifest must have at least one group');

  for (const group of manifest.groups) {
    assert.ok(typeof group.name === 'string' && group.name.length > 0,
      'each group must have a non-empty name');
    assert.ok(Array.isArray(group.icons), 'each group must have an icons array');
    assert.ok(group.icons.length > 0, 'each group must have at least one icon');

    for (const icon of group.icons) {
      assert.ok(typeof icon.filename === 'string' && icon.filename.length > 0,
        'each icon must have a filename');
    }
  }
}

// rtmx:req REQ-APK-010
describe('REQ-APK-010: SQLite palette manifests exist for all 6 iconsets', () => {
  const slugs = ['default', 'generic', 'osm', 'google', 'fema', 'geoops'];

  for (const slug of slugs) {
    it(`atak-palette-${slug}.json exists`, () => {
      const filePath = resolve(DATA_DIR, `atak-palette-${slug}.json`);
      assert.ok(existsSync(filePath), `Missing manifest for ${slug}`);
    });
  }
});

// rtmx:req REQ-APK-010
describe('REQ-APK-010: Default palette has 800+ icons', () => {
  let manifest;

  it('manifest loads and has correct structure', () => {
    manifest = loadPaletteManifest('default');
    assertManifestStructure(manifest);
  });

  it('has 800+ icons', () => {
    if (!manifest) manifest = loadPaletteManifest('default');
    assert.ok(
      manifest.iconCount >= 800,
      `Expected >= 800 icons, found ${manifest.iconCount}`
    );
  });

  it('total icons across groups matches iconCount', () => {
    if (!manifest) manifest = loadPaletteManifest('default');
    const total = manifest.groups.reduce((sum, g) => sum + g.icons.length, 0);
    assert.equal(total, manifest.iconCount,
      `Group icon total (${total}) must match iconCount (${manifest.iconCount})`);
  });
});

// rtmx:req REQ-APK-010
describe('REQ-APK-010: Generic palette has 600+ icons', () => {
  let manifest;

  it('manifest loads and has correct structure', () => {
    manifest = loadPaletteManifest('generic');
    assertManifestStructure(manifest);
  });

  it('has 600+ icons', () => {
    if (!manifest) manifest = loadPaletteManifest('generic');
    assert.ok(
      manifest.iconCount >= 600,
      `Expected >= 600 icons, found ${manifest.iconCount}`
    );
  });
});

// rtmx:req REQ-APK-010
describe('REQ-APK-010: OSM palette has 300+ icons', () => {
  let manifest;

  it('manifest loads and has correct structure', () => {
    manifest = loadPaletteManifest('osm');
    assertManifestStructure(manifest);
  });

  it('has 300+ icons', () => {
    if (!manifest) manifest = loadPaletteManifest('osm');
    assert.ok(
      manifest.iconCount >= 300,
      `Expected >= 300 icons, found ${manifest.iconCount}`
    );
  });
});

// rtmx:req REQ-APK-010
describe('REQ-APK-010: Google palette has 90+ icons', () => {
  let manifest;

  it('manifest loads and has correct structure', () => {
    manifest = loadPaletteManifest('google');
    assertManifestStructure(manifest);
  });

  it('has 90+ icons', () => {
    if (!manifest) manifest = loadPaletteManifest('google');
    assert.ok(
      manifest.iconCount >= 90,
      `Expected >= 90 icons, found ${manifest.iconCount}`
    );
  });
});

// rtmx:req REQ-APK-010
describe('REQ-APK-010: FEMA palette has 40+ icons', () => {
  let manifest;

  it('manifest loads and has correct structure', () => {
    manifest = loadPaletteManifest('fema');
    assertManifestStructure(manifest);
  });

  it('has 40+ icons', () => {
    if (!manifest) manifest = loadPaletteManifest('fema');
    assert.ok(
      manifest.iconCount >= 40,
      `Expected >= 40 icons, found ${manifest.iconCount}`
    );
  });
});

// rtmx:req REQ-APK-010
describe('REQ-APK-010: GeoOps palette exists and has valid structure', () => {
  let manifest;

  it('manifest loads and has correct structure', () => {
    manifest = loadPaletteManifest('geoops');
    assertManifestStructure(manifest);
  });

  it('has icons', () => {
    if (!manifest) manifest = loadPaletteManifest('geoops');
    assert.ok(manifest.iconCount > 0, `Expected icons, found ${manifest.iconCount}`);
  });
});

// rtmx:req REQ-APK-010
describe('REQ-APK-010: All palette manifests have name, groups, and icons arrays', () => {
  const slugs = ['default', 'generic', 'osm', 'google', 'fema', 'geoops'];

  for (const slug of slugs) {
    it(`${slug} manifest has name, uid, iconCount, and groups with icons`, () => {
      const manifest = loadPaletteManifest(slug);
      assertManifestStructure(manifest);
    });
  }
});
