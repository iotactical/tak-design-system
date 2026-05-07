import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_DIR = resolve(__dirname, '..', '..', 'tokens', 'w3c');

const core = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'core.json'), 'utf8'));
const semantic = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'semantic.json'), 'utf8'));

// rtmx:req REQ-TOK-002
describe('REQ-TOK-002: Semantic token references', () => {
  it('has affiliation group with all 6 affiliations', () => {
    const required = ['friendly', 'hostile', 'neutral', 'unknown', 'suspect', 'pending'];
    for (const aff of required) {
      assert.ok(semantic.affiliation?.[aff], `Missing affiliation: ${aff}`);
    }
  });

  it('has status group with all 4 statuses', () => {
    const required = ['success', 'warning', 'error', 'info'];
    for (const s of required) {
      assert.ok(semantic.status?.[s], `Missing status: ${s}`);
    }
  });

  it('has surface groups with dark/light variants', () => {
    const surfaces = ['background', 'primary', 'elevated', 'card'];
    for (const s of surfaces) {
      assert.ok(semantic.surface?.[s]?.dark, `Missing surface.${s}.dark`);
      assert.ok(semantic.surface?.[s]?.light, `Missing surface.${s}.light`);
    }
  });

  it('has text groups with dark/light variants', () => {
    const texts = ['primary', 'secondary', 'disabled'];
    for (const t of texts) {
      assert.ok(semantic.text?.[t]?.dark, `Missing text.${t}.dark`);
      assert.ok(semantic.text?.[t]?.light, `Missing text.${t}.light`);
    }
  });

  it('has map-specific tokens', () => {
    const required = ['route', 'danger-zone', 'safe-zone', 'selection', 'grid-line', 'range-ring'];
    for (const m of required) {
      assert.ok(semantic.map?.[m], `Missing map.${m}`);
    }
  });

  it('has 15-color team palette', () => {
    const required = [
      'white', 'yellow', 'orange', 'magenta', 'red', 'maroon', 'purple',
      'dark-blue', 'blue', 'cyan', 'teal', 'green', 'dark-green', 'brown', 'pink'
    ];
    for (const t of required) {
      assert.ok(semantic.team?.[t], `Missing team color: ${t}`);
    }
  });

  it('has brand tokens', () => {
    assert.ok(semantic.brand?.primary);
    assert.ok(semantic.brand?.secondary);
    assert.ok(semantic.brand?.text);
  });

  it('all token references resolve to core tokens', () => {
    const corePaths = new Set();
    walkTokens(core, (path) => corePaths.add(path));

    const unresolved = [];
    walkTokens(semantic, (path, token) => {
      const refs = String(token.$value).match(/\{([^}]+)\}/g);
      if (refs) {
        for (const ref of refs) {
          const refPath = ref.slice(1, -1);
          if (!corePaths.has(refPath)) {
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
