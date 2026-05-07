import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_DIR = resolve(__dirname, '..', '..', 'tokens', 'w3c');

const core = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'core.json'), 'utf8'));
const semantic = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'semantic.json'), 'utf8'));

// rtmx:req REQ-TOK-005
describe('REQ-TOK-005: MIL-STD-2525 affiliation color compliance', () => {
  // Resolve a token reference like {color.blue.500} to its $value in core
  function resolveRef(ref) {
    const path = ref.replace(/[{}]/g, '').split('.');
    let node = core;
    for (const segment of path) {
      node = node?.[segment];
    }
    return node?.$value;
  }

  const expected = {
    friendly: '#2196F3',
    hostile: '#F44336',
    neutral: '#4CAF50',
    unknown: '#FFEB3B',
    suspect: '#FF9800',
    pending: '#FBC02D'
  };

  for (const [name, hex] of Object.entries(expected)) {
    it(`${name} affiliation resolves to ${hex}`, () => {
      const token = semantic.affiliation?.[name];
      assert.ok(token, `Missing affiliation.${name}`);
      const value = String(token.$value);
      if (value.startsWith('{')) {
        const resolved = resolveRef(value);
        assert.equal(resolved?.toUpperCase(), hex.toUpperCase());
      } else {
        assert.equal(value.toUpperCase(), hex.toUpperCase());
      }
    });
  }
});
