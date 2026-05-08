import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_DIR = resolve(__dirname, '..', '..', 'tokens', 'w3c');
const atak = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'atak.json'), 'utf8'));

// rtmx:req REQ-STY-001
describe('REQ-STY-001: ATAK color palette complete mapping', () => {
  const colors = atak.atak.color;

  const requiredColors = [
    'red', 'white', 'black', 'light-gray', 'lighter-gray', 'gray',
    'dark-gray', 'darker-gray', 'green', 'black-overlay',
    'black-overlay-transparent', 'heading-yellow', 'led-green', 'led-red',
    'actionbar-background', 'actionbar-background-empty', 'light-blue',
    'th-green', 'pastel-gray', 'pale-silver', 'ash-gray', 'atac-beige',
    'onyx', 'onyx-85', 'maize', 'taupe', 'taupe-gray', 'sand',
    'deep-carmine-pink', 'icterine', 'mint-green', 'ufo-green',
    'light-salmon-pink', 'manatee', 'medium-jungle-green', 'trolley-grey',
    'hansa-yellow', 'toolbar-tint', 'listview-background',
    'black-tooltip-overlay', 'text-shadow', 'bloodhound-info',
    'seekbar-background', 'send-label', 'receive-label'
  ];

  for (const name of requiredColors) {
    it(`atak.color.${name} exists with valid hex`, () => {
      assert.ok(colors[name], `Missing color: ${name}`);
      assert.ok(colors[name].$type === 'color', `Wrong type for ${name}`);
      const val = colors[name].$value;
      assert.match(val, /^#[0-9A-Fa-f]{6,8}$/, `Invalid hex for ${name}: ${val}`);
    });
  }

  it('has at least 45 named colors', () => {
    const count = Object.keys(colors).filter(k => !k.startsWith('$')).length;
    assert.ok(count >= 45, `Expected >= 45 colors, found ${count}`);
  });

  // rtmx:req REQ-STY-012
  it('REQ-STY-012: has all 9 color state lists', () => {
    const state = atak.atak.state;
    const required = [
      'button-foreground', 'icon-tint', 'nav-item-foreground',
      'nav-item-foreground-white', 'nav-settings-background',
      'textview', 'callsign-green-green', 'callsign-red-green',
      'callsign-red-red'
    ];
    for (const name of required) {
      assert.ok(state[name], `Missing state list: ${name}`);
    }
  });

  it('state lists have pressed/default states', () => {
    const bf = atak.atak.state['button-foreground'];
    assert.ok(bf.pressed, 'button-foreground missing pressed state');
    assert.ok(bf.default, 'button-foreground missing default state');
  });
});
