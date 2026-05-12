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

// rtmx:req REQ-XW-021
describe('REQ-XW-021: Port SIDC parser from TypeScript to C#', () => {
  it('SidcParser.cs exists with Parse method', () => {
    const p = resolve(WPF_SRC, 'Sidc', 'SidcParser.cs');
    assert.ok(existsSync(p));
    const src = readFileSync(p, 'utf8');
    assert.ok(src.includes('Parse'), 'Should have Parse method');
    assert.ok(src.includes('ParsedSidc'), 'Should return ParsedSidc');
  });

  it('ParsedSidc.cs exists with required fields', () => {
    const p = resolve(WPF_SRC, 'Sidc', 'ParsedSidc.cs');
    assert.ok(existsSync(p));
    const src = readFileSync(p, 'utf8');
    const fields = ['Version', 'StandardIdentity', 'SymbolSet', 'Status', 'HqTfFd', 'Echelon', 'Entity', 'Modifier1', 'Modifier2'];
    for (const f of fields) {
      assert.ok(src.includes(f), `Missing field: ${f}`);
    }
  });

  it('SidcParser handles both 20-char and 15-char formats', () => {
    const src = readFileSync(resolve(WPF_SRC, 'Sidc', 'SidcParser.cs'), 'utf8');
    assert.ok(src.includes('20'), 'Should handle 20-char format');
    assert.ok(src.includes('15'), 'Should handle 15-char format');
  });

  it('SidcParser includes symbol set lookup tables', () => {
    const src = readFileSync(resolve(WPF_SRC, 'Sidc', 'SidcParser.cs'), 'utf8');
    assert.ok(src.includes('SymbolSetNames'), 'Should have symbol set names');
    assert.ok(src.includes('Air'), 'Should include Air symbol set');
    assert.ok(src.includes('Land Unit'), 'Should include Land Unit symbol set');
    assert.ok(src.includes('Control Measures'), 'Should include Control Measures');
  });

  it('SidcParser includes echelon and HQ/TF/FD lookups', () => {
    const src = readFileSync(resolve(WPF_SRC, 'Sidc', 'SidcParser.cs'), 'utf8');
    assert.ok(src.includes('EchelonNames'), 'Should have echelon names');
    assert.ok(src.includes('HqTfFdNames'), 'Should have HQ/TF/FD names');
    assert.ok(src.includes('Brigade'), 'Should include echelon: Brigade');
    assert.ok(src.includes('Task Force'), 'Should include HQ/TF/FD: Task Force');
  });

  it('SidcParserTests.cs exists', () => {
    const p = resolve(ROOT, 'platforms', 'wintak', 'mil-sym-wpf', 'tests', 'MilSymWpf.Tests', 'SidcParserTests.cs');
    assert.ok(existsSync(p));
    const src = readFileSync(p, 'utf8');
    assert.ok(src.includes('[Fact]'), 'Should have test methods');
    assert.ok(src.includes('Parse'), 'Should test Parse method');
  });

  it('dotnet build succeeds', { skip: !hasDotnet() ? 'dotnet SDK not available' : false }, () => {
    const result = execSync(`dotnet build ${resolve(ROOT, 'platforms', 'wintak', 'mil-sym-wpf', 'mil-sym-wpf.sln')}`, {
      encoding: 'utf8',
      timeout: 60000,
    });
    assert.ok(result.includes('Build succeeded'));
  });
});
