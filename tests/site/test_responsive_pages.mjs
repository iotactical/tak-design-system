// rtmx:req REQ-XW-268
// rtmx:req REQ-XW-269
// rtmx:req REQ-XW-270
// rtmx:req REQ-XW-271
// rtmx:req REQ-XW-272
// rtmx:req REQ-XW-273
// rtmx:req REQ-XW-274
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PAGES = resolve(__dirname, '..', '..', 'site', 'src', 'pages');

function readPage(name) {
  return readFileSync(resolve(PAGES, name), 'utf8');
}

function hasMobileQuery(css) {
  return css.includes('max-width: 767px');
}

describe('REQ-XW-268: Home page responsive grids', () => {
  const css = readPage('Home.module.css');

  it('has mobile media query', () => {
    assert.ok(css.includes('max-width: 680px') || hasMobileQuery(css), 'Home.module.css should have mobile media query');
  });

  it('cardGrid adjusts for smaller viewports', () => {
    assert.ok(css.includes('cardGrid'), 'Should have cardGrid class');
    assert.ok(css.includes('@media'), 'Should have media queries');
  });

  it('has carousel for mobile navigation', () => {
    assert.ok(css.includes('carousel'), 'Should have carousel class for mobile');
  });

  it('has responsive breakpoints for card grid', () => {
    assert.ok(css.includes('max-width: 1100px') || css.includes('max-width: 860px'), 'Should have tablet breakpoints');
    assert.ok(css.includes('max-width: 680px') || hasMobileQuery(css), 'Should have mobile breakpoint');
  });
});

describe('REQ-XW-269: Components page responsive grid', () => {
  const css = readPage('Components.module.css');

  it('has mobile media query', () => {
    assert.ok(hasMobileQuery(css), 'Components.module.css should have mobile media query');
  });

  it('grid stacks to single column on mobile', () => {
    const mobileBlock = css.split('max-width: 767px')[1];
    assert.ok(mobileBlock.includes('.grid'), 'Should adjust grid on mobile');
    assert.ok(mobileBlock.includes('1fr'), 'Grid should be single column on mobile');
  });
});

describe('REQ-XW-270: Explorer page responsive layout', () => {
  const css = readPage('Explorer.module.css');

  it('has mobile media query', () => {
    assert.ok(hasMobileQuery(css), 'Explorer.module.css should have mobile media query');
  });

  it('browseLayout becomes column on mobile', () => {
    const mobileBlock = css.split('max-width: 767px')[1];
    assert.ok(mobileBlock.includes('flex-direction: column') || mobileBlock.includes('flex-direction:column'), 'browseLayout should be column on mobile');
  });

  it('symbolSetList becomes full-width on mobile', () => {
    const mobileBlock = css.split('max-width: 767px')[1];
    assert.ok(mobileBlock.includes('symbolSetList'), 'Should adjust symbolSetList on mobile');
    assert.ok(mobileBlock.includes('width: 100%') || mobileBlock.includes('width:100%'), 'symbolSetList should be full-width on mobile');
  });

  it('inspectorPanel becomes full-width on mobile', () => {
    const mobileBlock = css.split('max-width: 767px')[1];
    assert.ok(mobileBlock.includes('inspectorPanel'), 'Should adjust inspectorPanel on mobile');
  });

  it('search inputs become full-width on mobile', () => {
    const mobileBlock = css.split('max-width: 767px')[1];
    assert.ok(mobileBlock.includes('max-width: 100%') || mobileBlock.includes('max-width:100%'), 'Search inputs should be full-width on mobile');
  });
});

describe('REQ-XW-271: Palettes page responsive grids', () => {
  const css = readPage('Palettes.module.css');

  it('has mobile media query', () => {
    assert.ok(hasMobileQuery(css), 'Palettes.module.css should have mobile media query');
  });

  it('grids adjust for mobile', () => {
    const mobileBlock = css.split('max-width: 767px')[1];
    assert.ok(mobileBlock.includes('.grid'), 'Should adjust grid on mobile');
  });
});

describe('REQ-XW-272: Interfaces and Platforms pages responsive', () => {
  it('Interfaces.module.css has mobile media query', () => {
    const css = readPage('Interfaces.module.css');
    assert.ok(hasMobileQuery(css), 'Interfaces.module.css should have mobile media query');
    const mobileBlock = css.split('max-width: 767px')[1];
    assert.ok(mobileBlock.includes('.grid'), 'Should adjust grid on mobile');
  });

  it('Platforms.module.css has mobile media query', () => {
    const css = readPage('Platforms.module.css');
    assert.ok(hasMobileQuery(css), 'Platforms.module.css should have mobile media query');
    const mobileBlock = css.split('max-width: 767px')[1];
    assert.ok(mobileBlock.includes('.grid'), 'Should adjust grid on mobile');
  });

  it('Platforms code blocks scroll horizontally', () => {
    const css = readPage('Platforms.module.css');
    const mobileBlock = css.split('max-width: 767px')[1];
    assert.ok(mobileBlock.includes('overflow-x'), 'Code blocks should scroll on mobile');
  });
});

describe('REQ-XW-273: Icons page responsive grid', () => {
  const css = readPage('Icons.module.css');

  it('has mobile media query', () => {
    assert.ok(hasMobileQuery(css), 'Icons.module.css should have mobile media query');
  });

  it('grid adjusts for mobile', () => {
    const mobileBlock = css.split('max-width: 767px')[1];
    assert.ok(mobileBlock.includes('.grid'), 'Should adjust grid on mobile');
  });

  it('search input becomes full-width on mobile', () => {
    const mobileBlock = css.split('max-width: 767px')[1];
    assert.ok(mobileBlock.includes('max-width: 100%') || mobileBlock.includes('max-width:100%'), 'searchInput should be full-width on mobile');
  });
});

describe('REQ-XW-274: Multi-point Gallery responsive grid', () => {
  const css = readPage('MultipointGallery.module.css');

  it('has mobile media query', () => {
    assert.ok(hasMobileQuery(css), 'MultipointGallery.module.css should have mobile media query');
  });

  it('grid stacks to single column on mobile', () => {
    const mobileBlock = css.split('max-width: 767px')[1];
    assert.ok(mobileBlock.includes('.grid'), 'Should adjust grid on mobile');
    assert.ok(mobileBlock.includes('1fr'), 'Grid should be single column on mobile');
  });

  it('card map height reduced on mobile', () => {
    const mobileBlock = css.split('max-width: 767px')[1];
    assert.ok(mobileBlock.includes('cardMap'), 'Should adjust cardMap height on mobile');
  });
});
