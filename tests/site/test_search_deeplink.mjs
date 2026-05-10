// rtmx:req REQ-XW-121
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEARCH_INDEX_PATH = resolve(__dirname, '..', '..', 'site', 'src', 'data', 'searchIndex.ts');
const searchIndexSrc = readFileSync(SEARCH_INDEX_PATH, 'utf8');

const HIGHLIGHT_HOOK_PATH = resolve(__dirname, '..', '..', 'site', 'src', 'hooks', 'useHighlight.ts');
const highlightHookSrc = readFileSync(HIGHLIGHT_HOOK_PATH, 'utf8');

describe('REQ-XW-121: Deep linking to leaf nodes', () => {

  it('icon search entries include highlight query param', () => {
    // Icons should link to /icons?highlight=...
    assert.ok(
      searchIndexSrc.includes('/icons?highlight='),
      'Icon entries should use /icons?highlight={name} paths',
    );
  });

  it('intent search entries include tab=intents and highlight query param', () => {
    assert.ok(
      searchIndexSrc.includes('/interfaces?tab=intents&highlight='),
      'Intent entries should use /interfaces?tab=intents&highlight={action} paths',
    );
  });

  it('2525 entity search entries include tab=browse and highlight query param', () => {
    assert.ok(
      searchIndexSrc.includes('/explorer?tab=browse&highlight='),
      '2525 entries should use /explorer?tab=browse&highlight={label} paths',
    );
  });

  it('component search entries include tab and highlight query params', () => {
    assert.ok(
      searchIndexSrc.includes('/components?tab='),
      'Component entries should include tab param',
    );
    assert.ok(
      searchIndexSrc.includes('&highlight='),
      'Component entries should include highlight param',
    );
  });

  it('token search entries include highlight query param', () => {
    assert.ok(
      searchIndexSrc.includes('/colors?highlight='),
      'Token entries should use /colors?highlight={name} paths',
    );
  });

  it('palette entries keep page-level paths without highlight', () => {
    // Palettes should still just link to /palettes (no highlight)
    const paletteSection = searchIndexSrc.split('buildPaletteEntries')[1]?.split('build2525Entries')[0] || '';
    assert.ok(
      paletteSection.includes("path: '/palettes'"),
      'Palette entries should keep plain /palettes path',
    );
    assert.ok(
      !paletteSection.includes('highlight='),
      'Palette entries should NOT include highlight query param',
    );
  });

  it('useHighlight hook exists and reads highlight search param', () => {
    assert.ok(
      highlightHookSrc.includes('useSearchParams'),
      'useHighlight should use useSearchParams',
    );
    assert.ok(
      highlightHookSrc.includes("searchParams.get('highlight')"),
      'useHighlight should read the highlight param',
    );
    assert.ok(
      highlightHookSrc.includes('scrollIntoView'),
      'useHighlight should scroll element into view',
    );
    assert.ok(
      highlightHookSrc.includes('highlight-flash'),
      'useHighlight should add highlight-flash CSS class',
    );
  });

  it('Icons page imports and uses useHighlight', () => {
    const iconsSrc = readFileSync(
      resolve(__dirname, '..', '..', 'site', 'src', 'pages', 'Icons.tsx'),
      'utf8',
    );
    assert.ok(iconsSrc.includes('useHighlight'), 'Icons page should import useHighlight');
    assert.ok(iconsSrc.includes('data-highlight'), 'Icons page should have data-highlight attributes');
  });

  it('Interfaces page imports and uses useHighlight', () => {
    const src = readFileSync(
      resolve(__dirname, '..', '..', 'site', 'src', 'pages', 'Interfaces.tsx'),
      'utf8',
    );
    assert.ok(src.includes('useHighlight'), 'Interfaces page should import useHighlight');
    assert.ok(src.includes('data-highlight'), 'Interfaces page should have data-highlight attributes');
  });

  it('Components page imports and uses useHighlight', () => {
    const src = readFileSync(
      resolve(__dirname, '..', '..', 'site', 'src', 'pages', 'Components.tsx'),
      'utf8',
    );
    assert.ok(src.includes('useHighlight'), 'Components page should import useHighlight');
    assert.ok(src.includes('data-highlight'), 'Components page should have data-highlight attributes');
  });

  it('Explorer page imports and uses useHighlight', () => {
    const src = readFileSync(
      resolve(__dirname, '..', '..', 'site', 'src', 'pages', 'Explorer.tsx'),
      'utf8',
    );
    assert.ok(src.includes('useHighlight'), 'Explorer page should import useHighlight');
    assert.ok(src.includes('data-highlight'), 'Explorer page should have data-highlight attributes');
  });

  it('highlight-flash CSS animation is defined in App.module.css', () => {
    const cssSrc = readFileSync(
      resolve(__dirname, '..', '..', 'site', 'src', 'App.module.css'),
      'utf8',
    );
    assert.ok(cssSrc.includes('.highlight-flash'), 'App.module.css should define .highlight-flash');
    assert.ok(cssSrc.includes('highlightPulse'), 'App.module.css should define highlightPulse keyframes');
    assert.ok(cssSrc.includes('#FFE35E'), 'highlightPulse should use yellow glow color');
  });
});
