// rtmx:req REQ-ICN-002
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const SVG_DIR = resolve(ROOT, 'icons/svg/atak');
const MANIFEST_PATH = resolve(ROOT, 'data/atak-vector-manifest.json');

describe('REQ-ICN-002: ATAK vector drawable to SVG extraction', () => {
  it('icons/svg/atak/ directory exists', () => {
    assert.ok(existsSync(SVG_DIR), 'SVG output directory must exist');
  });

  it('at least 150 SVG files generated', () => {
    const svgFiles = readdirSync(SVG_DIR).filter(f => f.endsWith('.svg'));
    assert.ok(
      svgFiles.length >= 150,
      `Expected >= 150 SVG files, got ${svgFiles.length}`
    );
  });

  it('each SVG file starts with <svg and contains valid XML structure', () => {
    const svgFiles = readdirSync(SVG_DIR).filter(f => f.endsWith('.svg'));
    const invalid = [];

    for (const file of svgFiles) {
      const content = readFileSync(resolve(SVG_DIR, file), 'utf8');
      if (!content.startsWith('<svg')) {
        invalid.push(`${file}: does not start with <svg`);
        continue;
      }
      if (!content.includes('xmlns="http://www.w3.org/2000/svg"')) {
        invalid.push(`${file}: missing xmlns attribute`);
        continue;
      }
      if (!content.includes('viewBox="')) {
        invalid.push(`${file}: missing viewBox attribute`);
        continue;
      }
      if (!content.includes('</svg>')) {
        invalid.push(`${file}: missing closing </svg> tag`);
        continue;
      }
      if (!content.includes('<path ')) {
        invalid.push(`${file}: no <path> elements found`);
      }
    }

    assert.equal(
      invalid.length,
      0,
      `Invalid SVG files:\n${invalid.slice(0, 10).join('\n')}`
    );
  });

  it('data/atak-vector-manifest.json exists', () => {
    assert.ok(existsSync(MANIFEST_PATH), 'Manifest file must exist');
  });

  it('manifest is valid JSON and lists all SVG files', () => {
    const raw = readFileSync(MANIFEST_PATH, 'utf8');
    let manifest;
    assert.doesNotThrow(() => {
      manifest = JSON.parse(raw);
    }, 'Manifest must be valid JSON');

    assert.ok(Array.isArray(manifest), 'Manifest must be an array');

    const svgFiles = readdirSync(SVG_DIR).filter(f => f.endsWith('.svg'));
    assert.equal(
      manifest.length,
      svgFiles.length,
      `Manifest entries (${manifest.length}) must match SVG file count (${svgFiles.length})`
    );
  });

  it('manifest entries have name and viewBox fields', () => {
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
    const missing = [];

    for (const entry of manifest) {
      if (!entry.name) {
        missing.push('entry missing name');
      }
      if (!entry.viewBox) {
        missing.push(`${entry.name || '(unnamed)'} missing viewBox`);
      }
    }

    assert.equal(
      missing.length,
      0,
      `Entries with missing fields: ${missing.slice(0, 10).join('; ')}`
    );
  });

  it('manifest entries are sorted alphabetically by name', () => {
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
    for (let i = 1; i < manifest.length; i++) {
      assert.ok(
        manifest[i].name.localeCompare(manifest[i - 1].name) >= 0,
        `Entries not sorted: ${manifest[i - 1].name} > ${manifest[i].name}`
      );
    }
  });
});
