// rtmx:req REQ-XW-072
// rtmx:req REQ-XW-073
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const componentPath = join(root, 'site', 'src', 'components', 'ModelViewer.tsx');
const cssPath = join(root, 'site', 'src', 'components', 'ModelViewer.module.css');

describe('REQ-XW-072: ModelViewer component exists', () => {
  it('site/src/components/ModelViewer.tsx exists', () => {
    assert.ok(existsSync(componentPath), 'ModelViewer.tsx should exist');
  });

  it('site/src/components/ModelViewer.module.css exists', () => {
    assert.ok(existsSync(cssPath), 'ModelViewer.module.css should exist');
  });
});

describe('REQ-XW-073: ModelViewer uses Three.js with ColladaLoader', () => {
  let source;

  it('can read ModelViewer.tsx source', () => {
    source = readFileSync(componentPath, 'utf8');
    assert.ok(source.length > 0, 'ModelViewer.tsx should not be empty');
  });

  it('contains ColladaLoader import', () => {
    assert.ok(
      source.includes('ColladaLoader'),
      'ModelViewer.tsx should import ColladaLoader',
    );
  });

  it('contains OrbitControls import', () => {
    assert.ok(
      source.includes('OrbitControls'),
      'ModelViewer.tsx should import OrbitControls',
    );
  });

  it('exports ModelViewer component', () => {
    assert.ok(
      source.includes('export function ModelViewer') ||
        source.includes('export default ModelViewer') ||
        source.includes('export { ModelViewer'),
      'ModelViewer.tsx should export ModelViewer',
    );
  });

  it('contains cleanup/dispose logic', () => {
    assert.ok(
      source.includes('.dispose()'),
      'ModelViewer.tsx should call dispose() for cleanup',
    );
    assert.ok(
      source.includes('cancelAnimationFrame'),
      'ModelViewer.tsx should cancel the animation frame on cleanup',
    );
  });

  it('handles loading state', () => {
    assert.ok(
      source.includes('loading') || source.includes('Loading'),
      'ModelViewer.tsx should handle loading state',
    );
  });

  it('handles error/fallback state', () => {
    assert.ok(
      source.includes('error') || source.includes('fallback'),
      'ModelViewer.tsx should handle error/fallback state',
    );
  });

  it('accepts modelPath prop', () => {
    assert.ok(
      source.includes('modelPath'),
      'ModelViewer.tsx should accept modelPath prop',
    );
  });

  it('sets up ambient and directional lighting', () => {
    assert.ok(
      source.includes('AmbientLight'),
      'ModelViewer.tsx should add AmbientLight',
    );
    assert.ok(
      source.includes('DirectionalLight'),
      'ModelViewer.tsx should add DirectionalLight',
    );
  });
});
