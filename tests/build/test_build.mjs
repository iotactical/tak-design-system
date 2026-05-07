import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

// rtmx:req REQ-BLD-001
describe('REQ-BLD-001: Style Dictionary build pipeline', () => {
  it('npm run build exits with code 0', () => {
    assert.doesNotThrow(() => {
      execSync('npm run build', { cwd: ROOT, stdio: 'pipe' });
    });
  });

  it('build:android exits with code 0', () => {
    assert.doesNotThrow(() => {
      execSync('npm run build:android', { cwd: ROOT, stdio: 'pipe' });
    });
  });

  it('build:compose exits with code 0', () => {
    assert.doesNotThrow(() => {
      execSync('npm run build:compose', { cwd: ROOT, stdio: 'pipe' });
    });
  });

  it('build:css exits with code 0', () => {
    assert.doesNotThrow(() => {
      execSync('npm run build:css', { cwd: ROOT, stdio: 'pipe' });
    });
  });

  it('build:vscode exits with code 0', () => {
    assert.doesNotThrow(() => {
      execSync('npm run build:vscode', { cwd: ROOT, stdio: 'pipe' });
    });
  });
});
