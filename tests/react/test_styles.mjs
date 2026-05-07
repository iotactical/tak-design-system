import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DIST = resolve(ROOT, 'packages', 'react', 'dist');

describe('React library CSS output', () => {
  let css;

  before(() => {
    if (!existsSync(resolve(DIST, 'style.css'))) {
      execSync('npm run build:react', { cwd: ROOT, stdio: 'pipe' });
    }
    css = readFileSync(resolve(DIST, 'style.css'), 'utf8');
  });

  it('contains button component styles', () => {
    assert.ok(css.includes('button') || css.includes('Button'), 'No button styles found');
  });

  it('contains toolbar component styles', () => {
    assert.ok(css.includes('toolbar') || css.includes('ToolBar') || css.includes('Toolbar'), 'No toolbar styles found');
  });

  it('contains modal component styles', () => {
    assert.ok(css.includes('modal') || css.includes('Modal'), 'No modal styles found');
  });

  it('references TAK design token variables', () => {
    assert.ok(css.includes('--tak-'), 'No TAK token variable references found');
  });
});
