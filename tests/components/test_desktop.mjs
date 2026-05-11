import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const SRC = resolve(ROOT, 'packages', 'react', 'src');
const DIST = resolve(ROOT, 'packages', 'react', 'dist');

// rtmx:req REQ-XW-162
describe('Desktop/browser density variants (REQ-XW-162)', () => {
  let densityCtxSrc;
  let densitySrc;
  let themeProviderSrc;
  let indexSrc;

  before(() => {
    densityCtxSrc = readFileSync(resolve(SRC, 'theme', 'DensityContext.tsx'), 'utf8');
    densitySrc = readFileSync(resolve(SRC, 'tokens', 'density.ts'), 'utf8');
    themeProviderSrc = readFileSync(resolve(SRC, 'theme', 'TakThemeProvider.tsx'), 'utf8');
    indexSrc = readFileSync(resolve(SRC, 'index.ts'), 'utf8');
  });

  // rtmx:req REQ-XW-162
  it('REQ-XW-162: DensityContext exports DensityProvider and useDensity', () => {
    assert.match(densityCtxSrc, /export function DensityProvider/);
    assert.match(densityCtxSrc, /export function useDensity/);
    assert.match(densityCtxSrc, /DensityMode.*'mobile'.*'desktop'/s);
  });

  // rtmx:req REQ-XW-162
  it('REQ-XW-162: density.ts exports mobileDensity and desktopDensity tokens', () => {
    assert.match(densitySrc, /export const mobileDensity/);
    assert.match(densitySrc, /export const desktopDensity/);
    assert.match(densitySrc, /buttonHeight:\s*40/);
    assert.match(densitySrc, /buttonHeight:\s*32/);
    assert.match(densitySrc, /listItemHeight/);
    assert.match(densitySrc, /navButtonSize/);
    assert.match(densitySrc, /fontSize/);
    assert.match(densitySrc, /iconSize/);
  });

  // rtmx:req REQ-XW-162
  it('REQ-XW-162: TakThemeProvider accepts density prop', () => {
    assert.match(themeProviderSrc, /density\?.*DensityMode/);
    assert.match(themeProviderSrc, /data-tak-density/);
    assert.match(themeProviderSrc, /DensityProvider/);
  });

  // rtmx:req REQ-XW-162
  it('REQ-XW-162: index.ts exports density-related items', () => {
    assert.match(indexSrc, /DensityProvider/);
    assert.match(indexSrc, /useDensity/);
    assert.match(indexSrc, /mobileDensity/);
    assert.match(indexSrc, /desktopDensity/);
  });
});
