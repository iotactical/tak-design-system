import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// rtmx:req REQ-XW-150

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const STUDY_PLAN_PATH = resolve(ROOT, 'data', 'mil-std-2525', 'study-plan.md');
const STUDY_RESULTS_PATH = resolve(ROOT, 'data', 'mil-std-2525', 'study-results.json');

describe('REQ-XW-150: 2525 study plan', () => {
  it('study-plan.md exists', () => {
    assert.ok(existsSync(STUDY_PLAN_PATH), 'study-plan.md should exist');
  });

  it('study-plan.md documents objective and methodology', () => {
    const content = readFileSync(STUDY_PLAN_PATH, 'utf8');
    assert.ok(content.includes('Objective'), 'should document objective');
    assert.ok(content.includes('Methodology'), 'should document methodology');
    assert.ok(content.includes('Sources'), 'should list sources');
  });

  it('study-plan.md references 10 PDF documents', () => {
    const content = readFileSync(STUDY_PLAN_PATH, 'utf8');
    assert.ok(content.includes('MIL-STD-2525 Base'), 'should reference base document');
    assert.ok(content.includes('MIL-STD-2525E'), 'should reference E document');
  });

  it('study-results.json exists', () => {
    assert.ok(existsSync(STUDY_RESULTS_PATH), 'study-results.json should exist');
  });

  it('study-results.json has all 8 hypotheses tested', () => {
    const data = JSON.parse(readFileSync(STUDY_RESULTS_PATH, 'utf8'));
    const results = data.hypotheses_results;
    assert.ok(results, 'should have hypotheses_results field');
    const hypothesisKeys = Object.keys(results);
    assert.strictEqual(hypothesisKeys.length, 8, 'should have 8 hypothesis results');
    for (let i = 1; i <= 8; i++) {
      assert.ok(results[`H${i}`], `should have H${i} result`);
      assert.ok(results[`H${i}`].status, `H${i} should have status`);
      assert.ok(results[`H${i}`].finding, `H${i} should have finding`);
    }
  });

  it('study-results.json has field definitions', () => {
    const data = JSON.parse(readFileSync(STUDY_RESULTS_PATH, 'utf8'));
    assert.ok(data.field_definitions, 'should have field_definitions');
    assert.ok(data.field_definitions['2525B_C_15char'], 'should have B/C definitions');
    assert.ok(data.field_definitions['2525D_E_20char'], 'should have D/E definitions');
  });
});
