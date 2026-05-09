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

function ghApi(path) {
  return JSON.parse(execSync(`gh api ${path}`, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' }));
}

// rtmx:req REQ-CI-002
describe('REQ-CI-002: Build artifacts uploaded with 30-day retention', () => {
  let runId;
  let artifacts;

  it('latest successful run has artifacts', () => {
    const runs = JSON.parse(gh('run list --status success --branch main --limit 1 --json databaseId'));
    runId = runs[0].databaseId;
    const data = ghApi(`repos/iotactical/tak-design-system/actions/runs/${runId}/artifacts`);
    artifacts = data.artifacts;
    assert.ok(artifacts.length > 0, 'No artifacts found');
  });

  it('artifact is named tak-design-system', () => {
    const named = artifacts.find(a => a.name === 'tak-design-system');
    assert.ok(named, 'Missing tak-design-system artifact');
  });

  it('artifact has non-zero size', () => {
    const named = artifacts.find(a => a.name === 'tak-design-system');
    assert.ok(named.size_in_bytes > 0, 'Artifact is empty');
  });

  it('artifact has future expiry (retention active)', () => {
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
