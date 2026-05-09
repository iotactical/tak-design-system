import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

// rtmx:req REQ-XW-060
describe('REQ-XW-060: External interfaces catalog', () => {
  const filePath = resolve(ROOT, 'data', 'tak-interfaces-external.json');

  it('data/tak-interfaces-external.json exists', () => {
    assert.ok(existsSync(filePath), 'External interfaces file must exist');
  });

  it('is valid JSON', () => {
    const raw = readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    assert.ok(Array.isArray(data), 'File must contain a JSON array');
  });

  it('has at least 10 entries', () => {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    assert.ok(data.length >= 10, `Expected 10+ entries, got ${data.length}`);
  });

  it('each entry has required fields: name, protocol, format, direction', () => {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    for (const entry of data) {
      assert.ok(typeof entry.name === 'string' && entry.name.length > 0, `Missing or empty name`);
      assert.ok(typeof entry.protocol === 'string' && entry.protocol.length > 0, `Missing or empty protocol in "${entry.name}"`);
      assert.ok(typeof entry.format === 'string' && entry.format.length > 0, `Missing or empty format in "${entry.name}"`);
      assert.ok(
        ['inbound', 'outbound', 'bidirectional'].includes(entry.direction),
        `Invalid direction "${entry.direction}" in "${entry.name}"`
      );
    }
  });

  it('each entry has a description', () => {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    for (const entry of data) {
      assert.ok(typeof entry.description === 'string' && entry.description.length > 0, `Missing description in "${entry.name}"`);
    }
  });

  it('port field is string or null for each entry', () => {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    for (const entry of data) {
      assert.ok(
        entry.port === null || typeof entry.port === 'string',
        `Port must be string or null in "${entry.name}", got ${typeof entry.port}`
      );
    }
  });
});
