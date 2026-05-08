import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_DIR = resolve(__dirname, '..', '..', 'tokens', 'w3c');
const atak = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'atak.json'), 'utf8'));

// rtmx:req REQ-STY-007
describe('REQ-STY-007: ATAK navigation widget tokens', () => {
  const dim = atak.atak.dimension.component;

  it('defines nav-button-size (48px)', () => {
    assert.equal(dim['nav-button-size'].$value, '48px');
  });

  it('defines nav-child-button-size (40px)', () => {
    assert.equal(dim['nav-child-button-size'].$value, '40px');
  });

  it('defines nav-zoom-button-height (96px)', () => {
    assert.equal(dim['nav-zoom-button-height'].$value, '96px');
  });

  it('defines nav child dimensions', () => {
    assert.ok(dim['nav-child-width']);
    assert.ok(dim['nav-child-padding']);
    assert.ok(dim['nav-child-pointer-padding']);
    assert.ok(dim['nav-slider-icon-size']);
    assert.ok(dim['nav-grid-item-size']);
  });

  it('defines compass dimensions', () => {
    assert.ok(dim['dynamic-compass-height']);
    assert.ok(dim['dynamic-compass-arrow-padding']);
    assert.ok(atak.atak.dimension.font['compass-text']);
  });

  it('defines nav icon tint state list', () => {
    const it_ = atak.atak.state['icon-tint'];
    assert.ok(it_.pressed);
    assert.ok(it_.default);
  });

  it('defines nav item foreground state lists', () => {
    assert.ok(atak.atak.state['nav-item-foreground']);
    assert.ok(atak.atak.state['nav-item-foreground-white']);
    assert.ok(atak.atak.state['nav-settings-background']);
  });
});
