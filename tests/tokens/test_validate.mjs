import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

// rtmx:req REQ-TOK-004
describe('REQ-TOK-004: Token validation script', () => {
  it('npm run validate exits with code 0', () => {
    assert.doesNotThrow(() => {
      execSync('npm run validate', { cwd: ROOT, stdio: 'pipe' });
    });
  });

  it('reports zero errors', () => {
    const output = execSync('npm run validate', { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' });
    assert.match(output, /0 errors/, 'Expected 0 errors in validation output');
  });
});
