import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_DIR = resolve(__dirname, '..', '..', 'tokens', 'w3c');
const atak = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'atak.json'), 'utf8'));

// rtmx:req REQ-STY-003
describe('REQ-STY-003: ATAK base theme token definition', () => {
  it('defines ATAK semantic color aliases', () => {
    const sem = atak.atak.semantic;
    const required = [
      'alert', 'button-pressed', 'map-text', 'tooltip-text',
      'highlight', 'callsign-default', 'callsign-alert', 'listview-divider'
    ];
    for (const name of required) {
      assert.ok(sem[name], `Missing semantic alias: ${name}`);
    }
  });

  it('semantic aliases reference atak.color tokens', () => {
    const sem = atak.atak.semantic;
    for (const [name, token] of Object.entries(sem)) {
      if (name.startsWith('$')) continue;
      const val = token.$value;
      assert.ok(
        val.startsWith('{atak.color.'),
        `${name} should reference atak.color.*, got: ${val}`
      );
    }
  });

  it('defines primary UI font as Nunito', () => {
    const font = atak.atak.font;
    assert.ok(font.primary, 'Missing primary font');
    assert.ok(
      font.primary.$value.toLowerCase().includes('nunito'),
      `Primary font should be Nunito, got: ${font.primary.$value}`
    );
  });

  it('defines all font families', () => {
    const font = atak.atak.font;
    const required = ['primary', 'primary-bold', 'digital', 'digital-bold', 'mono', 'condensed'];
    for (const name of required) {
      assert.ok(font[name], `Missing font family: ${name}`);
      assert.equal(font[name].$type, 'fontFamily');
    }
  });
});
