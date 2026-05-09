import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const manifestPath = resolve(ROOT, 'data/atak-menu-icons.json');

// rtmx:req REQ-ICN-003
describe('REQ-ICN-003: ATAK menu icon library', () => {
  it('data/atak-menu-icons.json exists and is valid JSON', () => {
    assert.ok(existsSync(manifestPath), 'Manifest file does not exist');
    const raw = readFileSync(manifestPath, 'utf8');
    const parsed = JSON.parse(raw);
    assert.ok(Array.isArray(parsed), 'Manifest is not an array');
  });

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

  it('has at least 70 entries', () => {
    assert.ok(
      manifest.length >= 70,
      `Expected >= 70 menu icons, found ${manifest.length}`
    );
  });

  it('each entry has name, hasSvg, and format fields', () => {
    for (const entry of manifest) {
      assert.ok(typeof entry.name === 'string', `Missing or invalid name`);
      assert.ok(typeof entry.hasSvg === 'boolean', `Missing or invalid hasSvg for ${entry.name}`);
      assert.ok(
        entry.format === 'svg' || entry.format === 'png',
        `Invalid format for ${entry.name}: ${entry.format}`
      );
    }
  });

  it('at least some entries have hasSvg === true', () => {
    const svgCount = manifest.filter(e => e.hasSvg).length;
    assert.ok(svgCount > 0, 'No entries have hasSvg === true');
  });

  it('entries are sorted alphabetically by name', () => {
    for (let i = 1; i < manifest.length; i++) {
      assert.ok(
        manifest[i].name.localeCompare(manifest[i - 1].name) >= 0,
        `Not sorted: ${manifest[i - 1].name} should come before ${manifest[i].name}`
      );
    }
  });
});
