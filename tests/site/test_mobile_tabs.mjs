// rtmx:req REQ-XW-294
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PAGES = resolve(__dirname, '..', '..', 'site', 'src', 'pages');

const pages = [
  'Explorer.module.css',
  'Palettes.module.css',
  'Components.module.css',
  'Interfaces.module.css',
  'Platforms.module.css',
];

describe('REQ-XW-294: Second-tier tabs mobile responsive', () => {
  for (const file of pages) {
    const css = readFileSync(resolve(PAGES, file), 'utf8');

    it(`${file} has mobile breakpoint`, () => {
      assert.ok(css.includes('@media (max-width: 767px)'), `${file} should have mobile breakpoint`);
    });

    it(`${file} has mobile tab bar overflow handling`, () => {
      const mobileBlock = css.split('@media (max-width: 767px)')[1] || '';
      assert.ok(
        mobileBlock.includes('overflow-x') || mobileBlock.includes('overflow-x: auto'),
        `${file} should have overflow-x on tab bar in mobile media query`
      );
    });

    it(`${file} has mobile tab size reduction`, () => {
      const mobileBlock = css.split('@media (max-width: 767px)')[1] || '';
      assert.ok(
        mobileBlock.includes('.tab'),
        `${file} should have .tab adjustments in mobile media query`
      );
    });
  }
});
