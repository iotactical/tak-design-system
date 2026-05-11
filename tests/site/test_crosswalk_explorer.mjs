// rtmx:req REQ-XW-094
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../../', import.meta.url).pathname.replace(/\/$/, '');
const SITE_SRC = join(ROOT, 'site', 'src');

describe('REQ-XW-094: Crosswalk explorer confidence levels', () => {
  const explorerPath = join(SITE_SRC, 'pages', 'Explorer.tsx');

  it('Explorer.tsx exists', () => {
    assert.ok(existsSync(explorerPath), 'Explorer.tsx should exist');
  });

  it('Explorer Compare tab shows confidence levels (exact/modifier/unverified)', () => {
    const content = readFileSync(explorerPath, 'utf8');
    assert.ok(content.includes('getConfidence'), 'Should have getConfidence function');
    assert.ok(content.includes("'exact'"), 'Should have exact confidence level');
    assert.ok(content.includes("'modifier'"), 'Should have modifier confidence level');
    assert.ok(content.includes("'unverified'"), 'Should have unverified confidence level');
  });

  it('Compare tab color-codes confidence (green/yellow/red)', () => {
    const content = readFileSync(explorerPath, 'utf8');
    assert.ok(content.includes('#4caf50'), 'Should use green for exact');
    assert.ok(content.includes('#ffb300'), 'Should use yellow for modifier-based');
    assert.ok(content.includes('#ef5350'), 'Should use red for unverified');
  });

  it('Compare tab shows count summary', () => {
    const content = readFileSync(explorerPath, 'utf8');
    assert.ok(content.includes('confidenceCounts'), 'Should compute confidence counts');
    assert.ok(content.includes('exact') && content.includes('modifier-based') && content.includes('unverified'),
      'Should display summary with exact, modifier-based, unverified counts');
    assert.ok(content.includes('confidence-summary'), 'Should have confidence summary element');
  });

  it('Compare tab shows confidence badge per mapping', () => {
    const content = readFileSync(explorerPath, 'utf8');
    assert.ok(content.includes('confidence-badge'), 'Should render confidence badge per result');
    assert.ok(content.includes('CONFIDENCE_LABELS'), 'Should use confidence labels');
  });
});
