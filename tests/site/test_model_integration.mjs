// rtmx:req REQ-XW-074
// rtmx:req REQ-XW-075
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const palettesPath = join(root, 'site', 'src', 'pages', 'Palettes.tsx');

let source;

describe('REQ-XW-074: ModelViewer integrated into Vehicle Models tab', () => {
  it('can read Palettes.tsx source', () => {
    source = readFileSync(palettesPath, 'utf8');
    assert.ok(source.length > 0, 'Palettes.tsx should not be empty');
  });

  it('imports ModelViewer component', () => {
    assert.ok(
      source.includes("from '../components/ModelViewer'"),
      'Palettes.tsx should import ModelViewer from ../components/ModelViewer',
    );
  });

  it('VehicleModelsPanel renders ModelViewer or LazyModelViewer', () => {
    const hasModelViewer =
      source.includes('<ModelViewer') || source.includes('<LazyModelViewer');
    assert.ok(
      hasModelViewer,
      'VehicleModelsPanel should render ModelViewer or LazyModelViewer',
    );
  });

  it('constructs model path with category and name', () => {
    assert.ok(
      source.includes('models/') && source.includes('.DAE'),
      'Should construct modelPath with models/ prefix and .DAE extension',
    );
  });

  it('includes REQ-XW-074 requirement marker', () => {
    assert.ok(
      source.includes('REQ-XW-074'),
      'Palettes.tsx should have REQ-XW-074 marker',
    );
  });
});

describe('REQ-XW-075: Lazy loading with IntersectionObserver', () => {
  it('uses IntersectionObserver for lazy loading', () => {
    assert.ok(
      source.includes('IntersectionObserver'),
      'Should use IntersectionObserver for lazy loading',
    );
  });

  it('shows placeholder before intersection', () => {
    assert.ok(
      source.includes('Loading...') || source.includes('loading'),
      'Should show loading placeholder before model is visible',
    );
  });

  it('defines LazyModelViewer component', () => {
    assert.ok(
      source.includes('LazyModelViewer'),
      'Should define a LazyModelViewer component',
    );
  });

  it('disconnects observer on intersection or cleanup', () => {
    assert.ok(
      source.includes('observer.disconnect'),
      'Should disconnect IntersectionObserver after intersection or on cleanup',
    );
  });

  it('includes REQ-XW-075 requirement marker', () => {
    assert.ok(
      source.includes('REQ-XW-075'),
      'Palettes.tsx should have REQ-XW-075 marker',
    );
  });
});
