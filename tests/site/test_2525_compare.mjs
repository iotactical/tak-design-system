// rtmx:req REQ-XW-104
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const EXPLORER_SRC = resolve(ROOT, 'site', 'src', 'pages', 'Explorer.tsx');

const source = readFileSync(EXPLORER_SRC, 'utf8');

describe('REQ-XW-104: Compare mode', () => {
  it('ComparePanel component exists', () => {
    assert.ok(
      source.includes('function ComparePanel'),
      'Explorer.tsx must define ComparePanel component'
    );
    assert.ok(
      source.includes('<ComparePanel'),
      'Explorer.tsx must render ComparePanel'
    );
  });

  it('confidence labels include "1:1 Match" and "D/E Adds Modifiers"', () => {
    assert.ok(
      source.includes('CONFIDENCE_LABELS'),
      'Explorer.tsx must define CONFIDENCE_LABELS'
    );
    assert.ok(
      source.includes("'1:1 Match'"),
      'CONFIDENCE_LABELS must include "1:1 Match"'
    );
    assert.ok(
      source.includes("'D/E Adds Modifiers'"),
      'CONFIDENCE_LABELS must include "D/E Adds Modifiers"'
    );
  });

  it('renders B/C/D/E version columns', () => {
    assert.ok(
      source.includes('compareVersion}>2525B'),
      'ComparePanel must render 2525B version column'
    );
    assert.ok(
      source.includes('compareVersion}>2525C'),
      'ComparePanel must render 2525C version column'
    );
    assert.ok(
      source.includes('compareVersion}>2525D'),
      'ComparePanel must render 2525D version column'
    );
    assert.ok(
      source.includes('compareVersion}>2525E'),
      'ComparePanel must render 2525E version column'
    );
  });

  it('uses compareGrid and compareCard CSS classes', () => {
    assert.ok(
      source.includes('compareGrid'),
      'ComparePanel must use compareGrid layout'
    );
    assert.ok(
      source.includes('compareCard'),
      'ComparePanel must use compareCard for each version'
    );
  });

  it('crosswalk data loads -- verified-crosswalk.json has mappings', () => {
    const crosswalkPath = resolve(ROOT, 'data', 'mil-std-2525', 'verified-crosswalk.json');
    assert.ok(
      existsSync(crosswalkPath),
      'verified-crosswalk.json must exist'
    );
    const crosswalk = JSON.parse(readFileSync(crosswalkPath, 'utf8'));
    assert.ok(
      crosswalk.summary && crosswalk.summary.total > 0,
      'verified-crosswalk.json must have mappings with non-zero total'
    );
    assert.ok(
      crosswalk.description,
      'verified-crosswalk.json must have a description field'
    );
  });

  it('confidence badge data-testid exists for accessibility', () => {
    assert.ok(
      source.includes('data-testid="confidence-badge"'),
      'ComparePanel must include confidence-badge test ID'
    );
    assert.ok(
      source.includes('data-testid="confidence-summary"'),
      'ComparePanel must include confidence-summary test ID'
    );
  });

  it('compare tab is declared in TABS array', () => {
    assert.ok(
      source.includes("id: 'compare'"),
      'TABS must include compare tab'
    );
    assert.ok(
      source.includes("label: 'Compare'"),
      'Compare tab must have Compare label'
    );
  });
});
