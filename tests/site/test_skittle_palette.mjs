// rtmx:req REQ-XW-080
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const PALETTES_SRC = resolve(ROOT, 'site', 'src', 'pages', 'Palettes.tsx');

const source = readFileSync(PALETTES_SRC, 'utf8');

describe('REQ-XW-080: Skittles palette tab', () => {
  it('Palettes.tsx contains a Skittles tab', () => {
    assert.ok(
      source.includes("label: 'Skittles'"),
      'Palettes.tsx must have a Skittles tab label'
    );
    assert.ok(
      source.includes("type: 'skittles'"),
      'Palettes.tsx must have skittles palette type'
    );
  });

  it('team color definitions exist with expected colors', () => {
    assert.ok(
      source.includes('TEAM_COLORS'),
      'Palettes.tsx must define TEAM_COLORS'
    );
    const expectedColors = ['cyan', 'green', 'red', 'blue', 'yellow', 'orange', 'magenta', 'white'];
    for (const color of expectedColors) {
      assert.ok(
        source.includes(`name: '${color}'`),
        `TEAM_COLORS must include ${color}`
      );
    }
  });

  it('staleness states are rendered', () => {
    assert.ok(
      source.includes('Staleness States'),
      'SkittlesPanel must render Staleness States section'
    );
    assert.ok(
      source.includes('Connected'),
      'Staleness must include Connected state'
    );
    assert.ok(
      source.includes('Stale'),
      'Staleness must include Stale state'
    );
    assert.ok(
      source.includes('grayscale'),
      'Expired/stale state must use grayscale filter'
    );
  });

  it('GPS source variants exist', () => {
    assert.ok(
      source.includes('GPS Source Variants'),
      'SkittlesPanel must include GPS Source Variants section'
    );
    assert.ok(
      source.includes('GPS (h-e)'),
      'Must include GPS (h-e) variant'
    );
    assert.ok(
      source.includes('Human (h-*)'),
      'Must include Human (h-*) variant'
    );
    assert.ok(
      source.includes('Manual (m-g-l)'),
      'Must include Manual (m-g-l) variant'
    );
  });

  it('SkittlesPanel function exists', () => {
    assert.ok(
      source.includes('function SkittlesPanel'),
      'Palettes.tsx must define SkittlesPanel component'
    );
  });

  it('default active tab is skittles', () => {
    assert.ok(
      source.includes("|| 'skittles'"),
      'Default tab fallback must be skittles'
    );
  });
});
