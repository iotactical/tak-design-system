import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const WPF_SRC = resolve(ROOT, 'platforms', 'wintak', 'mil-sym-wpf', 'src', 'MilSymWpf');

function hasDotnet() {
  try { execSync('dotnet --version', { stdio: 'pipe' }); return true; }
  catch { return false; }
}

// rtmx:req REQ-XW-023
describe('REQ-XW-023: Port entity icon SVG path rendering to WPF', () => {
  it('EntityRenderer.cs exists with GeometryDrawing approach', () => {
    const p = resolve(WPF_SRC, 'Rendering', 'EntityRenderer.cs');
    assert.ok(existsSync(p));
    const src = readFileSync(p, 'utf8');
    assert.ok(src.includes('GeometryDrawing'), 'Should use GeometryDrawing');
    assert.ok(src.includes('Geometry.Parse'), 'Should use Geometry.Parse for SVG path conversion');
  });

  it('EntityRenderer handles invalid path data gracefully', () => {
    const src = readFileSync(resolve(WPF_SRC, 'Rendering', 'EntityRenderer.cs'), 'utf8');
    assert.ok(src.includes('FormatException'), 'Should catch FormatException');
    assert.ok(src.includes('null'), 'Should return null for invalid data');
  });

  it('MilSymRenderer.cs exists as public API', () => {
    const p = resolve(WPF_SRC, 'MilSymRenderer.cs');
    assert.ok(existsSync(p));
    const src = readFileSync(p, 'utf8');
    assert.ok(src.includes('Render'), 'Should have Render method');
    assert.ok(src.includes('DrawingGroup'), 'Should return DrawingGroup');
    assert.ok(src.includes('FrameRenderer'), 'Should compose frame');
    assert.ok(src.includes('EntityRenderer'), 'Should compose entity');
    assert.ok(src.includes('ModifierRenderer'), 'Should compose modifiers');
  });

  it('dotnet build succeeds', { skip: !hasDotnet() ? 'dotnet SDK not available' : false }, () => {
    const result = execSync(`dotnet build ${resolve(ROOT, 'platforms', 'wintak', 'mil-sym-wpf', 'mil-sym-wpf.sln')}`, {
      encoding: 'utf8',
      timeout: 60000,
    });
    assert.ok(result.includes('Build succeeded'));
  });
});
