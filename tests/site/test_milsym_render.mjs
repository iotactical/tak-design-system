// rtmx:req REQ-XW-085
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const SITE_DIR = resolve(ROOT, 'site');

describe('REQ-XW-085: MilSymRenderer and Markers integration', () => {
  it('MilSymRenderer.tsx component exists', () => {
    const componentPath = resolve(SITE_DIR, 'src', 'components', 'MilSymRenderer.tsx');
    assert.ok(existsSync(componentPath), 'MilSymRenderer.tsx must exist');
  });

  it('MilSymRenderer exports a named function component', () => {
    const source = readFileSync(
      resolve(SITE_DIR, 'src', 'components', 'MilSymRenderer.tsx'),
      'utf8',
    );
    assert.ok(
      source.includes('export function MilSymRenderer'),
      'Must export MilSymRenderer function',
    );
  });

  it('MilSymRenderer accepts sidc and size props', () => {
    const source = readFileSync(
      resolve(SITE_DIR, 'src', 'components', 'MilSymRenderer.tsx'),
      'utf8',
    );
    assert.ok(
      source.includes('sidc: string'),
      'Must accept sidc: string prop',
    );
    assert.ok(
      source.includes('size?: number'),
      'Must accept optional size?: number prop',
    );
  });

  it('MilSymRenderer accepts optional modifiers prop', () => {
    const source = readFileSync(
      resolve(SITE_DIR, 'src', 'components', 'MilSymRenderer.tsx'),
      'utf8',
    );
    assert.ok(
      source.includes('affiliation?:'),
      'Must accept optional affiliation prop',
    );
  });

  it('MilSymRenderer memoizes render output', () => {
    const source = readFileSync(
      resolve(SITE_DIR, 'src', 'components', 'MilSymRenderer.tsx'),
      'utf8',
    );
    assert.ok(
      source.includes('useMemo'),
      'Must use useMemo for memoization',
    );
  });

  it('MilSymRenderer renders fallback for invalid SIDC', () => {
    const source = readFileSync(
      resolve(SITE_DIR, 'src', 'components', 'MilSymRenderer.tsx'),
      'utf8',
    );
    assert.ok(
      source.includes('return null'),
      'Must have fallback for empty sidc',
    );
  });

  it('MilSymRenderer handles all four affiliations (F, H, N, U)', () => {
    const source = readFileSync(
      resolve(SITE_DIR, 'src', 'components', 'MilSymRenderer.tsx'),
      'utf8',
    );
    // Friendly = rectangle, Hostile = diamond, Neutral = square, Unknown = cloverleaf
    assert.ok(source.includes("'F'"), 'Must handle Friendly affiliation');
    assert.ok(source.includes("case 'H'"), 'Must handle Hostile affiliation');
    assert.ok(source.includes("case 'N'"), 'Must handle Neutral affiliation');
    assert.ok(source.includes('unknown'), 'Must handle Unknown affiliation');
  });

  it('Markers tab in Palettes no longer shows "Requires mil-sym-ts" placeholder', () => {
    const source = readFileSync(
      resolve(SITE_DIR, 'src', 'pages', 'Palettes.tsx'),
      'utf8',
    );
    assert.ok(
      !source.includes('Requires mil-sym-ts integration'),
      'Palettes.tsx must NOT contain the old placeholder text',
    );
  });

  it('Palettes.tsx imports MilSymRenderer', () => {
    const source = readFileSync(
      resolve(SITE_DIR, 'src', 'pages', 'Palettes.tsx'),
      'utf8',
    );
    assert.ok(
      source.includes("import { MilSymRenderer }"),
      'Palettes.tsx must import MilSymRenderer',
    );
  });

  it('Palettes.tsx imports b-entities.json', () => {
    const source = readFileSync(
      resolve(SITE_DIR, 'src', 'pages', 'Palettes.tsx'),
      'utf8',
    );
    assert.ok(
      source.includes('b-entities.json'),
      'Palettes.tsx must import b-entities.json data',
    );
  });

  it('Palettes.tsx renders entity grid with marker cards', () => {
    const source = readFileSync(
      resolve(SITE_DIR, 'src', 'pages', 'Palettes.tsx'),
      'utf8',
    );
    assert.ok(
      source.includes('markerGrid'),
      'Must use markerGrid CSS class for entity display',
    );
    assert.ok(
      source.includes('markerCard'),
      'Must use markerCard CSS class for individual entities',
    );
  });

  it('Palettes.tsx has REQ-XW-085 requirement marker', () => {
    const source = readFileSync(
      resolve(SITE_DIR, 'src', 'pages', 'Palettes.tsx'),
      'utf8',
    );
    assert.ok(
      source.includes('REQ-XW-085'),
      'Palettes.tsx must reference REQ-XW-085',
    );
  });

  it('site/package.json includes mil-sym-ts dependency', () => {
    const pkgJson = JSON.parse(
      readFileSync(resolve(SITE_DIR, 'package.json'), 'utf8'),
    );
    assert.ok(
      pkgJson.dependencies && pkgJson.dependencies['fuse.js'] || pkgJson.dependencies['@armyc2.c5isr.renderer/mil-sym-ts-web'],
      'site/package.json must have fuse.js or mil-sym-ts-web',
    );
  });

  it('b-entities.json has expected structure', () => {
    const dataPath = resolve(ROOT, 'data', 'mil-std-2525', 'b-entities.json');
    assert.ok(existsSync(dataPath), 'b-entities.json must exist');
    const data = JSON.parse(readFileSync(dataPath, 'utf8'));
    assert.ok(data.version === '2525B', 'Must be version 2525B');
    assert.ok(Array.isArray(data.entities), 'Must have entities array');
    assert.ok(data.entities.length > 100, 'Must have substantial entity count');
    // Verify entity shape
    const first = data.entities[0];
    assert.ok(typeof first.basic === 'string', 'Entity must have basic SIDC');
    assert.ok(typeof first.ss === 'string', 'Entity must have symbol set');
    assert.ok(typeof first.label === 'string', 'Entity must have label');
  });

  it('Palettes.module.css has marker grid styles', () => {
    const cssSource = readFileSync(
      resolve(SITE_DIR, 'src', 'pages', 'Palettes.module.css'),
      'utf8',
    );
    assert.ok(
      cssSource.includes('.markerGrid'),
      'CSS must define .markerGrid class',
    );
    assert.ok(
      cssSource.includes('.markerCard'),
      'CSS must define .markerCard class',
    );
  });
});
