import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DIST = resolve(ROOT, 'packages', 'react', 'dist');

// rtmx:req REQ-RCT-007
describe('REQ-RCT-007: React library build', () => {
  before(() => {
    execSync('npm run build:react', { cwd: ROOT, stdio: 'pipe' });
  });

  it('dist/tak-react.js (ESM) exists', () => {
    assert.ok(existsSync(resolve(DIST, 'tak-react.js')));
  });

  it('dist/tak-react.cjs (CJS) exists', () => {
    assert.ok(existsSync(resolve(DIST, 'tak-react.cjs')));
  });

  it('dist/index.d.ts (types) exists', () => {
    assert.ok(existsSync(resolve(DIST, 'index.d.ts')));
  });

  it('dist/style.css (styles) exists', () => {
    assert.ok(existsSync(resolve(DIST, 'style.css')));
  });

  it('ESM bundle is non-empty', () => {
    const stat = readFileSync(resolve(DIST, 'tak-react.js'), 'utf8');
    assert.ok(stat.length > 100, 'ESM bundle too small');
  });

  it('CJS bundle is non-empty', () => {
    const stat = readFileSync(resolve(DIST, 'tak-react.cjs'), 'utf8');
    assert.ok(stat.length > 100, 'CJS bundle too small');
  });
});
