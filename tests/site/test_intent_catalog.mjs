import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

// rtmx:req REQ-XW-113
describe('REQ-XW-113: ATAK intent catalog', () => {
  const catalogPath = resolve(ROOT, 'data', 'atak-intents.json');

  it('data/atak-intents.json exists', () => {
    assert.ok(existsSync(catalogPath), 'Intent catalog file must exist');
  });

  it('is valid JSON with totalCount and groups', () => {
    const raw = readFileSync(catalogPath, 'utf8');
    const catalog = JSON.parse(raw);
    assert.ok(typeof catalog.totalCount === 'number', 'must have numeric totalCount');
    assert.ok(Array.isArray(catalog.groups), 'must have groups array');
  });

  it('has 400+ intents', () => {
    const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
    assert.ok(catalog.totalCount >= 400, `expected 400+ intents, got ${catalog.totalCount}`);
  });

  it('groups have namespace and intents fields', () => {
    const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
    for (const group of catalog.groups) {
      assert.ok(typeof group.namespace === 'string', 'group must have namespace string');
      assert.ok(Array.isArray(group.intents), 'group must have intents array');
      assert.ok(group.intents.length > 0, `group ${group.namespace} must have at least one intent`);
      for (const intent of group.intents) {
        assert.ok(typeof intent.action === 'string', 'intent must have action');
        assert.ok(typeof intent.type === 'string', 'intent must have type');
        assert.ok(typeof intent.class === 'string', 'intent must have class');
      }
    }
  });

  it('groups are sorted alphabetically', () => {
    const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
    const namespaces = catalog.groups.map((g) => g.namespace);
    const sorted = [...namespaces].sort();
    assert.deepStrictEqual(namespaces, sorted, 'groups must be sorted alphabetically by namespace');
  });

  it('Interfaces.tsx imports atak-intents.json', () => {
    const pagePath = resolve(ROOT, 'site', 'src', 'pages', 'Interfaces.tsx');
    const content = readFileSync(pagePath, 'utf8');
    assert.ok(
      content.includes('atak-intents.json'),
      'Interfaces page must import atak-intents.json'
    );
  });
});
