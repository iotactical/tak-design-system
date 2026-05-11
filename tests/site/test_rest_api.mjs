import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

// rtmx:req REQ-XW-115
describe('REQ-XW-115: TAK Server REST API reference', () => {
  const dataPath = resolve(ROOT, 'data', 'tak-rest-api.json');

  it('data/tak-rest-api.json exists', () => {
    assert.ok(existsSync(dataPath), 'REST API data file must exist');
  });

  it('has base_url field', () => {
    const data = JSON.parse(readFileSync(dataPath, 'utf8'));
    assert.ok(typeof data.base_url === 'string', 'base_url must be a string');
    assert.ok(data.base_url.includes('Marti/api'), 'base_url must reference Marti/api');
  });

  it('has endpoints array with at least 10 entries', () => {
    const data = JSON.parse(readFileSync(dataPath, 'utf8'));
    assert.ok(Array.isArray(data.endpoints), 'endpoints must be an array');
    assert.ok(data.endpoints.length >= 10, 'endpoints must have at least 10 entries');
  });

  it('each endpoint has method, path, description, and auth', () => {
    const data = JSON.parse(readFileSync(dataPath, 'utf8'));
    for (const ep of data.endpoints) {
      assert.ok(typeof ep.method === 'string', `endpoint must have method: ${JSON.stringify(ep)}`);
      assert.ok(typeof ep.path === 'string', `endpoint must have path: ${JSON.stringify(ep)}`);
      assert.ok(typeof ep.description === 'string', `endpoint must have description: ${JSON.stringify(ep)}`);
      assert.ok(typeof ep.auth === 'string', `endpoint must have auth: ${JSON.stringify(ep)}`);
    }
  });

  it('includes mission and sync endpoints', () => {
    const data = JSON.parse(readFileSync(dataPath, 'utf8'));
    const paths = data.endpoints.map((e) => e.path);
    assert.ok(paths.includes('/missions'), 'Must include /missions endpoint');
    assert.ok(paths.some((p) => p.includes('/sync/')), 'Must include sync endpoints');
  });
});
