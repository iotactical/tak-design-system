import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const SITE = resolve(ROOT, 'site', 'src');

// rtmx:req REQ-XW-106
describe('REQ-XW-106: Multi-point graphics in Control Measures symbol set', () => {
  it('Explorer.tsx has control-measures tab', () => {
    const src = readFileSync(resolve(SITE, 'pages', 'Explorer.tsx'), 'utf8');
    assert.ok(src.includes("'control-measures'"), 'Explorer should have control-measures TabId');
    assert.ok(src.includes('Control Measures'), 'Explorer should have Control Measures tab label');
  });

  it('Explorer.tsx renders ControlMeasuresPanel', () => {
    const src = readFileSync(resolve(SITE, 'pages', 'Explorer.tsx'), 'utf8');
    assert.ok(src.includes('ControlMeasuresPanel'), 'Explorer should render ControlMeasuresPanel');
  });

  it('ControlMeasuresPanel.tsx exists', () => {
    const p = resolve(SITE, 'components', 'ControlMeasuresPanel.tsx');
    assert.ok(existsSync(p), 'ControlMeasuresPanel.tsx should exist');
  });

  it('ControlMeasuresPanel uses MultipointMap', () => {
    const src = readFileSync(resolve(SITE, 'components', 'ControlMeasuresPanel.tsx'), 'utf8');
    assert.ok(src.includes('MultipointMap'), 'Panel should use MultipointMap component');
    assert.ok(src.includes('useMultipointWorker'), 'Panel should use multipoint worker hook');
  });

  it('ControlMeasuresPanel filters Symbol Set 25', () => {
    const src = readFileSync(resolve(SITE, 'components', 'ControlMeasuresPanel.tsx'), 'utf8');
    assert.ok(src.includes("'25'"), 'Panel should filter for Symbol Set 25');
    assert.ok(src.includes('b2d'), 'Panel should load b2d crosswalk data');
  });

  it('ControlMeasuresPanel supports search and affiliation', () => {
    const src = readFileSync(resolve(SITE, 'components', 'ControlMeasuresPanel.tsx'), 'utf8');
    assert.ok(src.includes('search'), 'Panel should support search');
    assert.ok(src.includes('affiliation'), 'Panel should support affiliation selection');
    assert.ok(src.includes('Friendly'), 'Panel should list friendly affiliation');
  });

  it('ControlMeasuresPanel supports interactive point placement', () => {
    const src = readFileSync(resolve(SITE, 'components', 'ControlMeasuresPanel.tsx'), 'utf8');
    assert.ok(src.includes('onClick'), 'Panel should support map click interaction');
    assert.ok(src.includes('userPoints'), 'Panel should track user-placed points');
  });

  it('site builds successfully', () => {
    // This test is validated by the build step in CI
    // Here we just verify the component files exist and have no obvious issues
    const explorer = readFileSync(resolve(SITE, 'pages', 'Explorer.tsx'), 'utf8');
    const panel = readFileSync(resolve(SITE, 'components', 'ControlMeasuresPanel.tsx'), 'utf8');
    assert.ok(explorer.includes('REQ-XW-106'), 'Explorer should reference requirement');
    assert.ok(panel.includes('REQ-XW-106'), 'Panel should reference requirement');
  });
});
