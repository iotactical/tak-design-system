// rtmx:req REQ-ICN-013
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const selectorsPath = resolve(ROOT, 'data', 'atak-selectors.json');
const previewDir = resolve(ROOT, 'site', 'public', 'icons', 'selectors');
const manifestPath = resolve(previewDir, 'manifest.json');

describe('REQ-ICN-013: Selector preview PNGs', () => {
  it('test_selector_preview_count', () => {
    assert.ok(existsSync(previewDir), 'selectors preview directory must exist');
    const selectors = JSON.parse(readFileSync(selectorsPath, 'utf8'));
    const pngs = readdirSync(previewDir).filter((f) => f.endsWith('.png'));
    assert.equal(pngs.length, selectors.length, `Expected ${selectors.length} PNGs, got ${pngs.length}`);
  });

  it('test_selector_preview_dimensions', () => {
    // PNG header: bytes 16-19 = width, bytes 20-23 = height (big-endian uint32)
    const pngs = readdirSync(previewDir).filter((f) => f.endsWith('.png'));
    for (const png of pngs.slice(0, 20)) {
      const buf = readFileSync(resolve(previewDir, png));
      assert.ok(buf.length > 24, `${png} too small to be a valid PNG`);
      const width = buf.readUInt32BE(16);
      const height = buf.readUInt32BE(20);
      assert.equal(width, 48, `${png} width should be 48, got ${width}`);
      assert.equal(height, 48, `${png} height should be 48, got ${height}`);
    }
  });

  it('test_selector_preview_file_size', () => {
    const pngs = readdirSync(previewDir).filter((f) => f.endsWith('.png'));
    for (const png of pngs) {
      const size = statSync(resolve(previewDir, png)).size;
      assert.ok(size <= 10240, `${png} is ${size} bytes, exceeds 10KB limit`);
    }
  });

  it('test_selector_preview_manifest_complete', () => {
    assert.ok(existsSync(manifestPath), 'manifest.json must exist');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const selectors = JSON.parse(readFileSync(selectorsPath, 'utf8'));
    assert.equal(manifest.length, selectors.length, 'manifest must have entry per selector');
    for (const entry of manifest) {
      assert.ok(entry.name, 'manifest entry must have name');
      assert.ok(entry.path, 'manifest entry must have path');
      assert.ok(entry.method, 'manifest entry must have method');
      const pngExists = existsSync(resolve(ROOT, 'site', 'public', entry.path));
      assert.ok(pngExists, `PNG for ${entry.name} not found at ${entry.path}`);
    }
  });
});
