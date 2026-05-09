// rtmx:req REQ-ICN-010
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CHROME_PATH = resolve(__dirname, '..', '..', 'data', 'atak-chrome-drawables.json');

describe('REQ-ICN-010: ATAK chrome drawable manifest', () => {
  it('data/atak-chrome-drawables.json exists', () => {
    assert.ok(existsSync(CHROME_PATH), 'Chrome drawables manifest must exist');
  });

  it('is valid JSON', () => {
    const raw = readFileSync(CHROME_PATH, 'utf8');
    assert.doesNotThrow(() => JSON.parse(raw), 'Manifest must be valid JSON');
  });

  let chrome;
  try {
    chrome = JSON.parse(readFileSync(CHROME_PATH, 'utf8'));
  } catch {
    chrome = [];
  }

  it('contains at least 30 entries', () => {
    assert.ok(chrome.length >= 30, `Expected >= 30 entries, got ${chrome.length}`);
  });

  it('each entry has chromeType field', () => {
    const missing = chrome.filter(e => !e.chromeType);
    assert.equal(missing.length, 0, `${missing.length} entries missing chromeType`);
  });

  it('chromeType is one of toolbar, tab, or toggle', () => {
    const validTypes = ['toolbar', 'tab', 'toggle'];
    const bad = chrome.filter(e => !validTypes.includes(e.chromeType));
    assert.equal(bad.length, 0, `${bad.length} entries with invalid chromeType`);
  });

  it('each entry has name, hasSvg, and format fields', () => {
    const missing = [];
    for (const entry of chrome) {
      if (!entry.name) missing.push('(unnamed) missing name');
      if (entry.hasSvg === undefined) missing.push(`${entry.name} missing hasSvg`);
      if (!entry.format) missing.push(`${entry.name} missing format`);
    }
    assert.equal(missing.length, 0, `Entries with missing fields: ${missing.slice(0, 10).join('; ')}`);
  });

  it('includes all three chrome types', () => {
    const types = new Set(chrome.map(e => e.chromeType));
    assert.ok(types.has('toolbar'), 'Missing toolbar entries');
    assert.ok(types.has('tab'), 'Missing tab entries');
    assert.ok(types.has('toggle'), 'Missing toggle entries');
  });
});
