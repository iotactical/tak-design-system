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

// rtmx:req REQ-CI-001
describe('REQ-CI-001: CI pipeline validates builds and releases', () => {
  let runId;
  let jobs;

  it('has at least one successful run on main', () => {
    const runs = JSON.parse(gh('run list --status success --branch main --workflow="Build and Release TAK Design System" --limit 1 --json databaseId'));
    assert.ok(runs.length > 0, 'No successful runs found on main');
    runId = runs[0].databaseId;
  });

  it('pipeline has validate job that passed', () => {
    const data = ghApi(`repos/iotactical/tak-design-system/actions/runs/${runId}/jobs`);
    jobs = data.jobs;
    const validate = jobs.find(j => j.name === 'validate');
    assert.ok(validate, 'Missing validate job');
    assert.equal(validate.conclusion, 'success');
  });

  it('pipeline has test job that passed', () => {
    const test = jobs.find(j => j.name === 'test');
    assert.ok(test, 'Missing test job');
    assert.equal(test.conclusion, 'success');
  });

  it('pipeline has build job that passed', () => {
    const build = jobs.find(j => j.name === 'build');
    assert.ok(build, 'Missing build job');
    assert.equal(build.conclusion, 'success');
  });

  it('pipeline has release job that passed', () => {
    const release = jobs.find(j => j.name === 'release');
    assert.ok(release, 'Missing release job');
    assert.equal(release.conclusion, 'success');
  });

  it('workflow triggers on push to main', () => {
    const wf = readFileSync(resolve(ROOT, '.github/workflows/build-and-release.yml'), 'utf8');
    assert.match(wf, /push:\s*\n\s*branches:\s*\[main\]/);
  });

  it('workflow triggers on pull_request to main', () => {
    const wf = readFileSync(resolve(ROOT, '.github/workflows/build-and-release.yml'), 'utf8');
    assert.match(wf, /pull_request:\s*\n\s*branches:\s*\[main\]/);
  });

  it('workflow supports workflow_dispatch', () => {
    const wf = readFileSync(resolve(ROOT, '.github/workflows/build-and-release.yml'), 'utf8');
    assert.ok(wf.includes('workflow_dispatch'));
  });
});
