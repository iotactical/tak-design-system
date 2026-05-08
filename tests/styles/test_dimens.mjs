import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_DIR = resolve(__dirname, '..', '..', 'tokens', 'w3c');
const atak = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'atak.json'), 'utf8'));

// rtmx:req REQ-STY-002
describe('REQ-STY-002: ATAK dimension complete mapping', () => {
  const dim = atak.atak.dimension;

  it('has font size dimensions', () => {
    const font = dim.font;
    const required = [
      'text-size', 'draper-very-large', 'draper-large', 'draper-title',
      'draper-base', 'draper-small', 'spinner', 'label', 'small',
      'medium', 'tiny', 'listview-row', 'listview-row-large',
      'section-header', 'vehicle-text', 'compass-text'
    ];
    for (const name of required) {
      assert.ok(font[name], `Missing font dimension: ${name}`);
      assert.match(font[name].$value, /^\d+px$/, `Invalid value for font.${name}`);
    }
  });

  it('has spacing dimensions', () => {
    const spacing = dim.spacing;
    const required = [
      'auto-space', 'auto-space-big', 'auto-margin', 'auto-margin-2',
      'scroll-margin', 'padding-small', 'padding-medium', 'padding-large',
      'margin-small', 'margin-medium', 'margin-large'
    ];
    for (const name of required) {
      assert.ok(spacing[name], `Missing spacing dimension: ${name}`);
    }
  });

  it('has component dimensions', () => {
    const comp = dim.component;
    const required = [
      'nav-button-size', 'nav-zoom-button-height', 'button-primary-height',
      'button-secondary-height', 'button-marker-size', 'alert-button-height',
      'list-item-height', 'list-item-large-height', 'textview-height',
      'alert-dialog-corner-radius', 'standard-dialog-corner-radius',
      'message-bar-height', 'toolbar-corner-radius', 'toggle-width',
      'toggle-height', 'nineline-line-height', 'dynamic-compass-height'
    ];
    for (const name of required) {
      assert.ok(comp[name], `Missing component dimension: ${name}`);
    }
  });

  it('has at least 70 total dimensions', () => {
    let count = 0;
    for (const group of Object.values(dim)) {
      if (typeof group === 'object' && !group.$type) {
        count += Object.keys(group).filter(k => !k.startsWith('$')).length;
      }
    }
    assert.ok(count >= 70, `Expected >= 70 dimensions, found ${count}`);
  });
});
