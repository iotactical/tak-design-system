// rtmx:req REQ-XW-277
// rtmx:req REQ-XW-278
// rtmx:req REQ-XW-279
// rtmx:req REQ-XW-280
// rtmx:req REQ-XW-281
// rtmx:req REQ-XW-282
// rtmx:req REQ-XW-283
// rtmx:req REQ-XW-284
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = resolve(__dirname, '..', '..', 'site', 'src', 'data');
const src = readFileSync(resolve(DATA, 'multipoint-examples.ts'), 'utf8');

// Count examples by looking for objects with name: field inside the array
const nameMatches = src.match(/^\s+name: '/gm);
const totalExamples = nameMatches ? nameMatches.length : 0;

describe('REQ-XW-284: Example coverage threshold (60+ total)', () => {
  it('has at least 60 total examples', () => {
    assert.ok(totalExamples >= 60, `Expected 60+ examples, found ${totalExamples}`);
  });

  it('has line category examples', () => {
    const count = (src.match(/category: 'line'/g) || []).length;
    assert.ok(count >= 10, `Expected 10+ line examples, found ${count}`);
  });

  it('has area category examples', () => {
    const count = (src.match(/category: 'area'/g) || []).length;
    assert.ok(count >= 15, `Expected 15+ area examples, found ${count}`);
  });

  it('has arrow category examples', () => {
    const count = (src.match(/category: 'arrow'/g) || []).length;
    assert.ok(count >= 3, `Expected 3+ arrow examples, found ${count}`);
  });
});

describe('REQ-XW-277: Fire Support control measure examples', () => {
  it('has FEBA example', () => {
    assert.ok(src.includes("name: 'Forward Edge of Battle Area"), 'Should have FEBA');
  });

  it('has Final Coordination Line', () => {
    assert.ok(src.includes("name: 'Final Coordination Line"), 'Should have FCL');
  });

  it('has fire support area examples', () => {
    assert.ok(src.includes("name: 'Kill Box"), 'Should have Kill Box');
    assert.ok(src.includes("name: 'Free Fire Area"), 'Should have Free Fire Area');
  });

  it('has at least 8 fire support examples', () => {
    const fireSection = src.split('=== FIRE SUPPORT')[1]?.split('=== ')[0] || '';
    const count = (fireSection.match(/name: '/g) || []).length;
    assert.ok(count >= 8, `Expected 8+ fire support examples, found ${count}`);
  });
});

describe('REQ-XW-278: Maneuver control measure examples', () => {
  it('has Axis of Advance variants', () => {
    assert.ok(src.includes("name: 'Axis of Advance"), 'Should have Axis of Advance');
  });

  it('has Assembly Area', () => {
    assert.ok(src.includes("name: 'Assembly Area"), 'Should have Assembly Area');
  });

  it('has Objective', () => {
    assert.ok(src.includes("name: 'Objective"), 'Should have Objective');
  });

  it('has at least 10 maneuver examples', () => {
    const manSection = src.split('=== MANEUVER')[1]?.split('=== ')[0] || '';
    const count = (manSection.match(/name: '/g) || []).length;
    assert.ok(count >= 10, `Expected 10+ maneuver examples, found ${count}`);
  });
});

describe('REQ-XW-279: Obstacle and barrier examples', () => {
  it('has minefield example', () => {
    assert.ok(src.includes('Minefield') || src.includes('Mine'), 'Should have mine/minefield');
  });

  it('has wire obstacle', () => {
    assert.ok(src.includes('Wire'), 'Should have wire obstacle');
  });

  it('has at least 8 obstacle examples', () => {
    const obsSection = src.split('=== OBSTACLE')[1]?.split('=== ')[0] || '';
    const count = (obsSection.match(/name: '/g) || []).length;
    assert.ok(count >= 8, `Expected 8+ obstacle examples, found ${count}`);
  });
});

describe('REQ-XW-280: CBRN and hazard area examples', () => {
  it('has contaminated area', () => {
    assert.ok(src.includes('Contaminated') || src.includes('CBRN') || src.includes('Chemical'), 'Should have contamination example');
  });

  it('has at least 6 CBRN examples', () => {
    const cbrnSection = src.split('=== CBRN')[1]?.split('=== ')[0] || '';
    const count = (cbrnSection.match(/name: '/g) || []).length;
    assert.ok(count >= 6, `Expected 6+ CBRN examples, found ${count}`);
  });
});

describe('REQ-XW-281: Airspace coordination examples', () => {
  it('has ROZ example', () => {
    assert.ok(src.includes('Restricted Operations Zone') || src.includes('ROZ'), 'Should have ROZ');
  });

  it('has at least 6 airspace examples', () => {
    const airSection = src.split('=== AIRSPACE')[1]?.split('=== ')[0] || '';
    const count = (airSection.match(/name: '/g) || []).length;
    assert.ok(count >= 6, `Expected 6+ airspace examples, found ${count}`);
  });
});

describe('REQ-XW-282: Target and engagement examples', () => {
  it('has Target Area of Interest', () => {
    assert.ok(src.includes('Target Area of Interest') || src.includes('TAI'), 'Should have TAI');
  });

  it('has at least 8 target examples', () => {
    const tgtSection = src.split('=== TARGETS')[1]?.split('=== ')[0] || '';
    const count = (tgtSection.match(/name: '/g) || []).length;
    assert.ok(count >= 8, `Expected 8+ target examples, found ${count}`);
  });
});

describe('REQ-XW-283: Logistics and CSS examples', () => {
  it('has MSR or ASR', () => {
    assert.ok(src.includes('Main Supply Route') || src.includes('MSR') || src.includes('Alternate Supply Route') || src.includes('ASR'), 'Should have supply route');
  });

  it('has at least 6 logistics examples', () => {
    const logSection = src.split('=== LOGISTICS')[1]?.split('=== ')[0] || '';
    const count = (logSection.match(/name: '/g) || []).length;
    assert.ok(count >= 6, `Expected 6+ logistics examples, found ${count}`);
  });
});
