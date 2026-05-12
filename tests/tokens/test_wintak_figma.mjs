import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_DIR = resolve(__dirname, '..', '..', 'tokens', 'w3c');

function walkTokens(obj, cb, prefix = '') {
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && val.$value !== undefined) {
      cb(path, val);
    } else if (val && typeof val === 'object') {
      walkTokens(val, cb, path);
    }
  }
}

// rtmx:req REQ-XW-160a
describe('REQ-XW-160a: WinTAK desktop density and layout tokens', () => {
  it('wintak.json exists and is valid JSON', () => {
    const raw = readFileSync(resolve(TOKEN_DIR, 'wintak.json'), 'utf8');
    assert.doesNotThrow(() => JSON.parse(raw));
  });

  it('wintak.json has $type annotations on all leaf tokens', () => {
    const data = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'wintak.json'), 'utf8'));
    const missing = [];
    walkTokens(data, (path, token) => {
      if (token.$value !== undefined && token.$type === undefined) {
        missing.push(path);
      }
    });
    assert.equal(missing.length, 0, `Tokens missing $type: ${missing.join(', ')}`);
  });

  it('has wintak.density group with required dimension tokens', () => {
    const data = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'wintak.json'), 'utf8'));
    const density = data.wintak.density;
    assert.ok(density, 'Missing wintak.density group');
    const required = ['button-height', 'list-item-height', 'nav-button-size', 'icon-size', 'touch-target'];
    for (const key of required) {
      assert.ok(density[key], `Missing density token: ${key}`);
      assert.equal(density[key].$type, 'dimension');
    }
  });

  it('desktop density values are smaller than ATAK mobile', () => {
    const data = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'wintak.json'), 'utf8'));
    const density = data.wintak.density;
    // WinTAK desktop should have smaller touch targets than ATAK mobile
    assert.ok(parseInt(density['button-height'].$value) < 40, 'button-height should be < 40px (ATAK mobile)');
    assert.ok(parseInt(density['list-item-height'].$value) < 44, 'list-item-height should be < 44px (ATAK mobile)');
    assert.ok(parseInt(density['nav-button-size'].$value) < 48, 'nav-button-size should be < 48px (ATAK mobile)');
    assert.ok(parseInt(density['icon-size'].$value) < 24, 'icon-size should be < 24px (ATAK mobile)');
  });

  it('has wintak.layout group with panel and toolbar dimensions', () => {
    const data = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'wintak.json'), 'utf8'));
    const layout = data.wintak.layout;
    assert.ok(layout, 'Missing wintak.layout group');
    assert.ok(layout['toolbar-height'], 'Missing toolbar-height');
    assert.ok(layout['sidebar-width'], 'Missing sidebar-width');
  });

  it('has wintak.spacing group', () => {
    const data = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'wintak.json'), 'utf8'));
    assert.ok(data.wintak.spacing, 'Missing wintak.spacing group');
  });
});

// rtmx:req REQ-XW-160b
describe('REQ-XW-160b: WinTAK typography and font stack', () => {
  it('has wintak.font group with Segoe UI primary', () => {
    const data = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'wintak.json'), 'utf8'));
    const font = data.wintak.font;
    assert.ok(font, 'Missing wintak.font group');
    assert.ok(font.primary, 'Missing font.primary');
    assert.ok(font.primary.$value.includes('Segoe UI'), 'Primary font must include Segoe UI');
    assert.equal(font.primary.$type, 'fontFamily');
  });

  it('has wintak.font.mono with Windows monospace font', () => {
    const data = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'wintak.json'), 'utf8'));
    const mono = data.wintak.font.mono;
    assert.ok(mono, 'Missing font.mono');
    assert.ok(
      mono.$value.includes('Consolas') || mono.$value.includes('Cascadia'),
      'Mono font must include Consolas or Cascadia Code'
    );
  });

  it('has wintak.typography group with desktop-optimized sizes', () => {
    const data = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'wintak.json'), 'utf8'));
    const typo = data.wintak.typography;
    assert.ok(typo, 'Missing wintak.typography group');
    assert.ok(typo.base, 'Missing typography.base');
    assert.ok(parseInt(typo.base.$value) <= 14, 'Desktop base font should be <= 14px');
  });
});

// rtmx:req REQ-XW-160c
describe('REQ-XW-160c: WinTAK interaction states', () => {
  it('has wintak.state group with hover and focus tokens', () => {
    const data = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'wintak.json'), 'utf8'));
    const state = data.wintak.state;
    assert.ok(state, 'Missing wintak.state group');
    assert.ok(state['hover-overlay'], 'Missing hover-overlay');
    assert.ok(state['focus-ring-color'], 'Missing focus-ring-color');
    assert.ok(state['focus-ring-width'], 'Missing focus-ring-width');
  });

  it('has context menu and scrollbar tokens', () => {
    const data = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'wintak.json'), 'utf8'));
    const state = data.wintak.state;
    assert.ok(state['context-menu-hover'], 'Missing context-menu-hover');
    assert.ok(state['scrollbar-thumb'], 'Missing scrollbar-thumb');
    assert.ok(state['tooltip-background'], 'Missing tooltip-background');
  });
});
