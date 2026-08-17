// rtmx:req REQ-XW-092
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const SITE_DIR = resolve(ROOT, 'site');

describe('REQ-XW-092: Interactive SIDC builder with live symbol rendering', () => {
  it('Explorer.tsx exists with SIDC builder functionality', () => {
    const explorerPage = resolve(SITE_DIR, 'src', 'pages', 'Explorer.tsx');
    assert.ok(existsSync(explorerPage), 'Explorer.tsx must exist');
  });

  it('Sandbox is the SIDC assembly destination', () => {
    const src = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Sandbox.tsx'), 'utf8');
    assert.ok(src.includes('function BuildPanel'), 'Should define BuildPanel');
    assert.ok(src.includes('Symbol Sandbox'), 'Should brand the Sandbox page');
  });

  it('Explorer has field selectors for SIDC components', () => {
    const explorer = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Explorer.tsx'), 'utf8');
    const sandbox = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Sandbox.tsx'), 'utf8');
    assert.ok(explorer.includes('symbolSet') || explorer.includes('selectedSS'), 'Should have symbol set selector');
    assert.ok(
      sandbox.includes('STANDARD_IDENTITY') || sandbox.includes('identity'),
      'Should have identity selector',
    );
  });

  it('Explorer uses mil-sym-ts for live rendering', () => {
    const src = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Explorer.tsx'), 'utf8');
    assert.ok(
      src.includes('MilSymRenderer') || src.includes('milsym') || src.includes('useMilSymWorker'),
      'Should use mil-sym-ts renderer for live preview'
    );
  });

  it('mil-sym worker exists for rendering', () => {
    assert.ok(existsSync(resolve(SITE_DIR, 'src', 'workers', 'milsym-worker.ts')), 'milsym-worker.ts must exist');
    assert.ok(existsSync(resolve(SITE_DIR, 'src', 'hooks', 'useMilSymWorker.ts')), 'useMilSymWorker.ts must exist');
  });

  it('MilSymRenderer component exists', () => {
    assert.ok(existsSync(resolve(SITE_DIR, 'src', 'components', 'MilSymRenderer.tsx')), 'MilSymRenderer.tsx must exist');
  });
});
