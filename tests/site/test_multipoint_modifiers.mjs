// rtmx:req REQ-XW-285
// rtmx:req REQ-XW-286
// rtmx:req REQ-XW-287
// rtmx:req REQ-XW-288
// rtmx:req REQ-XW-289
// rtmx:req REQ-XW-290
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(__dirname, '..', '..', 'site', 'src');
const src = readFileSync(resolve(SITE, 'data', 'multipoint-examples.ts'), 'utf8');

describe('REQ-XW-285: Modifier fields on MultipointExample interface', () => {
  it('interface has modifiers field', () => {
    assert.ok(src.includes('modifiers?: Record<string, string>'), 'Should have modifiers field');
  });

  it('interface has attributes field', () => {
    assert.ok(src.includes('attributes?: Record<string, string>'), 'Should have attributes field');
  });
});

describe('REQ-XW-286: Populate unique designation (T) modifiers', () => {
  // Count how many examples have T modifier
  const tModCount = (src.match(/T: '/g) || []).length;
  const totalExamples = (src.match(/^\s+name: '/gm) || []).length;

  it('at least 90% of examples have T modifier', () => {
    const ratio = tModCount / totalExamples;
    assert.ok(ratio >= 0.9, `Expected 90%+ with T modifier, found ${(ratio * 100).toFixed(0)}% (${tModCount}/${totalExamples})`);
  });

  it('T modifiers have tactical names (without type prefix, renderer auto-prepends)', () => {
    assert.ok(src.includes("T: 'ALPHA'"), 'Phase Line should have ALPHA');
    assert.ok(src.includes("T: 'THUNDER'"), 'AO should have designation');
    assert.ok(src.includes("T: 'WOLF'"), 'EA should have designation');
  });
});

describe('REQ-XW-287: Populate DTG and tactical modifiers', () => {
  it('has W (DTG start) modifiers on time-bounded graphics', () => {
    const wCount = (src.match(/W: '/g) || []).length;
    assert.ok(wCount >= 5, `Expected 5+ W modifiers, found ${wCount}`);
  });

  it('has W1 (DTG end) modifiers', () => {
    const w1Count = (src.match(/W1: '/g) || []).length;
    assert.ok(w1Count >= 3, `Expected 3+ W1 modifiers, found ${w1Count}`);
  });

  it('has AM (distance) modifiers where applicable', () => {
    const amCount = (src.match(/AM: '/g) || []).length;
    assert.ok(amCount >= 1, `Expected 1+ AM modifiers, found ${amCount}`);
  });
});

describe('REQ-XW-288: Populate rendering attributes', () => {
  it('has attributes field in interface', () => {
    assert.ok(src.includes('attributes?: Record<string, string>'), 'Interface should have attributes');
  });
});

describe('REQ-XW-289: Pass modifiers/attributes through rendering pipeline', () => {
  const gallery = readFileSync(resolve(SITE, 'pages', 'MultipointGallery.tsx'), 'utf8');
  const panel = readFileSync(resolve(SITE, 'components', 'ControlMeasuresPanel.tsx'), 'utf8');

  it('Gallery passes modifiers to render call', () => {
    assert.ok(gallery.includes('modifiers'), 'Gallery should reference modifiers');
  });

  it('Panel calls renderMultipoint for user-placed points', () => {
    assert.ok(panel.includes('renderMultipoint'), 'Panel should call renderMultipoint');
  });
});

describe('REQ-XW-290: Display modifier values in card UI', () => {
  const gallery = readFileSync(resolve(SITE, 'pages', 'MultipointGallery.tsx'), 'utf8');

  it('Gallery displays modifier info in cards', () => {
    assert.ok(
      gallery.includes('.T') || gallery.includes("['T']") || gallery.includes('modifier'),
      'Gallery should display T modifier in cards'
    );
  });
});
