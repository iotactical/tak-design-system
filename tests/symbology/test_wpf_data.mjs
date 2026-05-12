import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const WPF_SRC = resolve(ROOT, 'platforms', 'wintak', 'mil-sym-wpf', 'src', 'MilSymWpf');

// rtmx:req REQ-XW-025
describe('REQ-XW-025: Integrate msd.json data loading in C#', () => {
  it('MsdLoader.cs exists with GetSymbol method', () => {
    const p = resolve(WPF_SRC, 'Data', 'MsdLoader.cs');
    assert.ok(existsSync(p));
    const src = readFileSync(p, 'utf8');
    assert.ok(src.includes('GetSymbol'), 'Should have GetSymbol method');
    assert.ok(src.includes('SymbolDefinition'), 'Should define SymbolDefinition');
  });

  it('msd.json is included as embedded resource', () => {
    assert.ok(existsSync(resolve(WPF_SRC, 'Data', 'msd.json')), 'msd.json should exist in Data/');
    const csproj = readFileSync(resolve(WPF_SRC, 'MilSymWpf.csproj'), 'utf8');
    assert.ok(csproj.includes('EmbeddedResource'), 'csproj should have EmbeddedResource');
    assert.ok(csproj.includes('msd.json'), 'csproj should reference msd.json');
  });

  it('MsdLoaderTests.cs exists', () => {
    const p = resolve(ROOT, 'platforms', 'wintak', 'mil-sym-wpf', 'tests', 'MilSymWpf.Tests', 'MsdLoaderTests.cs');
    assert.ok(existsSync(p));
    const src = readFileSync(p, 'utf8');
    assert.ok(src.includes('[Fact]'), 'Should have xUnit test methods');
    assert.ok(src.includes('MsdLoader'), 'Should test MsdLoader');
  });

  it('MsdLoader supports GetSymbolSet lookup', () => {
    const src = readFileSync(resolve(WPF_SRC, 'Data', 'MsdLoader.cs'), 'utf8');
    assert.ok(src.includes('GetSymbolSet'), 'Should have GetSymbolSet method');
  });

  it('SymbolDefinition has required fields', () => {
    const src = readFileSync(resolve(WPF_SRC, 'Data', 'MsdLoader.cs'), 'utf8');
    const required = ['SymbolSet', 'Entity', 'EntityType', 'EntitySubType', 'Code', 'Versions'];
    for (const field of required) {
      assert.ok(src.includes(field), `Missing field: ${field}`);
    }
  });
});
