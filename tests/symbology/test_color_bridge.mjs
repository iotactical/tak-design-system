import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const BRIDGE_DIR = resolve(ROOT, 'platforms/bridge');

// rtmx:req REQ-SYM-002

const EXPECTED_COLORS = {
  friendly: '#2196F3',
  hostile: '#F44336',
  neutral: '#4CAF50',
  unknown: '#FFEB3B',
  suspect: '#FF9800',
  pending: '#FBC02D'
};

const AFFILIATIONS = Object.keys(EXPECTED_COLORS);

describe('REQ-SYM-002: Design token to mil-sym affiliation color bridge', () => {
  before(() => {
    execSync('npm run build:bridge', { cwd: ROOT, stdio: 'pipe' });
  });

  // --- File generation ---

  it('generates mil-sym-ts-colors.json', () => {
    assert.ok(existsSync(resolve(BRIDGE_DIR, 'mil-sym-ts-colors.json')));
  });

  it('generates mil-sym-java-colors.properties', () => {
    assert.ok(existsSync(resolve(BRIDGE_DIR, 'mil-sym-java-colors.properties')));
  });

  it('generates mil-sym-android-colors.xml', () => {
    assert.ok(existsSync(resolve(BRIDGE_DIR, 'mil-sym-android-colors.xml')));
  });

  // --- mil-sym-ts JSON ---

  describe('mil-sym-ts-colors.json', () => {
    let data;
    before(() => {
      data = JSON.parse(readFileSync(resolve(BRIDGE_DIR, 'mil-sym-ts-colors.json'), 'utf8'));
    });

    for (const aff of AFFILIATIONS) {
      it(`contains ${aff} with correct value`, () => {
        assert.equal(data.affiliationColors[aff], EXPECTED_COLORS[aff]);
      });
    }
  });

  // --- mil-sym-java properties ---

  describe('mil-sym-java-colors.properties', () => {
    let content;
    before(() => {
      content = readFileSync(resolve(BRIDGE_DIR, 'mil-sym-java-colors.properties'), 'utf8');
    });

    for (const aff of AFFILIATIONS) {
      it(`contains ${aff} with correct value`, () => {
        assert.ok(content.includes(`affiliation.${aff}=${EXPECTED_COLORS[aff]}`));
      });
    }
  });

  // --- mil-sym-android XML ---

  describe('mil-sym-android-colors.xml', () => {
    let content;
    before(() => {
      content = readFileSync(resolve(BRIDGE_DIR, 'mil-sym-android-colors.xml'), 'utf8');
    });

    for (const aff of AFFILIATIONS) {
      it(`contains ${aff} with correct value`, () => {
        assert.ok(
          content.includes(`<color name="mil_sym_affiliation_${aff}">${EXPECTED_COLORS[aff]}</color>`)
        );
      });
    }
  });
});
