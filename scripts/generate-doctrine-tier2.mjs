#!/usr/bin/env node
/**
 * Generate Tier 2 doctrine definitions for SS25 entities missing from
 * ss25-control-measures.json. Derives definitions from b2d.json labels
 * and MIL-STD-2525 entity categorization.
 *
 * Usage: node scripts/generate-doctrine-tier2.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const doctrine = JSON.parse(readFileSync(join(root, 'data/mil-std-2525/doctrine/ss25-control-measures.json'), 'utf8'));
const existingCodes = new Set(doctrine.entities.map(e => e.entityCode));

const b2dRaw = JSON.parse(readFileSync(join(root, 'data/mil-std-2525/b2d.json'), 'utf8'));
const entries = Array.isArray(b2dRaw) ? b2dRaw : (b2dRaw.mappings || []);
const ss25 = entries.filter(e => e.d_ss === '25');

// Geometry type inference from B SIDC pattern
// G*G*GL = line, G*G*GA = area, G*G*GP = point, G*F* = fire support
function inferGeometry(bSidc, label) {
  if (!bSidc) return 'point';
  const fn = bSidc.substring(0, 6).toUpperCase();
  // Lines
  if (fn.includes('GL') || fn.includes('GDL') || fn.includes('GOL') || fn.includes('GSL')) return 'line';
  // Areas
  if (fn.includes('GA') || fn.includes('GDA') || fn.includes('GOA') || fn.includes('GSA') || fn.includes('GPA')) return 'area';
  // Arrows / maneuver
  if (fn.includes('GOE') || fn.includes('GDE') || fn.includes('GOG')) return 'arrow';
  // Fire support areas
  if (fn.includes('GFA') || bSidc.startsWith('G*F*A')) return 'area';
  if (fn.includes('GFL') || bSidc.startsWith('G*F*L')) return 'line';
  if (fn.includes('GFP') || bSidc.startsWith('G*F*P')) return 'point';
  // Obstacle areas
  if (label.toLowerCase().includes('minefield') || label.toLowerCase().includes('mined area')) return 'area';
  if (label.toLowerCase().includes('belt') || label.toLowerCase().includes('zone')) return 'area';
  if (label.toLowerCase().includes('route') || label.toLowerCase().includes('corridor') || label.toLowerCase().includes('lane')) return 'line';
  return 'point';
}

// Risk level by entity prefix category
function inferRiskLevel(code, label, geometry) {
  const prefix = code.substring(0, 2);
  const lbl = label.toLowerCase();
  // Fire support (24xxxx, 26xxxx) = high/critical
  if (prefix === '24' || prefix === '26') {
    if (lbl.includes('nuclear') || lbl.includes('chemical') || lbl.includes('biological')) return 'critical';
    return 'high';
  }
  // Obstacles and mines (27xxxx, 28xxxx) = high
  if (prefix === '27' || prefix === '28') return 'high';
  // Maneuver tasks (34xxxx) = medium-high
  if (prefix === '34') return 'medium';
  // Boundaries, FLOT, LOC (11xxxx, 14xxxx) = high
  if (prefix === '11' || prefix === '14') return 'high';
  // Assembly areas, supply points = low
  if (prefix === '15' || prefix === '31' || prefix === '32') return 'low';
  // Airspace (17xxxx, 18xxxx) = medium
  if (prefix === '17' || prefix === '18') return 'medium';
  // Default
  return 'medium';
}

// Established-by based on category
function inferEstablishedBy(code) {
  const prefix = code.substring(0, 2);
  switch (prefix) {
    case '11': case '14': return ['division', 'corps', 'theater'];
    case '12': case '15': return ['battalion', 'brigade', 'division'];
    case '13': case '16': return ['company', 'battalion', 'brigade'];
    case '17': case '18': return ['brigade', 'division', 'corps'];
    case '21': return ['battalion', 'brigade'];
    case '22': case '23': return ['battalion', 'brigade', 'division'];
    case '24': case '25': case '26': return ['battalion', 'brigade', 'division'];
    case '27': case '28': case '29': return ['company', 'battalion', 'brigade'];
    case '31': case '32': case '33': return ['battalion', 'brigade', 'division'];
    case '34': return ['company', 'battalion', 'brigade'];
    default: return ['battalion', 'brigade'];
  }
}

// Doctrinal rules by category
function inferDoctrinalRules(code, label, geometry) {
  const prefix = code.substring(0, 2);
  const rules = [];
  const lbl = label.toLowerCase();

  if (geometry === 'line') {
    rules.push('Must be tied to identifiable terrain features where possible');
  }
  if (geometry === 'area') {
    rules.push('Boundaries must be clearly delineated with identifiable reference points');
  }

  // Category-specific rules
  if (prefix === '24' || prefix === '26') {
    rules.push('Must be coordinated with adjacent and higher headquarters');
    rules.push('Requires positive clearance before engagement');
  } else if (prefix === '27' || prefix === '28') {
    rules.push('Must be reported through engineer channels');
    rules.push('Must be marked and recorded per unit SOP');
  } else if (prefix === '17' || prefix === '18') {
    rules.push('Must be coordinated with airspace control authority');
  } else if (prefix === '34') {
    rules.push('Must be synchronized with the scheme of maneuver');
  }

  if (lbl.includes('route') || lbl.includes('convoy')) {
    rules.push('Must be disseminated to all units operating in or near the area');
  }

  if (rules.length === 0) {
    rules.push('Must be disseminated to all units operating in or near the area');
  }
  return rules;
}

// Min/max points for geometry
function inferPoints(geometry) {
  switch (geometry) {
    case 'line': return { minPoints: 2, maxPoints: 0 };
    case 'area': return { minPoints: 3, maxPoints: 0 };
    case 'arrow': return { minPoints: 2, maxPoints: 0 };
    case 'point': return { minPoints: 1, maxPoints: 1 };
    default: return { minPoints: 1, maxPoints: 0 };
  }
}

// Whether entity likely requires DTG
function requiresDTG(code, label) {
  const lbl = label.toLowerCase();
  return lbl.includes('time') || lbl.includes('phase') || lbl.includes('convoy') ||
    lbl.includes('schedule') || code.startsWith('33');
}

// Whether entity requires designation
function requiresDesignation(label) {
  const lbl = label.toLowerCase();
  return lbl.includes('named') || lbl.includes('zone') || lbl.includes('area') ||
    lbl.includes('route') || lbl.includes('line') || lbl.includes('point');
}

// Generate definition text from label
function generateDefinition(label, geometry) {
  const lbl = label;
  switch (geometry) {
    case 'line': return `${lbl}. A control measure depicted as a line on the common operational picture.`;
    case 'area': return `${lbl}. A control measure depicted as an enclosed area on the common operational picture.`;
    case 'arrow': return `${lbl}. A maneuver graphic depicted as a directional arrow on the common operational picture.`;
    case 'point': return `${lbl}. A control measure depicted as a point symbol on the common operational picture.`;
    default: return `${lbl}. A military control measure used for coordination and control of operations.`;
  }
}

// Required modifiers
function inferRequiredModifiers(code, label, geometry) {
  const mods = [];
  if (geometry === 'line' || geometry === 'area' || geometry === 'arrow') mods.push('T');
  const lbl = label.toLowerCase();
  if (lbl.includes('time') || code.startsWith('33')) mods.push('W');
  return mods;
}

// Build new entries
const newEntries = [];

const generatedCodes = new Set();
for (const b2dEntry of ss25) {
  const code = b2dEntry.d_ec;
  if (existingCodes.has(code) || generatedCodes.has(code)) continue;
  generatedCodes.add(code);

  const label = b2dEntry.label || `Entity ${code}`;
  const bSidc = b2dEntry.b_sidc || '';
  const geometry = inferGeometry(bSidc, label);
  const riskLevel = inferRiskLevel(code, label, geometry);
  const establishedBy = inferEstablishedBy(code);
  const doctrinalRules = inferDoctrinalRules(code, label, geometry);
  const pts = inferPoints(geometry);
  const reqMods = inferRequiredModifiers(code, label, geometry);
  const definition = generateDefinition(label, geometry);
  const needsDTG = requiresDTG(code, label);
  const needsDesignation = requiresDesignation(label);

  const entry = {
    entityCode: code,
    label,
    bSidc: bSidc || null,
    definitions: {
      b: definition,
      c: definition,
      d: definition,
      e: definition,
    },
    usageGuidance: {
      purpose: definition,
      establishedBy,
      requiredModifiers: reqMods,
      optionalModifiers: [],
      geometryType: geometry,
      minPoints: pts.minPoints,
      maxPoints: pts.maxPoints,
      doctrinalRules,
    },
    safetyConstraints: {
      riskLevel,
      proximityRules: [],
      temporalRules: [],
      hierarchyRules: [],
      mutualExclusions: [],
      aiValidation: {
        mustNotOverlap: [],
        mustBeContainedIn: [],
        requiresDateTimeGroup: needsDTG,
        requiresDesignation: needsDesignation,
        maxDurationHours: null,
      },
    },
    embeddingText: `${label} (${bSidc || code}) ${definition} Established by: ${establishedBy.join(', ')}. ${reqMods.length ? 'Required modifiers: ' + reqMods.join(', ') + '. ' : ''}Geometry: ${geometry}. ${doctrinalRules.join('. ')}. Risk level: ${riskLevel}.`,
  };

  newEntries.push(entry);
}

// Merge into existing doctrine, sort by entityCode
const allEntities = [...doctrine.entities, ...newEntries].sort((a, b) =>
  a.entityCode.localeCompare(b.entityCode),
);

doctrine.entities = allEntities;

writeFileSync(
  join(root, 'data/mil-std-2525/doctrine/ss25-control-measures.json'),
  JSON.stringify(doctrine, null, 2) + '\n',
);

console.log(`Generated ${newEntries.length} new doctrine entries`);
console.log(`Total: ${allEntities.length} entities in ss25-control-measures.json`);
