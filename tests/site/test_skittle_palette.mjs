// rtmx:req REQ-XW-081
// rtmx:req REQ-XW-082
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const PALETTES_SRC = resolve(ROOT, 'site', 'src', 'pages', 'Palettes.tsx');

const source = readFileSync(PALETTES_SRC, 'utf8');

describe('REQ-XW-081: Skittles circles tab', () => {
  it('has a Skittles tab in PALETTE_TABS', () => {
    assert.ok(
      source.includes("id: 'skittles'"),
      'PALETTE_TABS must contain a skittles tab'
    );
    assert.ok(
      source.includes("label: 'Skittles'"),
      'Skittles tab must have label Skittles'
    );
  });

  it('has a SkittlesPanel component', () => {
    assert.ok(
      source.includes('function SkittlesPanel'),
      'SkittlesPanel component must exist'
    );
  });

  it('renders circles using CSS (not SVG images)', () => {
    // The skittle circles use borderRadius: 50% for the circle shape
    assert.ok(
      source.includes("borderRadius: '50%'"),
      'Skittles must use CSS border-radius for circles'
    );
    assert.ok(
      source.includes("boxShadow: '0 2px 4px rgba(0,0,0,0.5)'"),
      'Skittles must have box-shadow for raised look'
    );
  });

  it('contains role abbreviations TL, HQ, S, M, FO, RTO, K9', () => {
    const abbrs = ['TL', 'HQ', 'FO', 'RTO', 'K9'];
    for (const abbr of abbrs) {
      assert.ok(
        source.includes(`abbr: '${abbr}'`),
        `Skittles must include role abbreviation: ${abbr}`
      );
    }
  });

  it('includes staleness states section', () => {
    assert.ok(
      source.includes('Staleness States'),
      'SkittlesPanel must show staleness states'
    );
    assert.ok(
      source.includes('grayscale'),
      'Expired state must use grayscale filter'
    );
  });

  it('includes affiliation dots', () => {
    assert.ok(
      source.includes('Affiliation'),
      'SkittlesPanel must show affiliation section'
    );
    assert.ok(
      source.includes('Friendly'),
      'Affiliation must include Friendly'
    );
    assert.ok(
      source.includes('Hostile'),
      'Affiliation must include Hostile'
    );
  });

  it('includes GPS source variants section', () => {
    assert.ok(
      source.includes('GPS Source Variants'),
      'SkittlesPanel must include GPS source variants'
    );
  });

  it('skittles tab type routes to SkittlesPanel', () => {
    assert.ok(
      source.includes("active.type === 'skittles'"),
      'Routing must check for skittles type'
    );
    assert.ok(
      source.includes('<SkittlesPanel'),
      'Routing must render SkittlesPanel'
    );
  });

  it('default activeTab is skittles', () => {
    assert.ok(
      source.includes("|| 'skittles'"),
      'Default tab fallback must be skittles'
    );
  });
});

describe('REQ-XW-082: Self Marker tab (renamed from old Skittles)', () => {
  it('has a Self Marker tab in PALETTE_TABS', () => {
    assert.ok(
      source.includes("id: 'self-marker'"),
      'PALETTE_TABS must contain a self-marker tab'
    );
    assert.ok(
      source.includes("label: 'Self Marker'"),
      'Self Marker tab must have label Self Marker'
    );
  });

  it('has a SelfMarkerPanel component', () => {
    assert.ok(
      source.includes('function SelfMarkerPanel'),
      'SelfMarkerPanel component must exist'
    );
  });

  it('self-marker tab type routes to SelfMarkerPanel', () => {
    assert.ok(
      source.includes("active.type === 'self-marker'"),
      'Routing must check for self-marker type'
    );
    assert.ok(
      source.includes('<SelfMarkerPanel'),
      'Routing must render SelfMarkerPanel'
    );
  });

  it('skittles tab appears before self-marker in PALETTE_TABS', () => {
    const skittlesIdx = source.indexOf("id: 'skittles'");
    const selfMarkerIdx = source.indexOf("id: 'self-marker'");
    assert.ok(
      skittlesIdx < selfMarkerIdx,
      'Skittles tab must appear before Self Marker tab'
    );
  });
});
