// rtmx:req REQ-SITE-032
// rtmx:req REQ-SITE-033
// rtmx:req REQ-SITE-034
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteDir = resolve(__dirname, '..', '..', 'site', 'src');

const read = (relativePath) => readFileSync(resolve(siteDir, relativePath), 'utf8');
const mobileBlock = (css) => {
  const start = css.indexOf('@media (max-width: 479px)');
  assert.notEqual(start, -1, 'stylesheet must define a sub-480px breakpoint');
  return css.slice(start);
};

describe('REQ-SITE-032: Icon inspector modal mobile-optimized padding', () => {
  const mobile = mobileBlock(read('pages/Icons.module.css'));

  it('overlay inset tightens to 12px', () => {
    assert.match(mobile, /\.inspectorOverlay \{\s*padding: 12px;/, 'overlay padding must be 12px');
  });

  it('panel header and body padding tighten to 12px', () => {
    assert.match(mobile, /\.inspectorHeader \{\s*padding: 12px;/, 'header padding must be 12px');
    assert.match(mobile, /\.inspectorBody \{\s*padding: 12px;/, 'body padding must be 12px');
  });

  it('panel is allowed more viewport height once padding is reclaimed', () => {
    assert.match(mobile, /\.inspectorPanel \{[^}]*max-height: 90vh/s, 'panel should use up to 90vh');
  });

  it('close control still meets the 44px touch target', () => {
    assert.match(mobile, /\.inspectorClose \{[^}]*min-height: 44px/s, 'close button must stay tappable');
  });
});

describe('REQ-SITE-033: Skittles label width responsive on mobile', () => {
  const css = read('pages/Palettes.module.css');
  const tsx = read('pages/Palettes.tsx');

  it('label width comes from a custom property shared by every row', () => {
    assert.match(css, /\.skittlesPanel \{\s*--skittle-label-w: 100px;/, 'desktop label width must be 100px');
    assert.match(tsx, /const LABEL_W = 'var\(--skittle-label-w\)'/, 'rows must read the custom property');
  });

  it('label width halves to 50px below 480px', () => {
    assert.match(
      mobileBlock(css),
      /\.skittlesPanel \{\s*--skittle-label-w: 50px;/,
      'mobile label width must be 50px'
    );
  });

  it('panel applies the class that scopes the custom property', () => {
    assert.match(tsx, /className=\{styles\.skittlesPanel\}/, 'SkittlesPanel must carry the scoping class');
  });

  it('circle columns keep a fixed pitch so the matrix stays aligned', () => {
    assert.match(tsx, /const COL_W = 34/, 'column pitch must remain fixed');
    assert.match(
      tsx,
      /minWidth: `calc\(\$\{LABEL_W\} \+ \$\{COL_W \* TEAM_COLORS\.length\}px\)`/,
      'header row width must track the responsive label width'
    );
  });
});

describe('REQ-SITE-034: Platforms copy button does not overlap code on mobile', () => {
  const css = read('pages/Platforms.module.css');

  it('button floats over the code on desktop', () => {
    assert.match(css, /\.copyButton \{[^}]*position: absolute/s, 'desktop button stays an overlay');
  });

  it('button leaves the overlay below 480px', () => {
    const mobile = mobileBlock(css);
    assert.match(mobile, /\.copyButton \{[^}]*position: static/s, 'button must rejoin the flow');
    assert.match(mobile, /\.copyButton \{[^}]*width: 100%/s, 'button must span the code block width');
  });

  it('repositioned button meets the 44px touch target', () => {
    assert.match(mobileBlock(css), /\.copyButton \{[^}]*min-height: 44px/s, 'button must stay tappable');
  });
});
