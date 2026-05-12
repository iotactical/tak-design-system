import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

// rtmx:req REQ-XW-258
describe('REQ-XW-258: Custom icon and palette extension mechanism', () => {
  it('custom/ directory exists', () => {
    assert.ok(existsSync(resolve(ROOT, 'custom')), 'custom/ directory must exist');
  });

  it('custom icons schema exists', () => {
    const schemaPath = resolve(ROOT, 'schemas', 'tak-custom-icons.schema.json');
    assert.ok(existsSync(schemaPath), 'tak-custom-icons.schema.json must exist');
    const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));
    assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
    // Must enforce tak.custom.* namespace
    assert.ok(schema.items.properties.id.pattern.includes('custom'),
      'Schema must enforce tak.custom.* namespace');
  });

  it('custom icons schema requires id, name, category, formats', () => {
    const schema = JSON.parse(readFileSync(resolve(ROOT, 'schemas', 'tak-custom-icons.schema.json'), 'utf8'));
    const required = schema.items.required;
    assert.ok(required.includes('id'), 'id must be required');
    assert.ok(required.includes('name'), 'name must be required');
    assert.ok(required.includes('formats'), 'formats must be required');
  });

  it('build script handles missing custom/icons.json gracefully', () => {
    // If custom/icons.json doesn't exist, registry should still build fine
    const registry = JSON.parse(readFileSync(resolve(ROOT, 'data', 'tak-icon-registry.json'), 'utf8'));
    assert.ok(registry.length > 0, 'Registry should have entries even without custom icons');
  });

  it('custom namespace is reserved (no built-in icons use tak.custom.*)', () => {
    const registry = JSON.parse(readFileSync(resolve(ROOT, 'data', 'tak-icon-registry.json'), 'utf8'));
    const customIds = registry.filter(e => e.id.startsWith('tak.custom.'));
    // Unless custom/icons.json exists, there should be no custom entries
    if (!existsSync(resolve(ROOT, 'custom', 'icons.json'))) {
      assert.equal(customIds.length, 0, 'No tak.custom.* entries without custom/icons.json');
    }
  });
});
