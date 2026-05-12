import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DATA = resolve(ROOT, 'data');

// rtmx:req REQ-XW-250
describe('REQ-XW-250: Canonical icon registry with stable semantic IDs', () => {
  let registry;

  it('tak-icon-registry.json exists', () => {
    assert.ok(existsSync(resolve(DATA, 'tak-icon-registry.json')));
  });

  it('parses as valid JSON array', () => {
    registry = JSON.parse(readFileSync(resolve(DATA, 'tak-icon-registry.json'), 'utf8'));
    assert.ok(Array.isArray(registry), 'Registry must be an array');
  });

  it('has at least 400 entries', () => {
    registry = registry || JSON.parse(readFileSync(resolve(DATA, 'tak-icon-registry.json'), 'utf8'));
    assert.ok(registry.length >= 5000, `Expected >= 5000 entries, got ${registry.length}`);
  });

  it('all entries have required fields', () => {
    registry = registry || JSON.parse(readFileSync(resolve(DATA, 'tak-icon-registry.json'), 'utf8'));
    const required = ['id', 'name', 'source', 'category', 'formats'];
    for (const entry of registry) {
      for (const field of required) {
        assert.ok(entry[field] !== undefined, `Entry ${entry.id || '?'} missing field: ${field}`);
      }
    }
  });

  it('all IDs match the tak.* semantic pattern', () => {
    registry = registry || JSON.parse(readFileSync(resolve(DATA, 'tak-icon-registry.json'), 'utf8'));
    const pattern = /^tak\.[a-z][a-z0-9]*(\.[a-z][a-z0-9-]*)*$/;
    const invalid = registry.filter(e => !pattern.test(e.id));
    assert.equal(invalid.length, 0, `Invalid IDs: ${invalid.map(e => e.id).join(', ')}`);
  });

  it('no duplicate IDs', () => {
    registry = registry || JSON.parse(readFileSync(resolve(DATA, 'tak-icon-registry.json'), 'utf8'));
    const ids = registry.map(e => e.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.equal(dupes.length, 0, `Duplicate IDs: ${[...new Set(dupes)].join(', ')}`);
  });

  it('entries are sorted by ID', () => {
    registry = registry || JSON.parse(readFileSync(resolve(DATA, 'tak-icon-registry.json'), 'utf8'));
    const ids = registry.map(e => e.id);
    const sorted = [...ids].sort();
    assert.deepStrictEqual(ids, sorted, 'Registry entries must be sorted by ID');
  });

  it('has entries from all expected sources', () => {
    registry = registry || JSON.parse(readFileSync(resolve(DATA, 'tak-icon-registry.json'), 'utf8'));
    const sources = new Set(registry.map(e => e.source));
    for (const expected of ['core', 'menu', 'nav', 'radial', 'svg', 'drawable', 'iconset', 'palette']) {
      assert.ok(sources.has(expected), `Missing source: ${expected}`);
    }
  });

  it('all format paths point to existing files', () => {
    registry = registry || JSON.parse(readFileSync(resolve(DATA, 'tak-icon-registry.json'), 'utf8'));
    const missing = [];
    for (const entry of registry) {
      for (const [fmt, path] of Object.entries(entry.formats)) {
        if (!existsSync(resolve(ROOT, path))) {
          missing.push(`${entry.id} ${fmt}: ${path}`);
        }
      }
    }
    assert.equal(missing.length, 0, `Missing files:\n${missing.slice(0, 10).join('\n')}`);
  });

  it('most entries have at least one format', () => {
    registry = registry || JSON.parse(readFileSync(resolve(DATA, 'tak-icon-registry.json'), 'utf8'));
    const empty = registry.filter(e => Object.keys(e.formats).length === 0);
    // Some icons reference Android-only drawables (.xml) or palette paths not available as web assets
    const ratio = (registry.length - empty.length) / registry.length;
    assert.ok(ratio >= 0.75, `Only ${(ratio * 100).toFixed(0)}% of entries have formats (need >= 75%)`);
  });
});

// rtmx:req REQ-XW-251
describe('REQ-XW-251: Radial action-to-icon mapping', () => {
  let radial;

  it('tak-radial-action-icons.json exists', () => {
    assert.ok(existsSync(resolve(DATA, 'tak-radial-action-icons.json')));
  });

  it('parses as valid JSON with actions array', () => {
    radial = JSON.parse(readFileSync(resolve(DATA, 'tak-radial-action-icons.json'), 'utf8'));
    assert.ok(Array.isArray(radial.actions), 'Must have actions array');
  });

  it('has at least 50 actions', () => {
    radial = radial || JSON.parse(readFileSync(resolve(DATA, 'tak-radial-action-icons.json'), 'utf8'));
    assert.ok(radial.actions.length >= 50, `Expected >= 50 actions, got ${radial.actions.length}`);
  });

  it('all actions have required fields', () => {
    radial = radial || JSON.parse(readFileSync(resolve(DATA, 'tak-radial-action-icons.json'), 'utf8'));
    for (const a of radial.actions) {
      assert.ok(a.action, 'Missing action field');
      assert.ok(a.iconId, `Missing iconId for action ${a.action}`);
      assert.ok(a.label, `Missing label for action ${a.action}`);
      assert.ok(Array.isArray(a.menus) && a.menus.length > 0, `Missing menus for action ${a.action}`);
    }
  });

  it('all iconIds reference valid registry entries', () => {
    radial = radial || JSON.parse(readFileSync(resolve(DATA, 'tak-radial-action-icons.json'), 'utf8'));
    const registry = JSON.parse(readFileSync(resolve(DATA, 'tak-icon-registry.json'), 'utf8'));
    const registryIds = new Set(registry.map(e => e.id));
    const invalid = radial.actions.filter(a => !registryIds.has(a.iconId));
    assert.equal(invalid.length, 0,
      `Actions referencing unknown icons: ${invalid.map(a => `${a.action} -> ${a.iconId}`).join(', ')}`);
  });

  it('actions are sorted alphabetically', () => {
    radial = radial || JSON.parse(readFileSync(resolve(DATA, 'tak-radial-action-icons.json'), 'utf8'));
    const actions = radial.actions.map(a => a.action);
    const sorted = [...actions].sort();
    assert.deepStrictEqual(actions, sorted, 'Actions must be sorted');
  });

  it('known radial actions are present', () => {
    radial = radial || JSON.parse(readFileSync(resolve(DATA, 'tak-radial-action-icons.json'), 'utf8'));
    const actionNames = new Set(radial.actions.map(a => a.action));
    assert.ok(actionNames.has('actions/remove.xml'), 'Missing remove action');
    assert.ok(actionNames.has('actions/showdetails.xml'), 'Missing showdetails action');
    assert.ok(actionNames.has('actions/move.xml'), 'Missing move action');
  });
});

// rtmx:req REQ-XW-254
describe('REQ-XW-254: Focused index files', () => {
  it('index.json manifest exists with expected structure', () => {
    const manifest = JSON.parse(readFileSync(resolve(DATA, 'index.json'), 'utf8'));
    assert.ok(manifest.version, 'Missing version');
    assert.ok(manifest.indexes?.icons, 'Missing icons index reference');
    assert.ok(manifest.indexes?.radial, 'Missing radial index reference');
    assert.ok(manifest.registries?.icons, 'Missing icons registry reference');
    assert.ok(manifest.registries?.radialActions, 'Missing radial registry reference');
  });

  it('icons.index.json maps IDs to file paths', () => {
    const index = JSON.parse(readFileSync(resolve(DATA, 'icons.index.json'), 'utf8'));
    assert.ok(typeof index === 'object', 'Must be an object');
    assert.ok(Object.keys(index).length >= 300, `Expected >= 300 entries, got ${Object.keys(index).length}`);
    // Spot check a known entry
    const sampleId = Object.keys(index)[0];
    assert.ok(sampleId.startsWith('tak.'), 'Keys must be semantic IDs');
    assert.ok(typeof index[sampleId] === 'string', 'Values must be file path strings');
  });

  it('radial.index.json maps actions to icon info', () => {
    const index = JSON.parse(readFileSync(resolve(DATA, 'radial.index.json'), 'utf8'));
    assert.ok(typeof index === 'object', 'Must be an object');
    assert.ok(Object.keys(index).length >= 50, `Expected >= 50 entries, got ${Object.keys(index).length}`);
    // Spot check
    const removeEntry = index['actions/remove.xml'];
    assert.ok(removeEntry, 'Missing actions/remove.xml entry');
    assert.ok(removeEntry.id?.startsWith('tak.'), 'Must have semantic ID');
  });

  it('all icons.index.json IDs exist in full registry', () => {
    const index = JSON.parse(readFileSync(resolve(DATA, 'icons.index.json'), 'utf8'));
    const registry = JSON.parse(readFileSync(resolve(DATA, 'tak-icon-registry.json'), 'utf8'));
    const registryIds = new Set(registry.map(e => e.id));
    const orphans = Object.keys(index).filter(id => !registryIds.has(id));
    assert.equal(orphans.length, 0, `Orphaned index IDs: ${orphans.join(', ')}`);
  });
});
