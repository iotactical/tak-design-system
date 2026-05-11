// rtmx:req REQ-XW-103
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const EXPLORER_SRC = resolve(ROOT, 'site', 'src', 'pages', 'Explorer.tsx');

const source = readFileSync(EXPLORER_SRC, 'utf8');

describe('REQ-XW-103: Build mode', () => {
  it('BuildPanel exists with function definition', () => {
    assert.ok(
      source.includes('function BuildPanel'),
      'Explorer.tsx must define BuildPanel component'
    );
    assert.ok(
      source.includes('<BuildPanel'),
      'Explorer.tsx must render BuildPanel'
    );
  });

  it('Standard Identity (SI) selector exists', () => {
    assert.ok(
      source.includes('STANDARD_IDENTITY_NAMES'),
      'Explorer.tsx must define STANDARD_IDENTITY_NAMES for SI selector'
    );
    assert.ok(
      source.includes('setSi'),
      'BuildPanel must have SI state setter'
    );
    const siValues = ['Pending', 'Unknown', 'Friend', 'Neutral', 'Hostile'];
    for (const val of siValues) {
      assert.ok(
        source.includes(`'${val}'`),
        `STANDARD_IDENTITY_NAMES must include "${val}"`
      );
    }
  });

  it('Symbol Set selector exists', () => {
    assert.ok(
      source.includes('setSs'),
      'BuildPanel must have Symbol Set state setter'
    );
    assert.ok(
      source.includes('SYMBOL_SET_NAMES'),
      'BuildPanel must reference SYMBOL_SET_NAMES for symbol set dropdown'
    );
  });

  it('Status selector exists', () => {
    assert.ok(
      source.includes('STATUS_NAMES'),
      'Explorer.tsx must define STATUS_NAMES'
    );
    assert.ok(
      source.includes('setStatus'),
      'BuildPanel must have Status state setter'
    );
    assert.ok(
      source.includes("'Present'"),
      'STATUS_NAMES must include Present'
    );
    assert.ok(
      source.includes("'Planned/Anticipated'"),
      'STATUS_NAMES must include Planned/Anticipated'
    );
  });

  it('HQ/TF/FD selector exists', () => {
    assert.ok(
      source.includes('HQ_TF_FD_NAMES'),
      'Explorer.tsx must define HQ_TF_FD_NAMES'
    );
    assert.ok(
      source.includes('setHqtffd'),
      'BuildPanel must have HQ/TF/FD state setter'
    );
    assert.ok(
      source.includes("'Headquarters'"),
      'HQ_TF_FD_NAMES must include Headquarters'
    );
    assert.ok(
      source.includes("'Task Force'"),
      'HQ_TF_FD_NAMES must include Task Force'
    );
  });

  it('Echelon selector exists', () => {
    assert.ok(
      source.includes('ECHELON_NAMES'),
      'Explorer.tsx must define ECHELON_NAMES'
    );
    assert.ok(
      source.includes('setEchelon'),
      'BuildPanel must have Echelon state setter'
    );
    assert.ok(
      source.includes("'Battalion/Squadron'"),
      'ECHELON_NAMES must include Battalion/Squadron'
    );
    assert.ok(
      source.includes("'Brigade'"),
      'ECHELON_NAMES must include Brigade'
    );
  });

  it('four-version output produces B/C/D/E SIDCs', () => {
    assert.ok(
      source.includes('setBSidc'),
      'BuildPanel must manage B SIDC state'
    );
    assert.ok(
      source.includes('setCSidc'),
      'BuildPanel must manage C SIDC state'
    );
    assert.ok(
      source.includes('setDSidc'),
      'BuildPanel must manage D SIDC state'
    );
    assert.ok(
      source.includes('setESidc'),
      'BuildPanel must manage E SIDC state'
    );
  });

  it('syncFromDFields computes all four SIDC versions', () => {
    assert.ok(
      source.includes('syncFromDFields'),
      'BuildPanel must have syncFromDFields function'
    );
    // D SIDC starts with 10, E with 15
    assert.ok(
      source.includes('`10${'),
      'syncFromDFields must build D SIDC starting with 10'
    );
    assert.ok(
      source.includes('`15${'),
      'syncFromDFields must build E SIDC starting with 15'
    );
  });

  it('build tab is declared in TABS array', () => {
    assert.ok(
      source.includes("id: 'build'"),
      'TABS must include build tab'
    );
    assert.ok(
      source.includes("label: 'Build'"),
      'Build tab must have Build label'
    );
  });
});
