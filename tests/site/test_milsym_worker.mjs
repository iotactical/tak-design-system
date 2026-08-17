// rtmx:req REQ-XW-137
// Tests for Web Worker runtime renderer for mil-sym-ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

test('REQ-XW-137: milsym-worker.ts exists', () => {
  const workerPath = resolve(ROOT, 'site/src/workers/milsym-worker.ts');
  assert.ok(existsSync(workerPath), 'Worker file should exist');
});

test('REQ-XW-137: useMilSymWorker hook exists', () => {
  const hookPath = resolve(ROOT, 'site/src/hooks/useMilSymWorker.ts');
  assert.ok(existsSync(hookPath), 'Hook file should exist');
});

test('REQ-XW-137: MilSymRendererLive component exists', () => {
  const componentPath = resolve(ROOT, 'site/src/components/MilSymRendererLive.tsx');
  assert.ok(existsSync(componentPath), 'MilSymRendererLive component should exist');
});

test('REQ-XW-137: Worker handles message events via self.onmessage', () => {
  const workerPath = resolve(ROOT, 'site/src/workers/milsym-worker.ts');
  const content = readFileSync(workerPath, 'utf8');
  assert.ok(
    content.includes('self.onmessage'),
    'Worker should handle message events via self.onmessage'
  );
  assert.ok(
    content.includes('postMessage'),
    'Worker should post messages back via postMessage'
  );
  assert.ok(
    content.includes('RenderSVG'),
    'Worker should call RenderSVG for symbol rendering'
  );
});

test('REQ-XW-137: Worker keeps amplifier SVG and falls back E icons to D tables', () => {
  const workerPath = resolve(ROOT, 'site/src/workers/milsym-worker.ts');
  const content = readFileSync(workerPath, 'utf8');
  assert.ok(
    content.includes("startsWith('<svg')"),
    'packSvg must not re-wrap a complete SVG (that clips echelon)'
  );
  assert.ok(
    content.includes('rendererSidcCandidates'),
    'Worker must generate version fallbacks for 2525E SIDCs'
  );
  assert.ok(
    content.includes('`13${rest}`') || content.includes('13${rest}'),
    '2525E SIDCs must fall back to version 13'
  );
  assert.ok(
    content.includes('`11${rest}`') || content.includes('11${rest}'),
    '2525E SIDCs must fall back to 2525D ch1 (11)'
  );
  assert.ok(
    content.includes('next.length > packed.length'),
    'Worker must prefer the richer SVG so empty E frames lose to D icons'
  );
});

test('REQ-XW-137: Worker catches errors to prevent main-thread crash', () => {
  const workerPath = resolve(ROOT, 'site/src/workers/milsym-worker.ts');
  const content = readFileSync(workerPath, 'utf8');
  assert.ok(
    content.includes('catch'),
    'Worker should catch errors to prevent main-thread crash'
  );
  assert.ok(
    content.includes('error'),
    'Worker should return error messages on failure'
  );
});

test('REQ-XW-137: Hook memoizes results', () => {
  const hookPath = resolve(ROOT, 'site/src/hooks/useMilSymWorker.ts');
  const content = readFileSync(hookPath, 'utf8');
  assert.ok(
    content.includes('cacheRef') || content.includes('cache'),
    'Hook should memoize/cache render results'
  );
});

test('REQ-XW-137: MilSymRendererLive falls back to static renderer', () => {
  const componentPath = resolve(ROOT, 'site/src/components/MilSymRendererLive.tsx');
  const content = readFileSync(componentPath, 'utf8');
  assert.ok(
    content.includes('MilSymRenderer'),
    'MilSymRendererLive should fall back to MilSymRenderer'
  );
  assert.ok(
    content.includes('loading') || content.includes('Loading'),
    'MilSymRendererLive should show a loading state'
  );
});
