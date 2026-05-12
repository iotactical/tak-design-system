import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CSS_PATH = resolve(__dirname, '..', '..', 'platforms', 'web', 'generated', 'tak-responsive.css');

// rtmx:req REQ-XW-161
describe('REQ-XW-161: Responsive density tokens', () => {
  it('tak-responsive.css exists', () => {
    assert.ok(existsSync(CSS_PATH), 'tak-responsive.css not found');
  });

  let css;
  it('tak-responsive.css is non-empty', () => {
    css = readFileSync(CSS_PATH, 'utf8');
    assert.ok(css.length > 100, 'CSS file is too short');
  });

  it('has mobile-first ATAK density defaults in :root', () => {
    css = css || readFileSync(CSS_PATH, 'utf8');
    assert.ok(css.includes('--tak-density-button-height: 40px'), 'Missing ATAK button-height default');
    assert.ok(css.includes('--tak-density-list-item-height: 44px'), 'Missing ATAK list-item-height default');
    assert.ok(css.includes('--tak-density-icon-size: 24px'), 'Missing ATAK icon-size default');
    assert.ok(css.includes('--tak-density-touch-target: 44px'), 'Missing ATAK touch-target default');
  });

  it('has WinTAK desktop dimension custom properties', () => {
    css = css || readFileSync(CSS_PATH, 'utf8');
    assert.ok(css.includes('--tak-wintak-density-button-height: 32px'), 'Missing wintak button-height');
    assert.ok(css.includes('--tak-wintak-density-list-item-height: 36px'), 'Missing wintak list-item-height');
    assert.ok(css.includes('--tak-wintak-density-icon-size: 20px'), 'Missing wintak icon-size');
    assert.ok(css.includes('--tak-wintak-layout-toolbar-height: 40px'), 'Missing wintak toolbar-height');
  });

  it('has @media breakpoint at 768px for desktop overrides', () => {
    css = css || readFileSync(CSS_PATH, 'utf8');
    assert.ok(css.includes('@media (min-width: 768px)'), 'Missing desktop breakpoint');
  });

  it('desktop breakpoint remaps semantic vars to wintak sources', () => {
    css = css || readFileSync(CSS_PATH, 'utf8');
    const mediaBlock = css.split('@media (min-width: 768px)')[1];
    assert.ok(mediaBlock, 'No content after @media breakpoint');
    assert.ok(mediaBlock.includes('--tak-density-button-height: var(--tak-wintak-density-button-height)'), 'Missing button-height remap');
    assert.ok(mediaBlock.includes('--tak-density-icon-size: var(--tak-wintak-density-icon-size)'), 'Missing icon-size remap');
    assert.ok(mediaBlock.includes('--tak-density-toolbar-height: var(--tak-wintak-layout-toolbar-height)'), 'Missing toolbar-height remap');
  });

  it('includes WinTAK spacing tokens', () => {
    css = css || readFileSync(CSS_PATH, 'utf8');
    assert.ok(css.includes('--tak-wintak-spacing-card-padding'), 'Missing wintak spacing tokens');
    assert.ok(css.includes('--tak-wintak-spacing-inline-gap'), 'Missing wintak inline-gap');
  });

  it('includes WinTAK typography tokens', () => {
    css = css || readFileSync(CSS_PATH, 'utf8');
    assert.ok(css.includes('--tak-wintak-typography-base: 13px'), 'Missing wintak typography base');
    assert.ok(css.includes('--tak-wintak-typography-sm: 11px'), 'Missing wintak typography sm');
  });
});
