import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_DIR = resolve(__dirname, '..', '..', 'tokens', 'w3c');
const atak = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'atak.json'), 'utf8'));

// rtmx:req REQ-STY-010
describe('REQ-STY-010: ATAK tab widget tokens', () => {
  it('defines tab text font size (fontSmall = 12px)', () => {
    assert.equal(atak.atak.dimension.font.small.$value, '12px');
  });

  it('defines button-foreground state for tab text color', () => {
    const bf = atak.atak.state['button-foreground'];
    assert.ok(bf.default, 'Tab text uses button-foreground default state');
    assert.equal(bf.default.$value, '{atak.color.pastel-gray}');
  });

  it('defines Nunito font for tab text', () => {
    assert.ok(atak.atak.font.primary.$value.includes('Nunito'));
  });
});
