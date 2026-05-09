// rtmx:req REQ-ICN-008
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const JSON_PATH = resolve(__dirname, '..', '..', 'data', 'atak-radial-menus.json');

describe('REQ-ICN-008: ATAK radial menu definitions', () => {
  it('data/atak-radial-menus.json exists', () => {
    assert.ok(existsSync(JSON_PATH), 'Radial menus JSON file must exist');
  });

  it('is valid JSON', () => {
    const raw = readFileSync(JSON_PATH, 'utf8');
    assert.doesNotThrow(() => JSON.parse(raw), 'File must be valid JSON');
  });

  let data;
  try {
    data = JSON.parse(readFileSync(JSON_PATH, 'utf8'));
  } catch {
    data = { menus: [] };
  }

  it('has a menus array', () => {
    assert.ok(Array.isArray(data.menus), 'Top-level menus must be an array');
  });

  it('contains at least 90 menu definitions', () => {
    assert.ok(
      data.menus.length >= 90,
      `Expected >= 90 menus, got ${data.menus.length}`
    );
  });

  it('each menu has name and items array', () => {
    const bad = data.menus.filter(
      m => typeof m.name !== 'string' || !Array.isArray(m.items)
    );
    assert.equal(
      bad.length,
      0,
      `${bad.length} menus missing name or items array`
    );
  });

  it('at least 80% of items have an action field', () => {
    const allItems = data.menus.flatMap(m => m.items);
    const withAction = allItems.filter(i => typeof i.action === 'string');
    const pct = (withAction.length / allItems.length) * 100;
    assert.ok(
      pct >= 80,
      `Expected >= 80% items with action, got ${pct.toFixed(1)}% (${withAction.length}/${allItems.length})`
    );
  });

  it('at least 80% of items have an icon field', () => {
    const allItems = data.menus.flatMap(m => m.items);
    const withIcon = allItems.filter(i => typeof i.icon === 'string');
    const pct = (withIcon.length / allItems.length) * 100;
    assert.ok(
      pct >= 80,
      `Expected >= 80% items with icon, got ${pct.toFixed(1)}% (${withIcon.length}/${allItems.length})`
    );
  });

  it('some items reference sub-menus', () => {
    const allItems = data.menus.flatMap(m => m.items);
    const withSubmenu = allItems.filter(i => typeof i.submenu === 'string');
    assert.ok(
      withSubmenu.length >= 10,
      `Expected >= 10 items with submenu, got ${withSubmenu.length}`
    );
  });

  it('menu names are unique', () => {
    const names = data.menus.map(m => m.name);
    const unique = new Set(names);
    assert.equal(names.length, unique.size, 'Duplicate menu names found');
  });

  it('menus are sorted alphabetically by name', () => {
    for (let i = 1; i < data.menus.length; i++) {
      assert.ok(
        data.menus[i].name.localeCompare(data.menus[i - 1].name) >= 0,
        `Menus not sorted: ${data.menus[i - 1].name} > ${data.menus[i].name}`
      );
    }
  });
});
