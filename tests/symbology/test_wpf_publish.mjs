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

// rtmx:req REQ-XW-026
describe('REQ-XW-026: Package mil-sym-wpf NuGet and publish to GitHub', () => {
  it('csproj has NuGet package metadata', () => {
    const src = readFileSync(resolve(WPF, 'src', 'MilSymWpf', 'MilSymWpf.csproj'), 'utf8');
    assert.ok(src.includes('<PackageId>'), 'Should have PackageId');
    assert.ok(src.includes('IoTactical.MilSymWpf'), 'PackageId should be IoTactical.MilSymWpf');
    assert.ok(src.includes('<PackageVersion>'), 'Should have PackageVersion');
    assert.ok(src.includes('Apache-2.0'), 'Should have Apache-2.0 license');
    assert.ok(src.includes('<Description>'), 'Should have description');
    assert.ok(src.includes('<Authors>'), 'Should have authors');
  });

  it('README.md has package instructions', () => {
    const src = readFileSync(resolve(WPF, 'README.md'), 'utf8');
    assert.ok(src.includes('dotnet pack'), 'README should mention dotnet pack');
  });

  it('CI workflow has WPF job with NuGet pack', () => {
    const src = readFileSync(resolve(ROOT, '.github', 'workflows', 'build-and-release.yml'), 'utf8');
    assert.ok(src.includes('dotnet pack'), 'CI should have dotnet pack step');
    assert.ok(src.includes('mil-sym-wpf'), 'CI should reference mil-sym-wpf');
  });

  it('dotnet pack succeeds', { skip: !hasDotnet() ? 'dotnet SDK not available' : false }, () => {
    execSync(
      `dotnet pack ${resolve(WPF, 'src', 'MilSymWpf', 'MilSymWpf.csproj')} -o ${resolve(WPF, 'artifacts')}`,
      { encoding: 'utf8', timeout: 60000 }
    );
    const nupkg = existsSync(resolve(WPF, 'artifacts', 'IoTactical.MilSymWpf.0.1.0.nupkg'));
    assert.ok(nupkg, 'dotnet pack should produce .nupkg file');
  });
});
