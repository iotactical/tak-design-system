import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

// rtmx:req REQ-PKG-001
describe('REQ-PKG-001: Release tarball contains all required artifacts', () => {
  let tarballPath;
  let extractDir;

  before(() => {
    execSync('npm run build && npm run build:react && npm run package', {
      cwd: ROOT,
      stdio: 'pipe',
    });

    const distDir = resolve(ROOT, 'dist');
    assert.ok(existsSync(distDir), 'dist/ directory must exist after packaging');

    const tarballs = readdirSync(distDir).filter(f => f.endsWith('.tar.gz'));
    assert.ok(tarballs.length > 0, 'dist/ must contain at least one .tar.gz file');

    tarballPath = resolve(distDir, tarballs[0]);

    extractDir = mkdtempSync(join(tmpdir(), 'tak-tarball-test-'));
    execSync(`tar xzf "${tarballPath}" -C "${extractDir}"`, { stdio: 'pipe' });
  });

  after(() => {
    if (extractDir && existsSync(extractDir)) {
      rmSync(extractDir, { recursive: true, force: true });
    }
  });

  it('dist/ directory exists and contains a .tar.gz file', () => {
    assert.ok(existsSync(tarballPath), `tarball exists at ${tarballPath}`);
  });

  it('contains tokens/ source directory', () => {
    assert.ok(
      existsSync(join(extractDir, 'tokens')),
      'tokens/ directory must be present in tarball'
    );
  });

  it('contains platforms/atak/res/values/tak_colors.xml', () => {
    assert.ok(
      existsSync(join(extractDir, 'platforms', 'atak', 'res', 'values', 'tak_colors.xml')),
      'ATAK Android XML colors must be present'
    );
  });

  it('contains platforms/atak/compose/generated/TakColors.kt', () => {
    assert.ok(
      existsSync(join(extractDir, 'platforms', 'atak', 'compose', 'generated', 'TakColors.kt')),
      'ATAK Compose Kotlin colors must be present'
    );
  });

  it('contains platforms/web/generated/tak-tokens.css', () => {
    assert.ok(
      existsSync(join(extractDir, 'platforms', 'web', 'generated', 'tak-tokens.css')),
      'Web CSS tokens must be present'
    );
  });

  it('contains platforms/vscode/generated/tak-dark-theme.json', () => {
    assert.ok(
      existsSync(join(extractDir, 'platforms', 'vscode', 'generated', 'tak-dark-theme.json')),
      'VS Code dark theme must be present'
    );
  });

  it('contains data/ directory', () => {
    assert.ok(
      existsSync(join(extractDir, 'data')),
      'data/ directory must be present in tarball'
    );
  });

  it('contains icons/ directory', () => {
    assert.ok(
      existsSync(join(extractDir, 'icons')),
      'icons/ directory must be present in tarball'
    );
  });

  it('contains LICENSE', () => {
    assert.ok(
      existsSync(join(extractDir, 'LICENSE')),
      'LICENSE file must be present in tarball'
    );
  });

  it('contains README.md', () => {
    assert.ok(
      existsSync(join(extractDir, 'README.md')),
      'README.md file must be present in tarball'
    );
  });
});
