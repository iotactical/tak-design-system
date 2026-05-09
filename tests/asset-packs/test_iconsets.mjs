import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '..', '..', 'data');

/**
 * Helper: load and validate an iconset manifest.
 * Returns the parsed manifest object.
 */
function loadManifest(filename) {
  const filePath = resolve(DATA_DIR, filename);
  assert.ok(existsSync(filePath), `Manifest file missing: ${filename}`);
  const raw = readFileSync(filePath, 'utf-8');
  const manifest = JSON.parse(raw);
  assert.ok(manifest.iconset, 'manifest must have iconset field');
  assert.ok(typeof manifest.count === 'number', 'manifest must have numeric count field');
  assert.ok(Array.isArray(manifest.icons), 'manifest must have icons array');
  assert.equal(manifest.count, manifest.icons.length, 'count must match icons array length');
  return manifest;
}

// rtmx:req REQ-APK-002
describe('REQ-APK-002: ATAK responder iconset pack', () => {
  let manifest;

  it('manifest file exists and is valid JSON', () => {
    manifest = loadManifest('atak-iconset-responder.json');
  });

  it('has iconset, count, and icons fields', () => {
    if (!manifest) manifest = loadManifest('atak-iconset-responder.json');
    assert.equal(manifest.iconset, 'responder');
    assert.ok(manifest.count > 0);
    assert.ok(manifest.icons.length > 0);
  });

  it('contains 1000+ icons', () => {
    if (!manifest) manifest = loadManifest('atak-iconset-responder.json');
    assert.ok(
      manifest.count >= 1000,
      `Expected >= 1000 icons, found ${manifest.count}`
    );
  });

  it('each icon has name and path', () => {
    if (!manifest) manifest = loadManifest('atak-iconset-responder.json');
    for (const icon of manifest.icons) {
      assert.ok(icon.name, 'icon must have a name');
      assert.ok(icon.path, 'icon must have a path');
      assert.ok(icon.path.endsWith('.png'), 'icon path must end with .png');
    }
  });
});

// rtmx:req REQ-APK-003
describe('REQ-APK-003: ATAK FalconView iconset pack', () => {
  let manifest;

  it('manifest file exists and is valid JSON', () => {
    manifest = loadManifest('atak-iconset-falconview.json');
  });

  it('has iconset, count, and icons fields', () => {
    if (!manifest) manifest = loadManifest('atak-iconset-falconview.json');
    assert.equal(manifest.iconset, 'falconview');
    assert.ok(manifest.count > 0);
    assert.ok(manifest.icons.length > 0);
  });

  it('contains 400+ icons', () => {
    if (!manifest) manifest = loadManifest('atak-iconset-falconview.json');
    assert.ok(
      manifest.count >= 400,
      `Expected >= 400 icons, found ${manifest.count}`
    );
  });

  it('each icon has name and path', () => {
    if (!manifest) manifest = loadManifest('atak-iconset-falconview.json');
    for (const icon of manifest.icons) {
      assert.ok(icon.name, 'icon must have a name');
      assert.ok(icon.path, 'icon must have a path');
      assert.ok(icon.path.endsWith('.png'), 'icon path must end with .png');
    }
  });
});

// rtmx:req REQ-APK-004
describe('REQ-APK-004: ATAK air iconset pack', () => {
  let manifest;

  it('manifest file exists and is valid JSON', () => {
    manifest = loadManifest('atak-iconset-air.json');
  });

  it('has iconset, count, and icons fields', () => {
    if (!manifest) manifest = loadManifest('atak-iconset-air.json');
    assert.equal(manifest.iconset, 'air');
    assert.ok(manifest.count > 0);
    assert.ok(manifest.icons.length > 0);
  });

  it('contains 40+ icons', () => {
    if (!manifest) manifest = loadManifest('atak-iconset-air.json');
    assert.ok(
      manifest.count >= 40,
      `Expected >= 40 icons, found ${manifest.count}`
    );
  });

  it('each icon has name and path', () => {
    if (!manifest) manifest = loadManifest('atak-iconset-air.json');
    for (const icon of manifest.icons) {
      assert.ok(icon.name, 'icon must have a name');
      assert.ok(icon.path, 'icon must have a path');
      assert.ok(icon.path.endsWith('.png'), 'icon path must end with .png');
    }
  });
});

// rtmx:req REQ-APK-005
describe('REQ-APK-005: ATAK wildfire iconset pack', () => {
  let manifest;

  it('manifest file exists and is valid JSON', () => {
    manifest = loadManifest('atak-iconset-wildfire.json');
  });

  it('has iconset, count, and icons fields', () => {
    if (!manifest) manifest = loadManifest('atak-iconset-wildfire.json');
    assert.equal(manifest.iconset, 'wildfire');
    assert.ok(manifest.count > 0);
    assert.ok(manifest.icons.length > 0);
  });

  it('contains 40+ icons', () => {
    if (!manifest) manifest = loadManifest('atak-iconset-wildfire.json');
    assert.ok(
      manifest.count >= 40,
      `Expected >= 40 icons, found ${manifest.count}`
    );
  });

  it('each icon has name and path', () => {
    if (!manifest) manifest = loadManifest('atak-iconset-wildfire.json');
    for (const icon of manifest.icons) {
      assert.ok(icon.name, 'icon must have a name');
      assert.ok(icon.path, 'icon must have a path');
      assert.ok(icon.path.endsWith('.png'), 'icon path must end with .png');
    }
  });
});

// rtmx:req REQ-APK-006
describe('REQ-APK-006: ATAK incident management iconset pack', () => {
  let manifest;

  it('manifest file exists and is valid JSON', () => {
    manifest = loadManifest('atak-iconset-incident.json');
  });

  it('has iconset, count, and icons fields', () => {
    if (!manifest) manifest = loadManifest('atak-iconset-incident.json');
    assert.equal(manifest.iconset, 'incident');
    assert.ok(manifest.count > 0);
    assert.ok(manifest.icons.length > 0);
  });

  it('contains 10+ icons', () => {
    if (!manifest) manifest = loadManifest('atak-iconset-incident.json');
    assert.ok(
      manifest.count >= 10,
      `Expected >= 10 icons, found ${manifest.count}`
    );
  });

  it('each icon has name and path', () => {
    if (!manifest) manifest = loadManifest('atak-iconset-incident.json');
    for (const icon of manifest.icons) {
      assert.ok(icon.name, 'icon must have a name');
      assert.ok(icon.path, 'icon must have a path');
      assert.ok(icon.path.endsWith('.png'), 'icon path must end with .png');
    }
  });
});
