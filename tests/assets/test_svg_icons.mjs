// rtmx:req REQ-PLN-002
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const SVG_DIR = resolve(ROOT, 'icons', 'svg', 'atak');
const REGISTRY = resolve(ROOT, 'data', 'tak-icon-registry.json');

describe('REQ-PLN-002: SVG icon assets', () => {
  it('icons/svg/atak directory exists', () => {
    assert.ok(existsSync(SVG_DIR), 'icons/svg/atak/ directory missing');
  });

  it('has at least 150 SVG files', () => {
    const files = readdirSync(SVG_DIR).filter(f => f.endsWith('.svg'));
    assert.ok(files.length >= 150,
      `Expected >= 150 SVGs, found ${files.length}`);
  });

  it('all SVG files are valid XML', () => {
    const files = readdirSync(SVG_DIR).filter(f => f.endsWith('.svg'));
    let invalid = 0;
    let firstInvalid = '';
    for (const f of files) {
      const content = readFileSync(resolve(SVG_DIR, f), 'utf8');
      if (!content.includes('<svg')) {
        invalid++;
        if (!firstInvalid) firstInvalid = f;
      }
    }
    assert.equal(invalid, 0,
      `${invalid} SVG files lack <svg> root (e.g. ${firstInvalid})`);
  });

  it('registry contains SVG format entries', () => {
    const registry = JSON.parse(readFileSync(REGISTRY, 'utf8'));
    const svgEntries = registry.filter(i => i.formats && i.formats.svg);
    assert.ok(svgEntries.length >= 150,
      `Expected >= 150 SVG registry entries, found ${svgEntries.length}`);
  });

  it('all registered SVG paths resolve to files on disk', () => {
    const registry = JSON.parse(readFileSync(REGISTRY, 'utf8'));
    const svgEntries = registry.filter(i => i.formats && i.formats.svg);
    let missing = 0;
    let firstMissing = '';
    for (const entry of svgEntries) {
      const p = resolve(ROOT, entry.formats.svg);
      if (!existsSync(p)) {
        missing++;
        if (!firstMissing) firstMissing = `${entry.id}: ${entry.formats.svg}`;
      }
    }
    assert.equal(missing, 0,
      `${missing} registered SVGs missing on disk (e.g. ${firstMissing})`);
  });
});
