#!/usr/bin/env node
/**
 * REQ-SYM-009: Generate embeddingText field from structured doctrine fields.
 * Deterministic output suitable for vector embedding model input.
 *
 * Usage:
 *   node scripts/generate-embedding-text.mjs          # Regenerate in-place
 *   node scripts/generate-embedding-text.mjs --verify # Check if stale (exit 1 if so)
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const doctrineDir = resolve(ROOT, 'data', 'mil-std-2525', 'doctrine');
const verifyMode = process.argv.includes('--verify');

const VERSIONS = ['b', 'c', 'd', 'e'];

function generateEmbeddingText(entity) {
  const parts = [];

  // Label and alternate identifiers
  parts.push(`${entity.label}`);
  if (entity.bSidc) parts.push(`(${entity.bSidc})`);

  // Definition (pick most recent non-null)
  if (entity.definitions) {
    for (const v of [...VERSIONS].reverse()) {
      if (entity.definitions[v]) {
        parts.push(entity.definitions[v]);
        break;
      }
    }
  }

  // Usage guidance
  if (entity.usageGuidance) {
    const ug = entity.usageGuidance;
    if (ug.purpose && !parts.includes(ug.purpose)) parts.push(ug.purpose);
    if (ug.establishedBy?.length) parts.push(`Established by: ${ug.establishedBy.join(', ')}.`);
    if (ug.requiredModifiers?.length) parts.push(`Required modifiers: ${ug.requiredModifiers.join(', ')}.`);
    if (ug.geometryType) parts.push(`Geometry: ${ug.geometryType}.`);
    if (ug.doctrinalRules?.length) {
      parts.push(ug.doctrinalRules.join('. ') + '.');
    }
  }

  // Safety constraints
  if (entity.safetyConstraints) {
    const sc = entity.safetyConstraints;
    if (sc.riskLevel) parts.push(`Risk level: ${sc.riskLevel}.`);
    if (sc.proximityRules?.length) parts.push(sc.proximityRules.join('. ') + '.');
    if (sc.temporalRules?.length) parts.push(sc.temporalRules.join('. ') + '.');
    if (sc.mutualExclusions?.length) parts.push(`Must not overlap: ${sc.mutualExclusions.join(', ')}.`);
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

let staleCount = 0;
let totalEntities = 0;

const files = readdirSync(doctrineDir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const filePath = resolve(doctrineDir, file);
  const data = JSON.parse(readFileSync(filePath, 'utf8'));

  if (!Array.isArray(data.entities)) continue;

  let modified = false;
  for (const entity of data.entities) {
    totalEntities++;
    const generated = generateEmbeddingText(entity);

    if (entity.embeddingText !== generated) {
      if (verifyMode) {
        staleCount++;
        console.error(`STALE: ${entity.entityCode} (${entity.label}) in ${file}`);
      } else {
        entity.embeddingText = generated;
        modified = true;
      }
    }
  }

  if (!verifyMode && modified) {
    writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    console.log(`Updated ${file}`);
  }
}

if (verifyMode) {
  if (staleCount > 0) {
    console.error(`\n${staleCount} of ${totalEntities} entities have stale embeddingText.`);
    console.error('Run: node scripts/generate-embedding-text.mjs');
    process.exit(1);
  } else {
    console.log(`All ${totalEntities} entities have up-to-date embeddingText.`);
  }
} else {
  console.log(`Generated embeddingText for ${totalEntities} entities.`);
}
