import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const CSS_DIR = resolve(ROOT, 'platforms', 'web', 'generated');

// rtmx:req REQ-BLD-004
describe('REQ-BLD-004: CSS custom properties generation', () => {
  // Build is handled by pretest script

  it('tak-tokens.css exists', () => {
    assert.ok(existsSync(resolve(CSS_DIR, 'tak-tokens.css')));
  });

  it('uses :root selector', () => {
    const css = readFileSync(resolve(CSS_DIR, 'tak-tokens.css'), 'utf8');
    assert.match(css, /:root\s*\{/);
  });

  it('variables use --tak- prefix', () => {
    const css = readFileSync(resolve(CSS_DIR, 'tak-tokens.css'), 'utf8');
    const vars = css.match(/--[\w-]+/g) || [];
    assert.ok(vars.length > 0, 'No CSS variables found');
    for (const v of vars) {
      assert.ok(v.startsWith('--tak-'), `Variable missing --tak- prefix: ${v}`);
    }
  });

  // rtmx:req REQ-BLD-006
  it('REQ-BLD-006: no double-prefix ----tak-', () => {
    const css = readFileSync(resolve(CSS_DIR, 'tak-tokens.css'), 'utf8');
    assert.ok(!css.includes('----tak-'), 'Found double-prefix ----tak-');
  });
});
