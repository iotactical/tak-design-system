import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

// rtmx:req REQ-XW-259
describe('REQ-XW-259: Machine-readable release delta tracking', () => {
  it('build-release-delta.mjs runs without error', () => {
    const result = execSync('node scripts/build-release-delta.mjs', { cwd: ROOT, encoding: 'utf8' });
    assert.ok(result.includes('Release delta'), 'Script should report delta');
  });

  it('data/release-delta.json is generated', () => {
    assert.ok(existsSync(resolve(ROOT, 'data', 'release-delta.json')));
  });

  it('release-delta.json has required structure', () => {
    const delta = JSON.parse(readFileSync(resolve(ROOT, 'data', 'release-delta.json'), 'utf8'));
    assert.ok(delta.commit, 'Missing commit hash');
    assert.ok(delta.generated, 'Missing generated timestamp');
    assert.ok(delta.changed, 'Missing changed categories');
    assert.ok('tokens' in delta.changed, 'Missing tokens category');
    assert.ok('icons' in delta.changed, 'Missing icons category');
    assert.ok('data' in delta.changed, 'Missing data category');
    assert.ok('components' in delta.changed, 'Missing components category');
  });

  it('summary counts match changed file counts', () => {
    const delta = JSON.parse(readFileSync(resolve(ROOT, 'data', 'release-delta.json'), 'utf8'));
    for (const [key, count] of Object.entries(delta.summary || {})) {
      assert.equal(count, delta.changed[key]?.length, `Summary count mismatch for ${key}`);
    }
  });
});
