// rtmx:req REQ-PLN-003
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DRAWABLE_DIR = resolve(ROOT, 'icons', 'android-drawable');
const SVG_DIR = resolve(ROOT, 'icons', 'svg', 'atak');
const CATALOG_PATH = resolve(ROOT, 'data', 'atak-drawable-catalog.json');

describe('REQ-PLN-003: Android drawable icon set', () => {
  it('icons/android-drawable/ directory exists', () => {
    assert.ok(existsSync(DRAWABLE_DIR), 'android-drawable directory should exist');
  });

  it('has XML vector drawables generated from SVGs', () => {
    const files = readdirSync(DRAWABLE_DIR).filter(f => f.endsWith('.xml'));
    assert.ok(files.length >= 150, `Expected 150+ XML drawables, found ${files.length}`);
  });

  it('XML drawables are valid Android vector format', () => {
    const files = readdirSync(DRAWABLE_DIR).filter(f => f.endsWith('.xml'));
    const sample = readFileSync(resolve(DRAWABLE_DIR, files[0]), 'utf8');
    assert.ok(
      sample.includes('<vector') || sample.includes('<shape') || sample.includes('<?xml'),
      'XML files should be Android vector drawables',
    );
  });

  it('drawable catalog exists with 1000+ entries', () => {
    assert.ok(existsSync(CATALOG_PATH), 'Catalog should exist');
    const catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));
    assert.ok(catalog.length >= 1000, `Expected 1000+ catalog entries, found ${catalog.length}`);
  });

  it('SVG source directory has 150+ icons', () => {
    const svgs = readdirSync(SVG_DIR).filter(f => f.endsWith('.svg'));
    assert.ok(svgs.length >= 150, `Expected 150+ SVG sources, found ${svgs.length}`);
  });
});
