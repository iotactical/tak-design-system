import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

// rtmx:req REQ-XW-062
describe('REQ-XW-062: Interface catalog JSON schema', () => {
  const filePath = resolve(ROOT, 'data', 'tak-interface-schema.json');

  it('data/tak-interface-schema.json exists', () => {
    assert.ok(existsSync(filePath), 'Schema file must exist');
  });

  it('is valid JSON', () => {
    const raw = readFileSync(filePath, 'utf8');
    JSON.parse(raw);
  });

  it('has a $schema property referencing JSON Schema draft', () => {
    const schema = JSON.parse(readFileSync(filePath, 'utf8'));
    assert.ok(typeof schema.$schema === 'string', 'Missing $schema property');
    assert.ok(schema.$schema.includes('json-schema.org'), '$schema must reference json-schema.org');
  });

  it('has a title and description', () => {
    const schema = JSON.parse(readFileSync(filePath, 'utf8'));
    assert.ok(typeof schema.title === 'string' && schema.title.length > 0, 'Missing title');
    assert.ok(typeof schema.description === 'string' && schema.description.length > 0, 'Missing description');
  });

  it('defines externalInterface with required fields', () => {
    const schema = JSON.parse(readFileSync(filePath, 'utf8'));
    const extDef = schema.$defs?.externalInterface;
    assert.ok(extDef, 'Missing $defs.externalInterface');
    assert.ok(extDef.required.includes('name'), 'externalInterface must require name');
    assert.ok(extDef.required.includes('protocol'), 'externalInterface must require protocol');
    assert.ok(extDef.required.includes('format'), 'externalInterface must require format');
    assert.ok(extDef.required.includes('direction'), 'externalInterface must require direction');
  });

  it('defines internalInterface with required fields', () => {
    const schema = JSON.parse(readFileSync(filePath, 'utf8'));
    const intDef = schema.$defs?.internalInterface;
    assert.ok(intDef, 'Missing $defs.internalInterface');
    assert.ok(intDef.required.includes('name'), 'internalInterface must require name');
    assert.ok(intDef.required.includes('type'), 'internalInterface must require type');
    assert.ok(intDef.required.includes('mechanism'), 'internalInterface must require mechanism');
  });

  it('direction enum includes inbound, outbound, bidirectional', () => {
    const schema = JSON.parse(readFileSync(filePath, 'utf8'));
    const dirEnum = schema.$defs?.externalInterface?.properties?.direction?.enum;
    assert.ok(Array.isArray(dirEnum), 'direction must have enum');
    assert.ok(dirEnum.includes('inbound'), 'direction enum must include inbound');
    assert.ok(dirEnum.includes('outbound'), 'direction enum must include outbound');
    assert.ok(dirEnum.includes('bidirectional'), 'direction enum must include bidirectional');
  });

  it('type enum includes lifecycle, event, storage, render, plugin', () => {
    const schema = JSON.parse(readFileSync(filePath, 'utf8'));
    const typeEnum = schema.$defs?.internalInterface?.properties?.type?.enum;
    assert.ok(Array.isArray(typeEnum), 'type must have enum');
    for (const t of ['lifecycle', 'event', 'storage', 'render', 'plugin']) {
      assert.ok(typeEnum.includes(t), `type enum must include ${t}`);
    }
  });
});
