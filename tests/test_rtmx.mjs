import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// rtmx:req REQ-INIT-001
describe('REQ-INIT-001: RTMX integration complete', () => {
  it('rtmx.yaml configuration exists', () => {
    assert.ok(existsSync(resolve(ROOT, 'rtmx.yaml')));
  });

  it('RTM database exists and has requirements', () => {
    const dbPath = resolve(ROOT, '.rtmx', 'database.csv');
    assert.ok(existsSync(dbPath));
    const csv = readFileSync(dbPath, 'utf8');
    const lines = csv.trim().split('\n');
    assert.ok(lines.length > 1, 'Database should have header + data rows');
  });

  it('requirements directory exists with spec files', () => {
    assert.ok(existsSync(resolve(ROOT, '.rtmx', 'requirements')));
  });

  it('database points to .rtmx/ structure', () => {
    const config = readFileSync(resolve(ROOT, 'rtmx.yaml'), 'utf8');
    assert.ok(config.includes('.rtmx/database.csv'));
    assert.ok(config.includes('.rtmx/requirements'));
  });
});
