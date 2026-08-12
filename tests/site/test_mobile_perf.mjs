// rtmx:req REQ-SITE-029
// rtmx:req REQ-SITE-030
// rtmx:req REQ-SITE-031
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteDir = resolve(__dirname, '..', '..', 'site', 'src');

const read = (relativePath) => readFileSync(resolve(siteDir, relativePath), 'utf8');

describe('REQ-SITE-029: Virtualize Icons grid with IntersectionObserver', () => {
  const hook = read('hooks/useInView.ts');
  const icons = read('pages/Icons.tsx');

  it('shared useInView hook drives visibility from IntersectionObserver', () => {
    assert.match(hook, /new IntersectionObserver/, 'hook must use IntersectionObserver');
    assert.match(hook, /export function useInView/, 'hook must be exported for reuse');
  });

  it('hook can release offscreen content instead of latching on first view', () => {
    assert.match(hook, /once/, 'hook must expose a once option');
    assert.match(hook, /setInView\(false\)/, 'default mode must report elements leaving the viewport');
  });

  it('hook degrades to rendering everything without IntersectionObserver', () => {
    assert.match(
      hook,
      /typeof IntersectionObserver === 'undefined'/,
      'hook must fall back when IntersectionObserver is unavailable'
    );
  });

  it('Icons page mounts card previews lazily', () => {
    assert.match(icons, /import \{ useInView \}/, 'Icons must use the shared hook');
    assert.match(icons, /function LazyCardPreview/, 'Icons must wrap previews in a lazy component');
    assert.match(icons, /inView \? <CardPreview/, 'preview must be conditional on visibility');
  });

  it('Icons page no longer renders every preview eagerly', () => {
    assert.ok(
      !/<div className=\{styles\.cardPreview\}>\s*<CardPreview/.test(icons),
      'card previews must not be rendered unconditionally'
    );
  });

  it('preview placeholder keeps a fixed height so the grid does not reflow', () => {
    const css = read('pages/Icons.module.css');
    assert.match(css, /\.cardPreview \{[^}]*height: 80px/s, 'cardPreview must have a fixed height');
  });

  it('duplicate local useInView implementations are removed', () => {
    const gallery = read('pages/MultipointGallery.tsx');
    assert.ok(
      !gallery.includes('function useInView'),
      'MultipointGallery must import the shared hook rather than redefining it'
    );
    assert.match(gallery, /import \{ useInView \}/, 'MultipointGallery must import the shared hook');
  });
});

describe('REQ-SITE-030: Typography and Spacing tables responsive on narrow screens', () => {
  const typographyCss = read('pages/Typography.module.css');
  const spacingCss = read('pages/Spacing.module.css');

  it('Typography table drops its min-width below 480px', () => {
    assert.match(typographyCss, /@media \(max-width: 479px\)/, 'needs a sub-480px breakpoint');
    const mobile = typographyCss.slice(typographyCss.indexOf('@media (max-width: 479px)'));
    assert.match(mobile, /min-width: 0/, 'table min-width must be released on narrow screens');
    assert.match(mobile, /overflow-x: visible/, 'wrapper must stop scrolling sideways');
  });

  it('Typography table reflows rather than being restructured', () => {
    const mobile = typographyCss.slice(typographyCss.indexOf('@media (max-width: 479px)'));
    assert.match(mobile, /padding: 8px 6px/, 'cell padding must shrink to help the table fit');
    assert.match(mobile, /overflow-wrap: anywhere/, 'preview text must be allowed to wrap');
    // Keeping real table semantics matters for the a11y requirements.
    assert.ok(!/display: grid/.test(mobile), 'rows must stay table rows for assistive technology');
    assert.ok(!/thead/.test(mobile), 'column headers must remain available to screen readers');
  });

  it('Spacing scale releases its min-width and label width below 480px', () => {
    assert.match(spacingCss, /@media \(max-width: 479px\)/, 'needs a sub-480px breakpoint');
    const mobile = spacingCss.slice(spacingCss.indexOf('@media (max-width: 479px)'));
    assert.match(mobile, /min-width: 0/, 'scale container min-width must be released');
    assert.match(mobile, /overflow-x: visible/, 'wrapper must stop scrolling sideways');
  });

  it('Spacing bars can shrink to the available width', () => {
    const mobile = spacingCss.slice(spacingCss.indexOf('@media (max-width: 479px)'));
    assert.match(mobile, /flex-shrink: 1/, 'bars must shrink rather than overflow');
  });

  it('both pages use CSS modules so breakpoints are expressible', () => {
    assert.match(read('pages/Typography.tsx'), /from '\.\/Typography\.module\.css'/);
    assert.match(read('pages/Spacing.tsx'), /from '\.\/Spacing\.module\.css'/);
  });
});

describe('REQ-SITE-031: Interfaces intent table scrollable on mobile', () => {
  const css = read('pages/Interfaces.module.css');
  const tsx = read('pages/Interfaces.tsx');

  it('intent table is wrapped in a scroll container', () => {
    assert.match(tsx, /className=\{styles\.intentTableWrap\}/, 'table must be wrapped');
    assert.match(tsx, /className=\{styles\.intentTable\}/, 'table must use the module class');
  });

  it('wrapper sets overflow-x auto on mobile', () => {
    const mobile = css.slice(css.indexOf('@media (max-width: 767px)'));
    assert.match(mobile, /\.intentTableWrap \{\s*overflow-x: auto;/, 'wrapper must scroll horizontally');
  });

  it('table keeps a legible minimum width while scrolling', () => {
    const mobile = css.slice(css.indexOf('@media (max-width: 767px)'));
    assert.match(mobile, /\.intentTable \{\s*min-width: \d{3}px/, 'table must keep a minimum width');
  });

  it('momentum scrolling is enabled for touch', () => {
    assert.match(css, /-webkit-overflow-scrolling: touch/, 'wrapper needs touch momentum scrolling');
  });

  it('sticky header is disabled where it would pin to the scroll wrapper', () => {
    const mobile = css.slice(css.indexOf('@media (max-width: 767px)'));
    assert.match(mobile, /\.intentTableHead \{[^}]*position: static/s, 'sticky header must be released on mobile');
  });
});
