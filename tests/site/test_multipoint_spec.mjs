// rtmx:req REQ-XW-087
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../../', import.meta.url).pathname.replace(/\/$/, '');

describe('REQ-XW-087: Multi-point graphics specification', () => {
  const specPath = join(ROOT, 'data', 'mil-std-2525', 'multipoint-spec.md');

  it('multipoint-spec.md exists', () => {
    assert.ok(existsSync(specPath), 'data/mil-std-2525/multipoint-spec.md should exist');
  });

  it('documents what multi-point graphics are', () => {
    const content = readFileSync(specPath, 'utf8');
    assert.ok(content.includes('boundaries'), 'Should mention boundaries');
    assert.ok(content.includes('phase line'), 'Should mention phase lines');
    assert.ok(content.toLowerCase().includes('axes'), 'Should mention axes of advance');
    assert.ok(content.toLowerCase().includes('engagement area'), 'Should mention engagement areas');
  });

  it('documents 2525D/E definition with symbol set 25', () => {
    const content = readFileSync(specPath, 'utf8');
    assert.ok(content.includes('Symbol Set 25'), 'Should reference symbol set 25');
    assert.ok(content.includes('coordinate'), 'Should discuss coordinate arrays');
    assert.ok(content.includes('2525D') || content.includes('2525E'), 'Should reference 2525D or 2525E');
  });

  it('documents mil-sym-ts rendering approach', () => {
    const content = readFileSync(specPath, 'utf8');
    assert.ok(content.includes('mil-sym-ts'), 'Should reference mil-sym-ts');
    assert.ok(content.includes('GeoJSON') || content.includes('GeoSVG'), 'Should mention output format');
    assert.ok(content.includes('WebRenderer') || content.includes('RenderSymbol'), 'Should reference WebRenderer.RenderSymbol');
  });

  it('documents MapLibre GL + Web Worker approach for the site', () => {
    const content = readFileSync(specPath, 'utf8');
    assert.ok(content.includes('MapLibre'), 'Should mention MapLibre GL');
    assert.ok(content.includes('Web Worker') || content.includes('Worker'), 'Should mention Web Worker');
  });

  it('proposes a gallery approach', () => {
    const content = readFileSync(specPath, 'utf8');
    assert.ok(content.includes('gallery') || content.includes('Gallery'), 'Should propose gallery approach');
  });
});
