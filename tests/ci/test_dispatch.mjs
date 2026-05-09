import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

// rtmx:req REQ-CI-004
describe('REQ-CI-004: Repository dispatch to defense-builders-sdk', () => {
  const wf = readFileSync(resolve(ROOT, '.github/workflows/build-and-release.yml'), 'utf8');

  it('workflow contains dispatch step', () => {
    assert.ok(wf.includes('defense-builders-sdk'), 'Missing defense-builders-sdk reference');
  });

  it('dispatch uses design-system-update event type', () => {
    assert.ok(wf.includes('design-system-update'), 'Missing event type');
  });

  it('dispatch includes version in payload', () => {
    assert.ok(wf.includes('version'), 'Missing version in dispatch payload');
  });

  it('dispatch step has continue-on-error', () => {
    assert.ok(wf.includes('continue-on-error: true'), 'Dispatch should not block release');
  });

  it('dispatch targets iotactical/defense-builders-sdk', () => {
    assert.ok(
      wf.includes('iotactical/defense-builders-sdk'),
      'Missing target repository'
    );
  });
});
