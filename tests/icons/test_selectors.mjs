// rtmx:req REQ-ICN-007
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, '..', '..', 'data', 'atak-selectors.json');

describe('REQ-ICN-007: ATAK selector drawable metadata', () => {
  it('data/atak-selectors.json exists', () => {
    assert.ok(existsSync(DATA_PATH), 'Selectors file must exist');
  });

  it('is valid JSON', () => {
    const raw = readFileSync(DATA_PATH, 'utf8');
    assert.doesNotThrow(() => JSON.parse(raw), 'Selectors must be valid JSON');
  });

  let selectors;
  try {
    selectors = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
  } catch {
    selectors = [];
  }

  it('contains at least 100 entries', () => {
    assert.ok(selectors.length >= 100, `Expected >= 100 entries, got ${selectors.length}`);
  });

  it('each entry has name and states array', () => {
    const bad = selectors.filter(e => !e.name || !Array.isArray(e.states));
    assert.equal(bad.length, 0, `${bad.length} entries missing name or states array`);
  });

  it('most state entries have a drawable reference', () => {
    let totalStates = 0;
    let withDrawable = 0;
    for (const sel of selectors) {
      for (const state of sel.states) {
        totalStates++;
        if (state.drawable) withDrawable++;
      }
    }
    const ratio = withDrawable / totalStates;
    assert.ok(ratio > 0.5, `Only ${withDrawable}/${totalStates} states have drawable refs`);
  });

  it('entries are sorted alphabetically by name', () => {
    for (let i = 1; i < selectors.length; i++) {
      assert.ok(
        selectors[i].name.localeCompare(selectors[i - 1].name) >= 0,
        `Entries not sorted: ${selectors[i - 1].name} > ${selectors[i].name}`
      );
    }
  });
});
