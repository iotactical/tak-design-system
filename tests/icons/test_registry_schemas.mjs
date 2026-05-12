import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const SCHEMAS = resolve(ROOT, 'schemas');
const DATA = resolve(ROOT, 'data');

// rtmx:req REQ-XW-252
describe('REQ-XW-252: JSON Schema files for registry data', () => {
  it('tak-icon-registry.schema.json exists and is valid JSON Schema', () => {
    const path = resolve(SCHEMAS, 'tak-icon-registry.schema.json');
    assert.ok(existsSync(path), 'Schema file missing');
    const schema = JSON.parse(readFileSync(path, 'utf8'));
    assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.ok(schema.$defs?.iconEntry, 'Missing iconEntry definition');
    assert.ok(schema.$defs.iconEntry.required?.includes('id'), 'id must be required');
    assert.ok(schema.$defs.iconEntry.required?.includes('formats'), 'formats must be required');
  });

  it('tak-radial-action-icons.schema.json exists and is valid JSON Schema', () => {
    const path = resolve(SCHEMAS, 'tak-radial-action-icons.schema.json');
    assert.ok(existsSync(path), 'Schema file missing');
    const schema = JSON.parse(readFileSync(path, 'utf8'));
    assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.ok(schema.$defs?.actionEntry, 'Missing actionEntry definition');
    assert.ok(schema.$defs.actionEntry.required?.includes('action'), 'action must be required');
    assert.ok(schema.$defs.actionEntry.required?.includes('iconId'), 'iconId must be required');
  });

  it('registry entries conform to schema required fields', () => {
    const schema = JSON.parse(readFileSync(resolve(SCHEMAS, 'tak-icon-registry.schema.json'), 'utf8'));
    const registry = JSON.parse(readFileSync(resolve(DATA, 'tak-icon-registry.json'), 'utf8'));
    const required = schema.$defs.iconEntry.required;
    const allowedSources = schema.$defs.iconEntry.properties.source.enum;

    const violations = [];
    for (const entry of registry) {
      for (const field of required) {
        if (entry[field] === undefined) violations.push(`${entry.id}: missing ${field}`);
      }
      if (!allowedSources.includes(entry.source)) {
        violations.push(`${entry.id}: invalid source "${entry.source}"`);
      }
    }
    assert.equal(violations.length, 0, `Schema violations:\n${violations.slice(0, 10).join('\n')}`);
  });

  it('radial action entries conform to schema required fields', () => {
    const schema = JSON.parse(readFileSync(resolve(SCHEMAS, 'tak-radial-action-icons.schema.json'), 'utf8'));
    const radial = JSON.parse(readFileSync(resolve(DATA, 'tak-radial-action-icons.json'), 'utf8'));
    const required = schema.$defs.actionEntry.required;

    const violations = [];
    for (const entry of radial.actions) {
      for (const field of required) {
        if (entry[field] === undefined) violations.push(`${entry.action}: missing ${field}`);
      }
      if (!/^tak\./.test(entry.iconId)) {
        violations.push(`${entry.action}: iconId must start with tak.`);
      }
    }
    assert.equal(violations.length, 0, `Schema violations:\n${violations.slice(0, 10).join('\n')}`);
  });

  it('schema ID patterns match actual registry IDs', () => {
    const schema = JSON.parse(readFileSync(resolve(SCHEMAS, 'tak-icon-registry.schema.json'), 'utf8'));
    const registry = JSON.parse(readFileSync(resolve(DATA, 'tak-icon-registry.json'), 'utf8'));
    const pattern = new RegExp(schema.$defs.iconEntry.properties.id.pattern);
    const invalid = registry.filter(e => !pattern.test(e.id));
    assert.equal(invalid.length, 0, `IDs not matching schema pattern: ${invalid.map(e => e.id).join(', ')}`);
  });
});
