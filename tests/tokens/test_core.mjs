import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_DIR = resolve(__dirname, '..', '..', 'tokens', 'w3c');

// rtmx:req REQ-TOK-001
describe('REQ-TOK-001: W3C core token definitions', () => {
  const files = ['core.json', 'semantic.json', 'component.json'];

  for (const file of files) {
    it(`${file} is valid JSON`, () => {
      const raw = readFileSync(resolve(TOKEN_DIR, file), 'utf8');
      assert.doesNotThrow(() => JSON.parse(raw));
    });
  }

  it('core.json has $type annotations on leaf tokens', () => {
    const data = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'core.json'), 'utf8'));
    const missing = [];
    walkTokens(data, (path, token) => {
      if (token.$value !== undefined && token.$type === undefined) {
        missing.push(path);
      }
    });
    assert.equal(missing.length, 0, `Tokens missing $type: ${missing.join(', ')}`);
  });

  it('core.json has required top-level groups', () => {
    const data = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'core.json'), 'utf8'));
    const required = ['color', 'spacing', 'borderRadius', 'fontFamily', 'fontSize', 'fontWeight', 'opacity'];
    for (const group of required) {
      assert.ok(data[group], `Missing top-level group: ${group}`);
    }
  });

  it('semantic.json has $type annotations on leaf tokens', () => {
    const data = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'semantic.json'), 'utf8'));
    const missing = [];
    walkTokens(data, (path, token) => {
      if (token.$value !== undefined && token.$type === undefined) {
        missing.push(path);
      }
    });
    assert.equal(missing.length, 0, `Tokens missing $type: ${missing.join(', ')}`);
  });

  it('component.json has $type annotations on leaf tokens', () => {
    const data = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'component.json'), 'utf8'));
    const missing = [];
    walkTokens(data, (path, token) => {
      if (token.$value !== undefined && token.$type === undefined) {
        missing.push(path);
      }
    });
    assert.equal(missing.length, 0, `Tokens missing $type: ${missing.join(', ')}`);
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
