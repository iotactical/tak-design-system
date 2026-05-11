import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT, gh, ghApi, isGhAuthenticated } from './gh-helper.mjs';

// rtmx:req REQ-CI-002
describe('REQ-CI-002: Build artifacts uploaded with 30-day retention', () => {
  let runId;
  let artifacts;

  it('latest successful run has artifacts', { skip: !isGhAuthenticated() && 'gh not authenticated' }, () => {
    const runs = JSON.parse(gh('run list --status success --branch main --workflow="Build and Release TAK Design System" --limit 1 --json databaseId'));
    runId = runs[0].databaseId;
    const data = ghApi(`repos/iotactical/tak-design-system/actions/runs/${runId}/artifacts`);
    artifacts = data.artifacts;
    assert.ok(artifacts.length > 0, 'No artifacts found');
  });

  it('artifact is named tak-design-system', { skip: !isGhAuthenticated() && 'gh not authenticated' }, () => {
    if (!artifacts) return;
    const named = artifacts.find(a => a.name === 'tak-design-system');
    assert.ok(named, 'Missing tak-design-system artifact');
  });

  it('artifact has non-zero size', { skip: !isGhAuthenticated() && 'gh not authenticated' }, () => {
    if (!artifacts) return;
    const named = artifacts.find(a => a.name === 'tak-design-system');
    assert.ok(named.size_in_bytes > 0, 'Artifact is empty');
  });

  it('artifact has future expiry (retention active)', { skip: !isGhAuthenticated() && 'gh not authenticated' }, () => {
    if (!artifacts) return;
    const named = artifacts.find(a => a.name === 'tak-design-system');
    const expires = new Date(named.expires_at);
    const now = new Date();
    assert.ok(expires > now, `Artifact expired: ${named.expires_at}`);
  });

  it('workflow specifies 30-day retention', () => {
    const wf = readFileSync(resolve(ROOT, '.github/workflows/build-and-release.yml'), 'utf8');
    assert.ok(wf.includes('retention-days: 30'));
  });
});
