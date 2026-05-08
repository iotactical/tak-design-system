import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_DIR = resolve(__dirname, '..', '..', 'tokens', 'w3c');
const atak = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'atak.json'), 'utf8'));

// rtmx:req REQ-STY-009
describe('REQ-STY-009: ATAK input widget tokens', () => {
  const dim = atak.atak.dimension.component;

  it('defines textview-height (44px)', () => {
    assert.equal(dim['textview-height'].$value, '44px');
  });

  it('defines edit-text-drawable-padding', () => {
    assert.ok(dim['edit-text-drawable-padding']);
  });

  it('defines spinner font size', () => {
    assert.ok(atak.atak.dimension.font.spinner);
    assert.equal(atak.atak.dimension.font.spinner.$value, '14px');
  });

  it('defines toggle dimensions', () => {
    assert.ok(dim['toggle-width']);
    assert.ok(dim['toggle-height']);
    assert.ok(dim['toggle-button-width']);
    assert.ok(dim['toggle-button-padding']);
    assert.ok(dim['toggle-textview-width']);
  });

  it('defines ash-gray for hint text color', () => {
    assert.ok(atak.atak.color['ash-gray']);
  });
});
