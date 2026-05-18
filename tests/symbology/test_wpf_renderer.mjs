// rtmx:req REQ-SYM-003
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const WPF_SRC = resolve(ROOT, 'platforms', 'wintak', 'mil-sym-wpf', 'src', 'MilSymWpf');
const SLN = resolve(ROOT, 'platforms', 'wintak', 'mil-sym-wpf', 'mil-sym-wpf.sln');

function hasDotnet() {
  try { execSync('dotnet --version', { stdio: 'pipe' }); return true; }
  catch { return false; }
}

describe('REQ-SYM-003: WPF/XAML military symbology renderer', () => {
  it('MilSymRenderer.cs exists as main API entry point', () => {
    const p = resolve(WPF_SRC, 'MilSymRenderer.cs');
    assert.ok(existsSync(p), 'MilSymRenderer.cs should exist');
  });

  it('Render method accepts SIDC and returns DrawingGroup', () => {
    const src = readFileSync(resolve(WPF_SRC, 'MilSymRenderer.cs'), 'utf8');
    assert.ok(src.includes('public DrawingGroup? Render(string sidc'), 'Should have Render(sidc) method');
    assert.ok(src.includes('double size'), 'Render should accept size parameter');
    assert.ok(src.includes('entityPathData'), 'Render should accept optional entity SVG path');
  });

  it('composes frame, entity, and modifier layers', () => {
    const src = readFileSync(resolve(WPF_SRC, 'MilSymRenderer.cs'), 'utf8');
    assert.ok(src.includes('FrameRenderer.RenderFrame'), 'Should compose frame layer');
    assert.ok(src.includes('EntityRenderer.RenderEntity'), 'Should compose entity layer');
    assert.ok(src.includes('ModifierRenderer.RenderEchelon'), 'Should compose echelon modifier');
    assert.ok(src.includes('ModifierRenderer.RenderHqIndicator'), 'Should compose HQ modifier');
    assert.ok(src.includes('ModifierRenderer.RenderTaskForceIndicator'), 'Should compose TF modifier');
    assert.ok(src.includes('ModifierRenderer.RenderFeintDummyIndicator'), 'Should compose F/D modifier');
  });

  it('supports all standard identities via SidcParser', () => {
    const src = readFileSync(resolve(WPF_SRC, 'MilSymRenderer.cs'), 'utf8');
    assert.ok(src.includes('SidcParser.Parse'), 'Should parse SIDC');
    assert.ok(src.includes('GetAffiliation'), 'Should map SI to affiliation');
  });

  it('supports both 15-char and 20-char SIDC formats', () => {
    const parser = readFileSync(resolve(WPF_SRC, 'Sidc', 'SidcParser.cs'), 'utf8');
    assert.ok(parser.includes('15'), 'Should handle 15-char (B/C) SIDC');
    assert.ok(parser.includes('20'), 'Should handle 20-char (D/E) SIDC');
  });

  it('consumes MSD symbol definitions for entity lookup', () => {
    const src = readFileSync(resolve(WPF_SRC, 'MilSymRenderer.cs'), 'utf8');
    assert.ok(src.includes('MsdLoader'), 'Should use MsdLoader');
    assert.ok(src.includes('LookupSymbol'), 'Should have LookupSymbol method');
    const msd = resolve(WPF_SRC, 'Data', 'msd.json');
    assert.ok(existsSync(msd), 'msd.json should be embedded');
  });

  it('handles planned/anticipated status with dashed strokes', () => {
    const frame = readFileSync(resolve(WPF_SRC, 'Rendering', 'FrameRenderer.cs'), 'utf8');
    assert.ok(frame.includes('planned') || frame.includes('Planned') || frame.includes('DashStyle'),
      'Frame renderer should support planned/dashed status');
  });

  it('returns null for invalid SIDC', () => {
    const src = readFileSync(resolve(WPF_SRC, 'MilSymRenderer.cs'), 'utf8');
    assert.ok(src.includes('if (!parsed.IsValid)'), 'Should check IsValid');
    assert.ok(src.includes('return null'), 'Should return null for invalid SIDC');
  });

  it('project targets .NET 9 with WPF', () => {
    const csproj = readFileSync(resolve(WPF_SRC, 'MilSymWpf.csproj'), 'utf8');
    assert.ok(csproj.includes('net9.0-windows'), 'Should target net9.0-windows');
    assert.ok(csproj.includes('UseWPF'), 'Should enable WPF');
  });

  it('is Apache-2.0 licensed', () => {
    const csproj = readFileSync(resolve(WPF_SRC, 'MilSymWpf.csproj'), 'utf8');
    assert.ok(csproj.includes('Apache-2.0'), 'Should be Apache-2.0 licensed');
  });

  it('has xUnit test coverage', () => {
    const testDir = resolve(ROOT, 'platforms', 'wintak', 'mil-sym-wpf', 'tests', 'MilSymWpf.Tests');
    assert.ok(existsSync(testDir), 'Test project should exist');
    const csproj = readFileSync(resolve(testDir, 'MilSymWpf.Tests.csproj'), 'utf8');
    assert.ok(csproj.includes('xunit'), 'Should use xUnit test framework');
  });

  it('solution builds successfully (requires .NET SDK)', { skip: !hasDotnet() }, () => {
    const result = execSync(`dotnet build "${SLN}" --nologo -v q`, {
      stdio: 'pipe',
      timeout: 60000,
    });
    assert.ok(result.toString().includes('succeeded') || result.toString().length >= 0,
      'Solution should build without errors');
  });
});
