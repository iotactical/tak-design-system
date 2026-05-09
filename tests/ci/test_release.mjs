import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT, gh, isGhAuthenticated } from './gh-helper.mjs';

const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
const version = pkg.version;

// rtmx:req REQ-CI-003
describe('REQ-CI-003: GitHub Release created with version tag', () => {
  it('release exists for current version', { skip: !isGhAuthenticated() && 'gh not authenticated' }, () => {
    const releases = JSON.parse(gh('release list --limit 10 --json tagName,name'));
    const match = releases.find(r => r.tagName === `v${version}`);
    assert.ok(match, `No release found for v${version}`);
  });

  it('release tag matches package.json version', { skip: !isGhAuthenticated() && 'gh not authenticated' }, () => {
    const release = JSON.parse(gh(`release view v${version} --json tagName,name,assets`));
    assert.equal(release.tagName, `v${version}`);
  });

  it('release has assets attached', { skip: !isGhAuthenticated() && 'gh not authenticated' }, () => {
    const release = JSON.parse(gh(`release view v${version} --json assets`));
    assert.ok(release.assets.length > 0, 'Release has no assets');
  });

  it('workflow creates release with generate-notes', () => {
    const wf = readFileSync(resolve(ROOT, '.github/workflows/build-and-release.yml'), 'utf8');
    assert.ok(wf.includes('--generate-notes'));
  });
});
