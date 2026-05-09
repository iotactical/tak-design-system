// rtmx:req REQ-ICN-005
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(__dirname, '..', '..', 'data', 'atak-button-states.json');

describe('REQ-ICN-005: ATAK button state definitions', () => {
  it('data/atak-button-states.json exists', () => {
    assert.ok(existsSync(DATA_PATH), 'Button states file must exist');
  });

  it('is valid JSON', () => {
    const raw = readFileSync(DATA_PATH, 'utf8');
    assert.doesNotThrow(() => JSON.parse(raw), 'Button states must be valid JSON');
  });

  let btnStates;
  try {
    btnStates = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
  } catch {
    btnStates = [];
  }

  it('contains at least 30 entries', () => {
    assert.ok(btnStates.length >= 30, `Expected >= 30 entries, got ${btnStates.length}`);
  });

  it('each entry has a name with btn_ prefix', () => {
    const bad = btnStates.filter(e => !e.name || !e.name.startsWith('btn_'));
    assert.equal(bad.length, 0, `${bad.length} entries missing name or btn_ prefix`);
  });

  it('entries are sorted alphabetically by name', () => {
    for (let i = 1; i < btnStates.length; i++) {
      assert.ok(
        btnStates[i].name.localeCompare(btnStates[i - 1].name) >= 0,
        `Entries not sorted: ${btnStates[i - 1].name} > ${btnStates[i].name}`
      );
    }
  });
});
