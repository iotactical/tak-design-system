import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

const workflow = readFileSync(resolve(ROOT, '.github/workflows/build-and-release.yml'), 'utf8');
const releaseJob = workflow.slice(workflow.indexOf('\n  release:'), workflow.indexOf('\n  wpf:'));

// rtmx:req REQ-XW-230
describe('REQ-XW-230: automated npm publish in CI release pipeline', () => {
  it('release job invokes the publish script', () => {
    assert.match(releaseJob, /scripts\/publish-npm\.sh/, 'release job must run scripts/publish-npm.sh');
  });

  it('publish script is executable and publishes every public package', () => {
    const scriptPath = resolve(ROOT, 'scripts/publish-npm.sh');
    assert.ok(existsSync(scriptPath), 'scripts/publish-npm.sh must exist');
    assert.ok(statSync(scriptPath).mode & 0o111, 'scripts/publish-npm.sh must be executable');

    const script = readFileSync(scriptPath, 'utf8');
    for (const dir of ['packages/tokens', 'packages/react']) {
      assert.ok(script.includes(dir), `publish script must publish ${dir}`);
    }
  });

  it('publish script fails on error instead of masking it', () => {
    const script = readFileSync(resolve(ROOT, 'scripts/publish-npm.sh'), 'utf8');
    assert.match(script, /set -euo pipefail/, 'publish script must use set -euo pipefail');
    assert.ok(!/npm publish[^\n]*\|\|/.test(script), 'npm publish must not be followed by || fallback');
  });

  it('release job does not swallow publish failures', () => {
    // `continue-on-error` plus `|| echo` previously turned a missing NPM_TOKEN
    // into a green build that published nothing.
    const publishStep = releaseJob.slice(releaseJob.indexOf('- name: Publish npm packages'));
    const stepBody = publishStep.slice(0, publishStep.indexOf('- name: Warn when npm publishing'));
    assert.ok(!stepBody.includes('continue-on-error'), 'npm publish step must not set continue-on-error');
  });

  it('release job requests provenance permissions', () => {
    assert.match(releaseJob, /id-token: write/, 'release job needs id-token: write for --provenance');
  });
});

// rtmx:req REQ-XW-233
describe('REQ-XW-233: VS Code extension marketplace publish workflow', () => {
  it('publish step targets the real extension directory', () => {
    const publishStep = releaseJob.slice(releaseJob.indexOf('- name: Publish VS Code extension'));
    const stepBody = publishStep.slice(0, publishStep.indexOf('- name: Warn when VS Code publishing'));

    assert.ok(stepBody.includes('cd vscode-extension'), 'publish step must cd into vscode-extension/');
    assert.ok(
      !stepBody.includes('platforms/vscode/package.json'),
      'publish step must not gate on platforms/vscode/package.json, which is never generated'
    );
    assert.match(stepBody, /vsce package/, 'publish step must build a .vsix');
    assert.match(stepBody, /vsce publish --packagePath/, 'publish step must publish the built .vsix');
    assert.match(stepBody, /gh release upload/, 'the .vsix must be attached to the GitHub release');
  });

  it('VS Code publish runs after the npm publish steps', () => {
    assert.ok(
      releaseJob.indexOf('- name: Publish npm packages') < releaseJob.indexOf('- name: Publish VS Code extension'),
      'npm packages must publish before the extension'
    );
  });

  it('extension theme is refreshed from generated tokens before publish', () => {
    const publishStep = releaseJob.slice(releaseJob.indexOf('- name: Publish VS Code extension'));
    assert.match(
      publishStep.slice(0, 600),
      /cp platforms\/vscode\/generated\/tak-dark-theme\.json vscode-extension\/themes\//,
      'publish step must copy the generated theme so the extension cannot drift from tokens'
    );
  });

  it('an already-published version is skipped rather than failing the release', () => {
    const publishStep = releaseJob.slice(releaseJob.indexOf('- name: Publish VS Code extension'));
    const stepBody = publishStep.slice(0, publishStep.indexOf('- name: Warn when VS Code publishing'));
    assert.match(stepBody, /vsce show/, 'publish step must look up the published version');
    assert.match(stepBody, /already on the marketplace/, 'publish step must explain why it skipped');
  });

  it('committed extension theme matches the generated theme', () => {
    const generatedPath = resolve(ROOT, 'platforms/vscode/generated/tak-dark-theme.json');
    if (!existsSync(generatedPath)) return; // requires `npm run build:vscode`

    const generated = JSON.parse(readFileSync(generatedPath, 'utf8'));
    const committed = JSON.parse(readFileSync(resolve(ROOT, 'vscode-extension/themes/tak-dark-theme.json'), 'utf8'));
    assert.deepEqual(committed, generated, 'vscode-extension theme is stale; re-run npm run build:vscode');
  });
});
