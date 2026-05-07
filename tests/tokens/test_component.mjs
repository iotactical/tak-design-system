import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_DIR = resolve(__dirname, '..', '..', 'tokens', 'w3c');

const core = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'core.json'), 'utf8'));
const semantic = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'semantic.json'), 'utf8'));
const component = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'component.json'), 'utf8'));

// rtmx:req REQ-TOK-003
describe('REQ-TOK-003: Component token references', () => {
  it('has button component tokens with 3 variants', () => {
    for (const variant of ['primary', 'secondary', 'danger']) {
      assert.ok(component.button?.[variant], `Missing button.${variant}`);
      assert.ok(component.button[variant].background, `Missing button.${variant}.background`);
      assert.ok(component.button[variant].text, `Missing button.${variant}.text`);
    }
  });

  it('has toolbar component tokens', () => {
    assert.ok(component.toolbar?.height);
    assert.ok(component.toolbar?.background?.dark);
    assert.ok(component.toolbar?.background?.light);
    assert.ok(component.toolbar?.['icon-size']);
  });

  it('has sidebar component tokens', () => {
    assert.ok(component.sidebar?.width);
    assert.ok(component.sidebar?.['width-collapsed']);
    assert.ok(component.sidebar?.background?.dark);
    assert.ok(component.sidebar?.['item-height']);
  });

  it('has marker/CoT icon sizing tokens', () => {
    assert.ok(component.marker?.['size-sm']);
    assert.ok(component.marker?.['size-md']);
    assert.ok(component.marker?.['size-lg']);
    assert.ok(component.marker?.['label-font-size']);
  });

  it('has overlay tokens', () => {
    assert.ok(component.overlay?.background);
    assert.ok(component.overlay?.['border-radius']);
    assert.ok(component.overlay?.padding);
    assert.ok(component.overlay?.['text-color']);
  });

  it('has coordinate display tokens', () => {
    assert.ok(component['coordinate-display']?.['font-family']);
    assert.ok(component['coordinate-display']?.['font-size']);
    assert.ok(component['coordinate-display']?.['text-color']);
  });

  it('has alert banner tokens', () => {
    assert.ok(component['alert-banner']?.height);
    assert.ok(component['alert-banner']?.['success-background']);
    assert.ok(component['alert-banner']?.['warning-background']);
    assert.ok(component['alert-banner']?.['error-background']);
    assert.ok(component['alert-banner']?.['info-background']);
  });

  it('all token references resolve to core or semantic tokens', () => {
    const knownPaths = new Set();
    walkTokens(core, (path) => knownPaths.add(path));
    walkTokens(semantic, (path) => knownPaths.add(path));

    const unresolved = [];
    walkTokens(component, (path, token) => {
      const refs = String(token.$value).match(/\{([^}]+)\}/g);
      if (refs) {
        for (const ref of refs) {
          const refPath = ref.slice(1, -1);
          if (!knownPaths.has(refPath)) {
            unresolved.push(`${path} -> ${refPath}`);
          }
        }
      }
    });
    assert.equal(unresolved.length, 0, `Unresolved references:\n  ${unresolved.join('\n  ')}`);
  });
});

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
