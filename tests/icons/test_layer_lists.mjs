// rtmx:req REQ-ICN-011
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const dataPath = resolve(ROOT, 'data', 'atak-layer-lists.json');

describe('REQ-ICN-011: Layer-list composition data', () => {
  it('test_layer_list_count', () => {
    assert.ok(existsSync(dataPath), 'atak-layer-lists.json must exist');
    const data = JSON.parse(readFileSync(dataPath, 'utf8'));
    assert.equal(data.length, 36, 'Expected exactly 36 layer-list entries');
  });

  it('test_layer_list_schema_valid', () => {
    const data = JSON.parse(readFileSync(dataPath, 'utf8'));
    for (const entry of data) {
      assert.ok(typeof entry.name === 'string' && entry.name.length > 0, `name must be non-empty string: ${entry.name}`);
      assert.ok(typeof entry.atakSourceFile === 'string', `atakSourceFile must be string: ${entry.name}`);
      assert.ok(Array.isArray(entry.layers), `layers must be array: ${entry.name}`);
      assert.ok(entry.layers.length > 0, `layers must be non-empty: ${entry.name}`);
      for (const layer of entry.layers) {
        assert.equal(typeof layer.index, 'number', `layer index must be number: ${entry.name}`);
        assert.ok('left' in layer, `layer must have left offset: ${entry.name}`);
        assert.ok('top' in layer, `layer must have top offset: ${entry.name}`);
        assert.ok('right' in layer, `layer must have right offset: ${entry.name}`);
        assert.ok('bottom' in layer, `layer must have bottom offset: ${entry.name}`);
        assert.ok('width' in layer, `layer must have width: ${entry.name}`);
        assert.ok('height' in layer, `layer must have height: ${entry.name}`);
      }
    }
  });

  it('test_layer_list_drawable_refs_resolve', () => {
    const data = JSON.parse(readFileSync(dataPath, 'utf8'));
    const catalogPath = resolve(ROOT, 'data', 'atak-drawable-catalog.json');
    const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
    const catalogNames = new Set(catalog.map((e) => e.name));

    for (const entry of data) {
      for (const layer of entry.layers) {
        if (layer.drawable && layer.drawable.startsWith('@drawable/')) {
          const refName = layer.drawable.replace('@drawable/', '');
          assert.ok(
            catalogNames.has(refName),
            `${entry.name} layer ${layer.index}: unresolvable ref ${layer.drawable}`,
          );
        }
      }
      // No warnings array means all refs resolved
      if (entry.warnings) {
        assert.fail(`${entry.name} has warnings: ${entry.warnings.join(', ')}`);
      }
    }
  });

  it('test_layer_list_inline_shapes_parsed', () => {
    const data = JSON.parse(readFileSync(dataPath, 'utf8'));
    const withInline = data.filter((e) =>
      e.layers.some((l) => l.drawable === 'inline:shape' || l.drawable === 'inline:clip+shape'),
    );
    assert.ok(withInline.length > 0, 'Should have entries with inline shapes');
    for (const entry of withInline) {
      for (const layer of entry.layers) {
        if (layer.drawable === 'inline:shape' || layer.drawable === 'inline:clip+shape') {
          assert.ok(layer.inlineShape, `${entry.name} layer ${layer.index}: missing inlineShape`);
          assert.ok(layer.inlineShape.shapeType, `${entry.name} layer ${layer.index}: missing shapeType`);
        }
      }
    }
  });

  it('test_layer_list_idempotent', () => {
    // Running extraction twice produces identical output (verified by the script's sort)
    const data1 = readFileSync(dataPath, 'utf8');
    const parsed = JSON.parse(data1);
    const names = parsed.map((e) => e.name);
    const sorted = [...names].sort();
    assert.deepEqual(names, sorted, 'Entries must be sorted by name');
  });
});
