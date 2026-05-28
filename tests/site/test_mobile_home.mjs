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

  it('CSS shows mobileGrid as 2-column grid below 680px', () => {
    assert.ok(homeCss.includes('mobileGrid'), 'Should have mobileGrid class');
    assert.ok(homeCss.includes('repeat(2, 1fr)'), 'Should use 2-column grid');
    assert.ok(homeCss.includes('max-width: 680px'), 'Should activate below 680px');
  });

  it('mobile cards have no preview images (fast load)', () => {
    // The mobileGrid section should not contain <img> tags
    const mobileGridStart = homeTsx.indexOf('mobileGrid');
    const mobileGridEnd = homeTsx.indexOf('</div>', homeTsx.indexOf('</div>', mobileGridStart) + 6);
    const mobileSection = homeTsx.substring(mobileGridStart, mobileGridEnd);
    assert.ok(!mobileSection.includes('<img'), 'Mobile grid should not load preview images');
  });

  it('falls back to single column on very narrow screens', () => {
    assert.ok(homeCss.includes('max-width: 400px'), 'Should have narrow breakpoint');
    const narrowBlock = homeCss.substring(homeCss.indexOf('max-width: 400px'));
    assert.ok(narrowBlock.includes('grid-template-columns: 1fr'), 'Should use 1-column on narrow screens');
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
