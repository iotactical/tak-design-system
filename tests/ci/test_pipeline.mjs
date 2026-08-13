import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT, gh, ghApi, isGhAuthenticated } from './gh-helper.mjs';

const skipUnauthenticated = { skip: !isGhAuthenticated() && 'gh not authenticated' };

// rtmx:req REQ-CI-001
describe('REQ-CI-001: CI pipeline validates builds and releases', () => {
  let runId;
  let jobs;

  it('has at least one successful run on main', skipUnauthenticated, () => {
    const runs = JSON.parse(gh('run list --status success --branch main --workflow="Build and Release TAK Design System" --limit 1 --json databaseId'));
    assert.ok(runs.length > 0, 'No successful runs found on main');
    runId = runs[0].databaseId;
  });

  it('pipeline has validate job that passed', skipUnauthenticated, () => {
    if (!runId) return;
    const data = ghApi(`repos/iotactical/tak-design-system/actions/runs/${runId}/jobs`);
    jobs = data.jobs;
    const validate = jobs.find(j => j.name === 'validate');
    assert.ok(validate, 'Missing validate job');
    assert.equal(validate.conclusion, 'success');
  });

  it('pipeline has test job that passed', skipUnauthenticated, () => {
    if (!jobs) return;
    const test = jobs.find(j => j.name === 'test');
    assert.ok(test, 'Missing test job');
    assert.equal(test.conclusion, 'success');
  });

  it('pipeline has build job that passed', skipUnauthenticated, () => {
    if (!jobs) return;
    const build = jobs.find(j => j.name === 'build');
    assert.ok(build, 'Missing build job');
    assert.equal(build.conclusion, 'success');
  });

  it('pipeline has release job that passed', skipUnauthenticated, () => {
    if (!jobs) return;
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

  // Steps run under `bash -e` without pipefail, so a pipe hands the step the
  // exit code of the last command and a failing suite reports green.
  it('a failing test suite fails the pipeline', () => {
    const wf = readFileSync(resolve(ROOT, '.github/workflows/build-and-release.yml'), 'utf8');
    assert.doesNotMatch(wf, /npm test[^\n]*\|[^\n]*tee/, 'npm test must not be piped; the pipe hides its exit code');
    assert.doesNotMatch(wf, /npm test[^\n]*\|\|/, 'npm test must not be made non-fatal');
  });
});
