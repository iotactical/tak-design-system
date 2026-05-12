import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

// rtmx:req REQ-XW-253
describe('REQ-XW-253: CI validation of registry integrity', () => {
  it('validate-registry.mjs exits cleanly', () => {
    const result = execSync('node scripts/validate-registry.mjs', { cwd: ROOT, encoding: 'utf8' });
    assert.ok(result.includes('Validation PASSED'), 'Validation script should report PASSED');
  });

  it('validation detects required files', () => {
    const result = execSync('node scripts/validate-registry.mjs', { cwd: ROOT, encoding: 'utf8' });
    assert.ok(result.includes('Registry:'), 'Should report registry stats');
    assert.ok(result.includes('Radial actions:'), 'Should report radial action stats');
    assert.ok(result.includes('Icons index:'), 'Should report icons index stats');
  });
});
