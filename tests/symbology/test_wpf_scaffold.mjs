import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const WPF = resolve(ROOT, 'platforms', 'wintak', 'mil-sym-wpf');

function hasDotnet() {
  try { execSync('dotnet --version', { stdio: 'pipe' }); return true; }
  catch { return false; }
}

// rtmx:req REQ-XW-020
describe('REQ-XW-020: .NET solution scaffold with WPF class library', () => {
  it('mil-sym-wpf.sln exists', () => {
    assert.ok(existsSync(resolve(WPF, 'mil-sym-wpf.sln')));
  });

  it('MilSymWpf.csproj exists with WPF configuration', () => {
    const p = resolve(WPF, 'src', 'MilSymWpf', 'MilSymWpf.csproj');
    assert.ok(existsSync(p));
    const src = readFileSync(p, 'utf8');
    assert.ok(src.includes('<UseWPF>true</UseWPF>'), 'Should enable WPF');
    assert.ok(src.includes('windows'), 'Should target Windows');
  });

  it('MilSymWpf.Tests.csproj exists with xUnit', () => {
    const p = resolve(WPF, 'tests', 'MilSymWpf.Tests', 'MilSymWpf.Tests.csproj');
    assert.ok(existsSync(p));
    const src = readFileSync(p, 'utf8');
    assert.ok(src.includes('xunit'), 'Should reference xUnit');
    assert.ok(src.includes('MilSymWpf.csproj'), 'Should reference main project');
  });

  it('README.md exists with build instructions', () => {
    const p = resolve(WPF, 'README.md');
    assert.ok(existsSync(p));
    const src = readFileSync(p, 'utf8');
    assert.ok(src.includes('dotnet build'), 'README should have build instructions');
  });

  it('LICENSE exists', () => {
    assert.ok(existsSync(resolve(WPF, 'LICENSE')));
  });

  it('NuGet package metadata is configured', () => {
    const src = readFileSync(resolve(WPF, 'src', 'MilSymWpf', 'MilSymWpf.csproj'), 'utf8');
    assert.ok(src.includes('PackageId'), 'Should have PackageId');
    assert.ok(src.includes('Apache-2.0'), 'Should have Apache-2.0 license');
  });

  it('dotnet build succeeds', { skip: !hasDotnet() ? 'dotnet SDK not available' : false }, () => {
    const result = execSync(`dotnet build ${resolve(WPF, 'mil-sym-wpf.sln')}`, {
      encoding: 'utf8',
      timeout: 60000,
    });
    assert.ok(result.includes('Build succeeded'), 'dotnet build should succeed');
  });
});
