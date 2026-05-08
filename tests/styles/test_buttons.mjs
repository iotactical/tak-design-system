import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_DIR = resolve(__dirname, '..', '..', 'tokens', 'w3c');
const atak = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'atak.json'), 'utf8'));

// rtmx:req REQ-STY-004
describe('REQ-STY-004: ATAK button style family tokens', () => {
  const dim = atak.atak.dimension.component;

  it('defines button-primary-height', () => {
    assert.ok(dim['button-primary-height']);
    assert.equal(dim['button-primary-height'].$value, '40px');
  });

  it('defines button-secondary-height', () => {
    assert.ok(dim['button-secondary-height']);
    assert.equal(dim['button-secondary-height'].$value, '44px');
  });

  it('defines button-marker-size and padding', () => {
    assert.ok(dim['button-marker-size']);
    assert.equal(dim['button-marker-size'].$value, '48px');
    assert.ok(dim['button-marker-padding']);
  });

  it('defines alert-button-height', () => {
    assert.ok(dim['alert-button-height']);
    assert.equal(dim['alert-button-height'].$value, '48px');
  });

  it('defines button-pressed semantic color', () => {
    assert.ok(atak.atak.semantic['button-pressed']);
    assert.equal(atak.atak.semantic['button-pressed'].$value, '{atak.color.taupe}');
  });

  it('defines button-foreground state list', () => {
    const bf = atak.atak.state['button-foreground'];
    assert.ok(bf.pressed);
    assert.ok(bf.selected);
    assert.ok(bf.default);
  });
});
