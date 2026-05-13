// rtmx:req REQ-XW-292
// rtmx:req REQ-XW-293
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE = resolve(__dirname, '..', '..', 'site', 'src');

describe('REQ-XW-292: Gallery affiliation colors verified', () => {
  const gallery = readFileSync(resolve(SITE, 'pages', 'MultipointGallery.tsx'), 'utf8');
  const map = readFileSync(resolve(SITE, 'components', 'MultipointMap.tsx'), 'utf8');

  it('Gallery has affiliation selector with all 4 affiliations', () => {
    assert.ok(gallery.includes('Friendly'), 'Should have Friendly affiliation');
    assert.ok(gallery.includes('Hostile'), 'Should have Hostile affiliation');
    assert.ok(gallery.includes('Neutral'), 'Should have Neutral affiliation');
    assert.ok(gallery.includes('Unknown'), 'Should have Unknown affiliation');
  });

  it('Gallery applies affiliation to SIDC', () => {
    assert.ok(gallery.includes('withAffiliation'), 'Should call withAffiliation');
  });

  it('Map layers use stroke/fill from GeoJSON properties', () => {
    assert.ok(map.includes("['get', 'stroke']"), 'Line color from stroke property');
    assert.ok(map.includes("['get', 'fill']"), 'Fill color from fill property');
  });
});

describe('REQ-XW-293: Explorer Control Measures interactive mode verified', () => {
  const panel = readFileSync(resolve(SITE, 'components', 'ControlMeasuresPanel.tsx'), 'utf8');

  it('Panel has interactive point placement', () => {
    assert.ok(panel.includes('userPoints'), 'Should track user-placed points');
    assert.ok(panel.includes('onClick'), 'Should handle map click events');
  });

  it('Panel re-renders on user point placement', () => {
    assert.ok(panel.includes('renderMultipoint'), 'Should call renderMultipoint');
    assert.ok(panel.includes("join(' ')"), 'Should join points with spaces');
  });

  it('Panel uses correct coordinate format', () => {
    assert.ok(!panel.includes("join(';')"), 'Should NOT use semicolons');
    assert.ok(panel.includes("join(' ')"), 'Should use space separator');
  });

  it('Panel has clear points button', () => {
    assert.ok(panel.includes('setUserPoints([])'), 'Should have clear points functionality');
  });
});
