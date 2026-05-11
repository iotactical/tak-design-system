// rtmx:req REQ-XW-136
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const PALETTES = resolve(ROOT, 'site', 'src', 'pages', 'Palettes.tsx');
const DAE_MAP = resolve(ROOT, 'data', 'vehicle-dae-map.json');

describe('REQ-XW-136: Vehicle model performance', () => {
  it('data/vehicle-dae-map.json exists with model mappings', () => {
    assert.ok(existsSync(DAE_MAP), 'vehicle-dae-map.json must exist');
    const data = JSON.parse(readFileSync(DAE_MAP, 'utf8'));
    assert.ok(
      typeof data === 'object' && Object.keys(data).length > 0,
      'vehicle-dae-map.json must have at least one model mapping'
    );
    // Verify mapping format: key is "category/name", value is "filename.DAE"
    const firstKey = Object.keys(data)[0];
    assert.ok(
      firstKey.includes('/'),
      'DAE map keys must be in "category/name" format'
    );
    assert.ok(
      data[firstKey].endsWith('.DAE'),
      'DAE map values must end with .DAE'
    );
  });

  const source = readFileSync(PALETTES, 'utf8');

  it('Palettes.tsx has LazyModelViewer with IntersectionObserver', () => {
    assert.ok(
      source.includes('function LazyModelViewer'),
      'Palettes.tsx must define a LazyModelViewer component'
    );
    assert.ok(
      source.includes('IntersectionObserver'),
      'LazyModelViewer must use IntersectionObserver for lazy loading'
    );
    assert.ok(
      source.includes('isIntersecting'),
      'LazyModelViewer must check isIntersecting to trigger loading'
    );
  });

  it('LazyModelViewer disconnects observer on visibility', () => {
    assert.ok(
      source.includes('observer.disconnect()'),
      'IntersectionObserver must be disconnected after element becomes visible'
    );
  });

  it('VehicleModelsPanel exists and renders vehicle models', () => {
    assert.ok(
      source.includes('function VehicleModelsPanel'),
      'Palettes.tsx must define VehicleModelsPanel'
    );
    assert.ok(
      source.includes('Vehicle Models'),
      'VehicleModelsPanel must display "Vehicle Models" label'
    );
  });

  it('VehicleModelsPanel uses LazyModelViewer', () => {
    assert.ok(
      source.includes('<LazyModelViewer'),
      'VehicleModelsPanel must render LazyModelViewer components'
    );
  });

  it('Palettes.tsx imports vehicle-dae-map.json', () => {
    assert.ok(
      source.includes('vehicle-dae-map.json'),
      'Palettes.tsx must import the DAE map for model filename resolution'
    );
  });

  it('deriveDaeFilename uses DAE map with fallback', () => {
    assert.ok(
      source.includes('function deriveDaeFilename'),
      'Palettes.tsx must define deriveDaeFilename helper'
    );
    assert.ok(
      source.includes("vehicleDaeMap[`${category}/${name}`]"),
      'deriveDaeFilename must look up from vehicleDaeMap'
    );
  });
});
