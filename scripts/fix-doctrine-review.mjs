#!/usr/bin/env node
/**
 * Apply corrections from doctrine review agents.
 * Run after generate-doctrine-tier2.mjs to fix issues identified by
 * fire support, obstacles/engineer, maneuver/C2, and airspace/maritime reviewers.
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const filePath = join(root, 'data/mil-std-2525/doctrine/ss25-control-measures.json');

const doctrine = JSON.parse(readFileSync(filePath, 'utf8'));
const byCode = new Map(doctrine.entities.map((e, i) => [e.entityCode, { entity: e, index: i }]));

let fixes = 0;

function fix(code, fn) {
  const entry = byCode.get(code);
  if (!entry) { console.warn(`  SKIP: ${code} not found`); return; }
  fn(entry.entity);
  fixes++;
}

function setRisk(code, level) {
  fix(code, e => { e.safetyConstraints.riskLevel = level; });
}

function setGeometry(code, type, minPts, maxPts) {
  fix(code, e => {
    e.usageGuidance.geometryType = type;
    if (minPts != null) e.usageGuidance.minPoints = minPts;
    if (maxPts != null) e.usageGuidance.maxPoints = maxPts;
  });
}

function setEstablishedBy(code, echelons) {
  fix(code, e => { e.usageGuidance.establishedBy = echelons; });
}

// ===== FIRE SUPPORT REVIEW FIXES =====
console.log('Fire Support fixes:');

// Risk level corrections
setRisk('240701', 'high');    // Linear Target
setRisk('240702', 'high');    // Linear Smoke Target
setRisk('240801', 'high');    // Area Target
setRisk('250100', 'high');    // Firing Point
setRisk('250200', 'high');    // Hide Point
setRisk('250300', 'high');    // Launch Point
setRisk('250400', 'high');    // Reload Point
setRisk('250500', 'high');    // Survey Control Point

// TGMF needs DTG
fix('242000', e => { e.safetyConstraints.aiValidation.requiresDateTimeGroup = true; });

// Bomb Area: echelon must be division+
setEstablishedBy('240808', ['division', 'corps', 'JFC']);

// FPF: unlimited points for polyline
fix('240703', e => { e.usageGuidance.maxPoints = 0; });

// ===== OBSTACLES / ENGINEER REVIEW FIXES =====
console.log('Obstacles/Engineer fixes:');

// Wire obstacles: point -> line
for (const code of ['290302', '290303', '290305', '290306', '290307', '290308', '290309', '290500']) {
  setGeometry(code, 'line', 2, 0);
}

// Mine Cluster: point -> area, risk -> high
setGeometry('290400', 'area', 3, 0);
setRisk('290400', 'high');

// Trip Wire: risk -> high (already fixed geometry above)
setRisk('290500', 'high');

// Shelters/Fort: risk high -> low
for (const code of ['280900', '281000', '281100', '281200']) {
  setRisk(code, 'low');
}

// Engineer Regulating Point: risk high -> medium
setRisk('280800', 'medium');

// Fortified Line -> line, Fortified Position -> area
setGeometry('290900', 'line', 2, 0);
setGeometry('291000', 'area', 3, 0);

// ===== AIRSPACE / MARITIME REVIEW FIXES =====
console.log('Airspace/Maritime fixes:');

// Search Area: point -> area
setGeometry('213200', 'area', 3, 0);

// Bearing Line: point -> line
setGeometry('220100', 'line', 2, 0);

// Low/High Altitude MEZ: risk medium -> high
setRisk('171700', 'high');
setRisk('171800', 'high');

// ===== MANEUVER / C2 REVIEW FIXES =====
console.log('Maneuver/C2 fixes:');

// Maneuver tasks: point -> arrow
const maneuverArrowCodes = [
  '340100', '340200', '340300', '340400', '340500', '340600',
  '340800', '340900', '341000', '341100', '341200', '341300',
  '341400', '341500', '341600', '341700', '341800', '341900',
  '342000', '342100', '342200', '342300', '342500', '342600',
  '342700', '342800',
];
for (const code of maneuverArrowCodes) {
  setGeometry(code, 'arrow', 2, 0);
}

// EPW Holding Area: point -> area
setGeometry('310200', 'area', 3, 0);

// Regenerate embeddingText for all modified entities
for (const e of doctrine.entities) {
  const ug = e.usageGuidance;
  const sc = e.safetyConstraints;
  const bSidc = e.bSidc || e.entityCode;
  const mods = ug.requiredModifiers?.length ? `Required modifiers: ${ug.requiredModifiers.join(', ')}. ` : '';
  const rules = ug.doctrinalRules?.length ? ug.doctrinalRules.join('. ') + '. ' : '';
  const estBy = ug.establishedBy?.length ? `Established by: ${ug.establishedBy.join(', ')}. ` : '';
  const def = e.definitions?.d || e.definitions?.b || ug.purpose || '';
  e.embeddingText = `${e.label} (${bSidc}) ${def} ${estBy}${mods}Geometry: ${ug.geometryType}. ${rules}Risk level: ${sc.riskLevel}.`;
}

writeFileSync(filePath, JSON.stringify(doctrine, null, 2) + '\n');
console.log(`\nApplied ${fixes} fixes to ${doctrine.entities.length} entities.`);
