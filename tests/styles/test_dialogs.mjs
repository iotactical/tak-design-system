import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_DIR = resolve(__dirname, '..', '..', 'tokens', 'w3c');
const atak = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'atak.json'), 'utf8'));

// rtmx:req REQ-STY-006
describe('REQ-STY-006: ATAK dialog style tokens', () => {
  const dim = atak.atak.dimension.component;

  it('defines alert-dialog-corner-radius (18px)', () => {
    assert.equal(dim['alert-dialog-corner-radius'].$value, '18px');
  });

  it('defines standard-dialog-corner-radius (6px)', () => {
    assert.equal(dim['standard-dialog-corner-radius'].$value, '6px');
  });

  it('defines message-bar-height (34px)', () => {
    assert.equal(dim['message-bar-height'].$value, '34px');
  });

  it('defines text-size-large for dialog titles', () => {
    const font = atak.atak.dimension.font;
    assert.ok(font.medium, 'Missing medium font size for dialog text');
  });
});
