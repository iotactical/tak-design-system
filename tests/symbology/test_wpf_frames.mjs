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

// rtmx:req REQ-XW-022
describe('REQ-XW-022: Port frame rendering to WPF DrawingVisual', () => {
  it('FrameRenderer.cs exists with RenderFrame method', () => {
    const p = resolve(WPF_SRC, 'Rendering', 'FrameRenderer.cs');
    assert.ok(existsSync(p));
    const src = readFileSync(p, 'utf8');
    assert.ok(src.includes('RenderFrame'), 'Should have RenderFrame method');
    assert.ok(src.includes('DrawingVisual'), 'Should return DrawingVisual');
  });

  it('implements all four affiliation frame shapes', () => {
    const src = readFileSync(resolve(WPF_SRC, 'Rendering', 'FrameRenderer.cs'), 'utf8');
    assert.ok(src.includes('Friend'), 'Should handle friendly');
    assert.ok(src.includes('Hostile'), 'Should handle hostile');
    assert.ok(src.includes('Neutral'), 'Should handle neutral');
    assert.ok(src.includes('Unknown'), 'Should handle unknown');
  });

  it('uses correct frame geometries', () => {
    const src = readFileSync(resolve(WPF_SRC, 'Rendering', 'FrameRenderer.cs'), 'utf8');
    assert.ok(src.includes('RoundedRectangle') || src.includes('rounded rectangle'), 'Friendly should use rounded rectangle');
    assert.ok(src.includes('diamond') || src.includes('Diamond') || src.includes('LineTo'), 'Hostile should use diamond');
    assert.ok(src.includes('DrawRectangle'), 'Neutral should use rectangle');
  });

  it('supports planned/anticipated dashed stroke', () => {
    const src = readFileSync(resolve(WPF_SRC, 'Rendering', 'FrameRenderer.cs'), 'utf8');
    assert.ok(src.includes('DashStyle') || src.includes('Dash'), 'Should support dashed stroke for planned status');
    assert.ok(src.includes('planned'), 'Should accept planned parameter');
  });

  it('FrameRendererTests.cs exists', () => {
    const p = resolve(ROOT, 'platforms', 'wintak', 'mil-sym-wpf', 'tests', 'MilSymWpf.Tests', 'FrameRendererTests.cs');
    assert.ok(existsSync(p));
  });

  it('dotnet build succeeds', { skip: !hasDotnet() ? 'dotnet SDK not available' : false }, () => {
    const result = execSync(`dotnet build ${resolve(ROOT, 'platforms', 'wintak', 'mil-sym-wpf', 'mil-sym-wpf.sln')}`, {
      encoding: 'utf8',
      timeout: 60000,
    });
    assert.ok(result.includes('Build succeeded'));
  });
});
