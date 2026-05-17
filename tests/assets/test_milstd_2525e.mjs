// rtmx:req REQ-TOK-006
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MILSTD_DIR = resolve(__dirname, '..', '..', 'data', 'mil-std-2525');

describe('REQ-TOK-006: MIL-STD-2525E SIDC support', () => {
  const sidcPath = resolve(MILSTD_DIR, 'sidc-2525de.json');
  const msePath = resolve(MILSTD_DIR, 'mse.json');
  const b2dPath = resolve(MILSTD_DIR, 'b2d.json');

  it('test_2525e_mapping_valid', () => {
    assert.ok(existsSync(sidcPath), 'sidc-2525de.json must exist');
    const data = JSON.parse(readFileSync(sidcPath, 'utf8'));
    assert.ok(data.fields, 'Must have field definitions');
    assert.ok(data.symbolSets, 'Must have symbol set codes');
    assert.ok(data.standardIdentity, 'Must have standard identity codes');
    assert.ok(data.versions, 'Must have version definitions');
  });

  it('test_20char_sidc_format', () => {
    const data = JSON.parse(readFileSync(sidcPath, 'utf8'));
    assert.equal(data.fields.length, 13, 'Must have 13 field definitions');

    // Verify fields cover full 20-char span
    const lastField = data.fields[data.fields.length - 1];
    assert.equal(lastField.position[1], 20, 'Fields must cover 20 characters total');

    // Verify no gaps between fields
    for (let i = 1; i < data.fields.length; i++) {
      assert.equal(
        data.fields[i].position[0],
        data.fields[i - 1].position[1],
        `Gap between fields ${data.fields[i - 1].name} and ${data.fields[i].name}`,
      );
    }
    assert.equal(data.fields[0].position[0], 0, 'First field must start at 0');
  });

  it('test_2525e_version_codes', () => {
    const data = JSON.parse(readFileSync(sidcPath, 'utf8'));
    assert.ok(data.versions['15'], '2525E must use version code 15');
    assert.ok(data.versions['16'], '2525E Change 1 must use version code 16');
    assert.ok(data.versions['10'], '2525D must use version code 10');
  });

  it('test_symbol_set_codes', () => {
    const data = JSON.parse(readFileSync(sidcPath, 'utf8'));
    const ss = data.symbolSets;
    assert.equal(ss['01'], 'Air', 'Symbol set 01 must be Air');
    assert.equal(ss['10'], 'Land Unit', 'Symbol set 10 must be Land Unit');
    assert.equal(ss['25'], 'Control Measures', 'Symbol set 25 must be Control Measures');
    assert.equal(ss['30'], 'Sea Surface', 'Symbol set 30 must be Sea Surface');
    assert.equal(ss['60'], 'Cyberspace', 'Symbol set 60 must be Cyberspace');
  });

  it('test_affiliation_field_positions', () => {
    const data = JSON.parse(readFileSync(sidcPath, 'utf8'));
    const siField = data.fields.find(f => f.name === 'standardIdentity');
    assert.ok(siField, 'Must have standardIdentity field');
    assert.deepEqual(siField.position, [3, 4], 'SI field at position 3-4 for 2525D/E');
    assert.ok(data.affiliationMapping, 'Must have affiliation mapping');
    assert.equal(data.affiliationMapping['3'], 'friend', 'Code 3 = friend');
    assert.equal(data.affiliationMapping['6'], 'hostile', 'Code 6 = hostile');
  });

  it('test_mse_entity_data_exists', () => {
    assert.ok(existsSync(msePath), 'mse.json must exist');
    const mse = JSON.parse(readFileSync(msePath, 'utf8'));
    assert.ok(mse.mse?.SYMBOL, 'Must have SYMBOL array');
    assert.ok(mse.mse.SYMBOL.length >= 2100, `Expected 2100+ entities, got ${mse.mse.SYMBOL.length}`);
  });

  it('test_b2d_crosswalk_exists', () => {
    assert.ok(existsSync(b2dPath), 'b2d.json must exist');
    const b2d = JSON.parse(readFileSync(b2dPath, 'utf8'));
    assert.ok(b2d.mappings, 'Must have mappings array');
    assert.ok(b2d.mappings.length >= 1900, `Expected 1900+ mappings, got ${b2d.mappings.length}`);
  });

  it('test_sidc_parsing_examples', () => {
    const data = JSON.parse(readFileSync(sidcPath, 'utf8'));
    assert.ok(data.examples?.length >= 3, 'Must have at least 3 examples');

    for (const ex of data.examples) {
      assert.equal(ex.sidc.length, 20, `Example SIDC must be 20 chars: ${ex.sidc}`);
      assert.ok(ex.parsed, `Example must have parsed fields: ${ex.description}`);
      assert.ok(ex.parsed.version, 'Parsed must have version');
      assert.ok(ex.parsed.standardIdentity, 'Parsed must have standardIdentity');
      assert.ok(ex.parsed.symbolSet, 'Parsed must have symbolSet');

      // Verify parsing matches the SIDC string
      const sidc = ex.sidc;
      for (const field of data.fields) {
        const extracted = sidc.substring(field.position[0], field.position[1]);
        assert.equal(extracted, ex.parsed[field.name],
          `Field ${field.name} mismatch in ${ex.description}: expected ${ex.parsed[field.name]}, got ${extracted}`);
      }
    }
  });

  it('test_2525e_symbol_sets_cover_common_types', () => {
    const data = JSON.parse(readFileSync(sidcPath, 'utf8'));
    const ss = data.symbolSets;
    // Must cover the common TAK entity types
    const required = ['Air', 'Land Unit', 'Land Equipment', 'Land Installation',
      'Control Measures', 'Sea Surface', 'Sea Subsurface', 'Activities'];
    for (const name of required) {
      const found = Object.values(ss).includes(name);
      assert.ok(found, `Must include symbol set: ${name}`);
    }
  });
});
