import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_DIR = resolve(__dirname, '..', '..', 'tokens', 'w3c');
const atak = JSON.parse(readFileSync(resolve(TOKEN_DIR, 'atak.json'), 'utf8'));

// rtmx:req REQ-STY-005
describe('REQ-STY-005: ATAK typography style family tokens', () => {
  const font = atak.atak.dimension.font;

  it('defines text size scale (small, medium, large)', () => {
    assert.equal(font.small.$value, '12px');
    assert.equal(font.medium.$value, '14px');
    assert.ok(font['listview-row-large']);
  });

  it('defines draper font scale (very-large through small)', () => {
    assert.equal(font['draper-very-large'].$value, '18px');
    assert.equal(font['draper-large'].$value, '15px');
    assert.equal(font['draper-title'].$value, '13px');
    assert.equal(font['draper-base'].$value, '10px');
    assert.equal(font['draper-small'].$value, '8px');
  });

  it('defines Nunito as primary font family', () => {
    const families = atak.atak.font;
    assert.ok(families.primary.$value.includes('Nunito'));
    assert.ok(families['primary-bold'].$value.includes('Nunito'));
  });

  it('defines textview color states (enabled/disabled)', () => {
    const tv = atak.atak.state.textview;
    assert.ok(tv.enabled);
    assert.ok(tv.disabled);
    assert.equal(tv.enabled.$value, '#FFFFFF');
    assert.equal(tv.disabled.$value, '#9E9E9E');
  });
});
