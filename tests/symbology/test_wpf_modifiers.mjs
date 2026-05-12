import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const WPF_SRC = resolve(ROOT, 'platforms', 'wintak', 'mil-sym-wpf', 'src', 'MilSymWpf');

// rtmx:req REQ-XW-024
describe('REQ-XW-024: Port modifier and amplifier rendering to WPF', () => {
  it('ModifierRenderer.cs exists with echelon rendering', () => {
    const p = resolve(WPF_SRC, 'Rendering', 'ModifierRenderer.cs');
    assert.ok(existsSync(p));
    const src = readFileSync(p, 'utf8');
    assert.ok(src.includes('RenderEchelon'), 'Should have RenderEchelon method');
  });

  it('supports HQ indicator', () => {
    const src = readFileSync(resolve(WPF_SRC, 'Rendering', 'ModifierRenderer.cs'), 'utf8');
    assert.ok(src.includes('RenderHqIndicator'), 'Should have RenderHqIndicator method');
  });

  it('supports Task Force indicator', () => {
    const src = readFileSync(resolve(WPF_SRC, 'Rendering', 'ModifierRenderer.cs'), 'utf8');
    assert.ok(src.includes('RenderTaskForceIndicator'), 'Should have RenderTaskForceIndicator method');
  });

  it('supports Feint/Dummy indicator', () => {
    const src = readFileSync(resolve(WPF_SRC, 'Rendering', 'ModifierRenderer.cs'), 'utf8');
    assert.ok(src.includes('RenderFeintDummyIndicator'), 'Should have RenderFeintDummyIndicator method');
  });

  it('renders echelon marks for multiple levels', () => {
    const src = readFileSync(resolve(WPF_SRC, 'Rendering', 'ModifierRenderer.cs'), 'utf8');
    const echelons = ['Team', 'Squad', 'Platoon', 'Battalion', 'Brigade', 'Division', 'Corps', 'Army'];
    for (const e of echelons) {
      assert.ok(src.includes(e), `Should handle ${e} echelon`);
    }
  });

  it('ModifierRendererTests.cs exists', () => {
    assert.ok(existsSync(resolve(ROOT, 'platforms', 'wintak', 'mil-sym-wpf', 'tests', 'MilSymWpf.Tests', 'ModifierRendererTests.cs')));
  });
});
