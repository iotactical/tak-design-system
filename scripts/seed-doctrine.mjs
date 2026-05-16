#!/usr/bin/env node
/**
 * Seed doctrine data from multipoint-examples.ts definitions.
 * Run once to bootstrap ss25-control-measures.json, then enrich manually.
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Parse multipoint-examples.ts to extract entity data
const src = readFileSync(join(root, 'site/src/data/multipoint-examples.ts'), 'utf-8');

// Extract all object literals from the MULTIPOINT_EXAMPLES array
const entries = [];
const entryRegex = /\{\s*name:\s*'([^']+)',\s*sidc:\s*ss25Sidc\('(\d+)'\),\s*bSidc:\s*'([^']+)',\s*entityCode:\s*'(\d+)',\s*controlPoints:\s*'[^']+',\s*minPoints:\s*(\d+),\s*maxPoints:\s*(\d+),\s*description:\s*'([^']+)',\s*category:\s*'([^']+)'/g;

let m;
while ((m = entryRegex.exec(src)) !== null) {
  entries.push({
    name: m[1],
    entityCode: m[4],
    bSidc: m[3],
    minPoints: parseInt(m[5]),
    maxPoints: parseInt(m[6]),
    description: m[7],
    category: m[8],
  });
}

// Risk level classification by entity code prefix and specific codes
const CRITICAL = new Set([
  '242301', '242302', // Kill boxes
  '260100', '260200', '260300', '260500', // FSCL, CFL, NFL, RFL
  '240201', // Free Fire Area
  '240703', // FPF
  '240808', // Bomb Area
  '172000', // Weapons Free Zone
]);

const HIGH = new Set([
  '110100', // Boundary
  '140100', '140200', '140400', // FLOT, LC, FEBA
  '151300', // Engagement Area
  '240103', // ACA
  '170900', '171000', '171600', '171900', // Airspace zones
  '271700', '271800', '271900', '272100', '272200', // CBRN contamination
  '270800', '270707', // Mined areas
  '271000', // UXO
]);

const MEDIUM = new Set([
  '140300', // Phase Line
  '140500', '140602', '140700', '140800', '141000', '141500', // Various lines
  '120100', '120200', '120300', // AO, NAI, TAI
  '151401', '151404', '151406', // Axes of advance
  '340700', '342400', // Counterattack, Withdraw
  '150200', '150600', '150800', '151000', // Assembly, DZ, LZ, Fortified
  '151200', '151700', // Battle Position, Objective
  '270100', '270200', '270300', // Obstacle belt/zone/free
  '150100', // Area
]);

function riskLevel(ec) {
  if (CRITICAL.has(ec)) return 'critical';
  if (HIGH.has(ec)) return 'high';
  if (MEDIUM.has(ec)) return 'medium';
  return 'low';
}

// Determine which modifiers are required based on category and risk
function requiredMods(entry) {
  const mods = ['T']; // All graphics need designation
  const risk = riskLevel(entry.entityCode);
  if (risk === 'critical' || risk === 'high') {
    // Fire support and airspace measures need DTGs
    const fsPrefix = entry.entityCode.startsWith('24') || entry.entityCode.startsWith('26') || entry.entityCode.startsWith('17');
    if (fsPrefix) mods.push('W');
  }
  return mods;
}

function optionalMods(entry) {
  const mods = [];
  const risk = riskLevel(entry.entityCode);
  if (risk === 'critical') mods.push('W1');
  if (entry.category === 'area' && entry.entityCode.startsWith('27')) mods.push('AM'); // distance for obstacles
  return mods;
}

// Determine establishing authority
function establishedBy(entry) {
  const ec = entry.entityCode;
  if (ec.startsWith('26') || ec === '242301' || ec === '240201') {
    return ['division', 'corps', 'JFC'];
  }
  if (ec.startsWith('17') || ec === '240103') {
    return ['JFACC', 'ACA', 'component commander'];
  }
  if (ec === '110100') return ['division', 'corps', 'theater'];
  if (ec.startsWith('27') || ec.startsWith('29') || ec.startsWith('28')) {
    return ['battalion', 'brigade', 'division'];
  }
  if (ec.startsWith('31') || ec.startsWith('33')) {
    return ['brigade', 'division', 'corps'];
  }
  return ['battalion', 'brigade', 'division'];
}

// Build doctrine entries
const entities = entries.map((e) => {
  const risk = riskLevel(e.entityCode);
  const definition = e.description.charAt(0).toUpperCase() + e.description.slice(1);
  const estBy = establishedBy(e);
  const reqMods = requiredMods(e);
  const optMods = optionalMods(e);

  // Most SS25 graphics exist across B/C/D/E
  const defs = {
    b: definition,
    c: definition,
    d: definition,
    e: definition,
  };

  // Doctrinal rules vary by type
  const rules = [];
  if (risk === 'critical') {
    rules.push('Must be coordinated with all affected units and components');
    rules.push('Requires explicit activation and deactivation date-time groups');
    if (e.entityCode.startsWith('24') || e.entityCode.startsWith('26')) {
      rules.push('Fire support coordination measure -- misplacement risks fratricide');
    }
  }
  if (e.category === 'line' && (e.entityCode.startsWith('14') || e.entityCode.startsWith('26'))) {
    rules.push('Must be tied to identifiable terrain features where possible');
  }
  if (e.category === 'area') {
    rules.push('Boundaries must be clearly defined and not overlap with conflicting measures');
  }
  if (risk === 'high' || risk === 'critical') {
    rules.push('Must be disseminated to all units operating in or near the area');
  }
  if (rules.length === 0) {
    rules.push('Standard tactical graphic -- coordinate with adjacent and higher units');
  }

  // Safety constraints
  const proximity = [];
  const temporal = [];
  const hierarchy = [];
  const exclusions = [];
  const mustNotOverlap = [];

  if (risk === 'critical') {
    proximity.push('Must not overlap with friendly assembly areas or positions');
    temporal.push('Must have explicit activation DTG (W modifier)');
    hierarchy.push(`Must be established by ${estBy[estBy.length - 1]} or higher authority`);
    if (e.entityCode === '240201') {
      exclusions.push('No Fire Area', 'Restrictive Fire Area');
      mustNotOverlap.push('NFA', 'RFA', 'friendly positions');
    }
    if (e.entityCode === '242301') {
      exclusions.push('No Fire Area');
      mustNotOverlap.push('NFA', 'friendly assembly area');
    }
  }
  if (risk === 'high') {
    if (e.entityCode.startsWith('271') || e.entityCode.startsWith('272')) {
      proximity.push('Must include buffer zone around contaminated area');
      proximity.push('Must not overlap with active supply routes without decontamination procedures');
    }
  }

  const needsDTG = risk === 'critical' || reqMods.includes('W');

  const embedding = [
    `${e.name}: ${definition}`,
    `Established by ${estBy.join(' or ')}.`,
    rules.join('. ') + '.',
    `Risk level: ${risk}.`,
    proximity.length > 0 ? proximity.join('. ') + '.' : '',
    exclusions.length > 0 ? `Must not overlap with: ${exclusions.join(', ')}.` : '',
    needsDTG ? 'Requires date-time group.' : '',
  ].filter(Boolean).join(' ');

  return {
    entityCode: e.entityCode,
    label: e.name,
    bSidc: e.bSidc,
    definitions: defs,
    usageGuidance: {
      purpose: definition,
      establishedBy: estBy,
      requiredModifiers: reqMods,
      optionalModifiers: optMods,
      geometryType: e.category,
      minPoints: e.minPoints,
      maxPoints: e.maxPoints,
      doctrinalRules: rules,
    },
    safetyConstraints: {
      riskLevel: risk,
      proximityRules: proximity,
      temporalRules: temporal,
      hierarchyRules: hierarchy,
      mutualExclusions: exclusions,
      aiValidation: {
        mustNotOverlap,
        mustBeContainedIn: [],
        requiresDateTimeGroup: needsDTG,
        requiresDesignation: true,
        maxDurationHours: risk === 'critical' ? 72 : null,
      },
    },
    embeddingText: embedding,
  };
});

const output = {
  $schema: '../../../schemas/mil-std-2525-doctrine.schema.json',
  symbolSet: '25',
  symbolSetName: 'Control Measures',
  entities,
};

const outPath = join(root, 'data/mil-std-2525/doctrine/ss25-control-measures.json');
writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n');
console.log(`Wrote ${entities.length} doctrine entries to ${outPath}`);
