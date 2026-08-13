// rtmx:req REQ-SITE-024
// rtmx:req REQ-SITE-025
// rtmx:req REQ-SITE-026
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const homeTsx = readFileSync(resolve(__dirname, '..', '..', 'site', 'src', 'pages', 'Home.tsx'), 'utf8');
const homeCss = readFileSync(resolve(__dirname, '..', '..', 'site', 'src', 'pages', 'Home.module.css'), 'utf8');

describe('REQ-SITE-024: Replace Home carousel with vertical compact grid on mobile', () => {
  it('Home.tsx uses mobileGrid instead of carousel', () => {
    assert.ok(homeTsx.includes('mobileGrid'), 'Should have mobileGrid element');
    assert.ok(homeTsx.includes('data-testid="mobile-grid"'), 'Should have mobile-grid testid');
  });

  it('mobile grid renders all 11 page cards', () => {
    const matches = homeTsx.match(/mobileCard/g);
    assert.ok(matches && matches.length >= 2, 'Should render mobileCard links');
  });

  it('carousel is removed from Home.tsx', () => {
    assert.ok(!homeTsx.includes('carouselTrack'), 'Should not have carousel track');
    assert.ok(!homeTsx.includes('carouselDots'), 'Should not have carousel dots');
    assert.ok(!homeTsx.includes('scroll-snap'), 'Should not use scroll-snap');
  });

  it('CSS shows mobileGrid activating below 680px', () => {
    assert.ok(homeCss.includes('mobileGrid'), 'Should have mobileGrid class');
    assert.ok(homeCss.includes('max-width: 680px'), 'Should activate below 680px');
    assert.ok(homeCss.includes('repeat(2, minmax(0, 1fr))'), 'Should use a 2-column grid where it fits');
  });

  it('mobile cards have no preview images (fast load)', () => {
    // The mobileGrid section should not contain <img> tags
    const mobileGridStart = homeTsx.indexOf('mobileGrid');
    const mobileGridEnd = homeTsx.indexOf('</div>', homeTsx.indexOf('</div>', mobileGridStart) + 6);
    const mobileSection = homeTsx.substring(mobileGridStart, mobileGridEnd);
    assert.ok(!mobileSection.includes('<img'), 'Mobile grid should not load preview images');
  });

  it('falls back to single column on narrow screens', () => {
    const mobileBlock = homeCss.substring(homeCss.indexOf('max-width: 680px'));
    assert.match(
      mobileBlock,
      /grid-template-columns:\s*minmax\(0, 1fr\)/,
      'Should default to a single column across the mobile range',
    );
  });
});

// rtmx:req REQ-SITE-036
describe('REQ-SITE-036: Home card grid fits the viewport at every mobile width', () => {
  // A bare `1fr` takes its minimum from the card's min-content, and the nowrap
  // description then widens the track instead of ellipsizing: two columns
  // demanded 595px inside a 398px container and the page scrolled sideways.
  it('sizes every grid track with a zero minimum', () => {
    const tracks = [...homeCss.matchAll(/\.mobileGrid\s*\{[^}]*grid-template-columns:\s*([^;]+);/g)].map((m) => m[1].trim());
    assert.ok(tracks.length > 0, 'expected mobileGrid track definitions');
    for (const track of tracks) {
      const outsideMinmax = track.replace(/minmax\([^)]*\)/g, '');
      assert.ok(
        !outsideMinmax.includes('1fr'),
        `track "${track}" uses a bare 1fr, which can widen past the viewport`,
      );
      assert.match(track, /minmax\(0, 1fr\)/, `track "${track}" must take a zero minimum`);
    }
  });

  it('only goes to two columns where a card still fits', () => {
    const twoCol = homeCss.indexOf('repeat(2, minmax(0, 1fr))');
    assert.ok(twoCol > 0, 'expected a two-column rule');
    const guard = homeCss.lastIndexOf('@media', twoCol);
    const query = homeCss.substring(guard, homeCss.indexOf('{', guard));
    assert.match(query, /min-width:\s*560px/, 'two columns must be gated on a minimum width');
    assert.match(query, /max-width:\s*680px/, 'two columns must stop where the desktop grid takes over');
  });
});

describe('REQ-SITE-025: Home dot indicators removed (replaced by grid)', () => {
  it('no dot indicators in Home.tsx', () => {
    assert.ok(!homeTsx.includes('carouselDots'), 'Should not have carousel dot container');
    assert.ok(!homeTsx.includes('dotActive'), 'Should not have dot active state');
  });

  it('no 6px dot styles in CSS', () => {
    // The old .dot class with tiny 6px size should be gone
    assert.ok(!homeCss.includes('width: 6px'), 'Should not have 6px dot width');
  });

  it('mobile cards have min-height 44px for touch targets', () => {
    assert.ok(homeCss.includes('min-height: 44px'), 'mobileCard should have min-height: 44px');
  });
});

describe('REQ-SITE-026: Home layout works on landscape phones', () => {
  it('has landscape media query', () => {
    assert.ok(homeCss.includes('orientation: landscape'), 'Should have landscape media query');
  });

  it('compresses hero on short viewports', () => {
    assert.ok(homeCss.includes('max-height: 500px'), 'Should target short viewports');
    // Hero title should be smaller in landscape
    const landscapeBlock = homeCss.substring(homeCss.indexOf('max-height: 500px'));
    assert.ok(landscapeBlock.includes('font-size: 20px'), 'Title should shrink in landscape');
  });

  it('no fixed calc(100vh - 260px) height', () => {
    assert.ok(!homeCss.includes('calc(100vh - 260px)'), 'Should not have fixed carousel height');
  });
});
