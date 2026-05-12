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

  it('Explorer has Build tab for SIDC assembly', () => {
    const src = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Explorer.tsx'), 'utf8');
    assert.ok(src.includes("'build'"), 'Should have build tab');
    assert.ok(src.includes('Build'), 'Should have Build label');
  });

  it('Explorer has field selectors for SIDC components', () => {
    const src = readFileSync(resolve(SITE_DIR, 'src', 'pages', 'Explorer.tsx'), 'utf8');
    assert.ok(src.includes('symbolSet') || src.includes('selectedSS'), 'Should have symbol set selector');
    assert.ok(src.includes('identity') || src.includes('standardIdentity'), 'Should have identity selector');
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
