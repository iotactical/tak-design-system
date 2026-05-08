import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_DIR = resolve(__dirname, '..', '..', 'tokens', 'w3c');
const atak = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'atak.json'), 'utf8'));

// rtmx:req REQ-STY-008
describe('REQ-STY-008: ATAK list/table style tokens', () => {
  const dim = atak.atak.dimension.component;

  it('defines list item heights', () => {
    assert.equal(dim['list-item-height'].$value, '44px');
    assert.equal(dim['list-item-large-height'].$value, '62px');
    assert.equal(dim['list-item-drawer-height'].$value, '49px');
  });

  it('defines list item icon sizes', () => {
    assert.ok(dim['list-item-title-icon-size']);
    assert.ok(dim['list-item-large-title-icon-size']);
    assert.ok(dim['list-item-action-icon-size']);
  });

  it('defines list item margins', () => {
    assert.ok(dim['list-item-internal-margin']);
    assert.ok(dim['list-item-title-icon-margin']);
    assert.ok(dim['list-item-title-margin']);
  });

  it('defines listview font sizes', () => {
    assert.ok(atak.atak.dimension.font['listview-row']);
    assert.ok(atak.atak.dimension.font['listview-row-large']);
  });

  it('defines listview colors', () => {
    assert.ok(atak.atak.color['listview-background']);
    assert.ok(atak.atak.semantic['listview-divider']);
  });
});
