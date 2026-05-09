import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

function gh(args) {
  return execSync(`gh ${args}`, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' }).trim();
}

// rtmx:req REQ-CI-003
describe('REQ-CI-003: GitHub Release created with version tag', () => {
  const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
  const version = pkg.version;

  it('release exists for current version', () => {
    const releases = JSON.parse(gh('release list --limit 10 --json tagName,name'));
    const match = releases.find(r => r.tagName === `v${version}`);
    assert.ok(match, `No release found for v${version}`);
  });

  it('release tag matches package.json version', () => {
    const release = JSON.parse(gh(`release view v${version} --json tagName,name,assets`));
    assert.equal(release.tagName, `v${version}`);
  });

  it('release has assets attached', () => {
    const release = JSON.parse(gh(`release view v${version} --json assets`));
    assert.ok(release.assets.length > 0, 'Release has no assets');
  });

  it('workflow creates release with generate-notes', () => {
    const wf = readFileSync(resolve(ROOT, '.github/workflows/build-and-release.yml'), 'utf8');
    assert.ok(wf.includes('--generate-notes'));
  });
});
