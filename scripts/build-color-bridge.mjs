#!/usr/bin/env node
/**
 * TAK Design System - Color Bridge Builder (REQ-SYM-002)
 *
 * Resolves W3C design token references for affiliation colors and generates
 * platform-specific configuration files that bridge to mil-sym renderer APIs:
 *   - mil-sym-ts  (JSON)
 *   - mil-sym-java (Java properties)
 *   - mil-sym-android (Android XML color resources)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'platforms/bridge');

// ---------------------------------------------------------------------------
// Load tokens
// ---------------------------------------------------------------------------

const core = JSON.parse(readFileSync(resolve(ROOT, 'tokens/w3c/core.json'), 'utf8'));
const semantic = JSON.parse(readFileSync(resolve(ROOT, 'tokens/w3c/semantic.json'), 'utf8'));

// ---------------------------------------------------------------------------
// Resolve token references
// ---------------------------------------------------------------------------

/**
 * Resolve a W3C token reference like "{color.blue.500}" against the core token file.
 */
function resolveRef(ref) {
  const match = ref.match(/^\{(.+)\}$/);
  if (!match) return ref;

  const parts = match[1].split('.');
  let node = core;
  for (const part of parts) {
    node = node[part];
    if (!node) {
      throw new Error(`Cannot resolve token reference: ${ref}`);
    }
  }
  return node.$value ?? node.value;
}

const AFFILIATIONS = ['friendly', 'hostile', 'neutral', 'unknown', 'suspect', 'pending'];

const resolved = {};
for (const aff of AFFILIATIONS) {
  const token = semantic.affiliation[aff];
  if (!token) {
    throw new Error(`Missing affiliation token: ${aff}`);
  }
  resolved[aff] = resolveRef(token.$value);
}

// ---------------------------------------------------------------------------
// Generate outputs
// ---------------------------------------------------------------------------

mkdirSync(OUT_DIR, { recursive: true });

// --- mil-sym-ts (JSON) ---
const tsConfig = {
  $description: 'mil-sym-ts AffiliationColors - generated from W3C design tokens (REQ-SYM-002)',
  affiliationColors: {}
};
for (const aff of AFFILIATIONS) {
  tsConfig.affiliationColors[aff] = resolved[aff];
}
writeFileSync(
  resolve(OUT_DIR, 'mil-sym-ts-colors.json'),
  JSON.stringify(tsConfig, null, 2) + '\n'
);

// --- mil-sym-java (properties) ---
const propsLines = [
  '# mil-sym-java AffiliationColors - generated from W3C design tokens (REQ-SYM-002)',
  '# Do not edit manually. Run `npm run build:bridge` to regenerate.',
  ''
];
for (const aff of AFFILIATIONS) {
  propsLines.push(`affiliation.${aff}=${resolved[aff]}`);
}
propsLines.push('');
writeFileSync(
  resolve(OUT_DIR, 'mil-sym-java-colors.properties'),
  propsLines.join('\n')
);

// --- mil-sym-android (XML) ---
const xmlEntries = AFFILIATIONS.map(
  aff => `    <color name="mil_sym_affiliation_${aff}">${resolved[aff]}</color>`
).join('\n');
const xml = `<?xml version="1.0" encoding="utf-8"?>
<!-- mil-sym-android AffiliationColors - generated from W3C design tokens (REQ-SYM-002) -->
<!-- Do not edit manually. Run \`npm run build:bridge\` to regenerate. -->
<resources>
${xmlEntries}
</resources>
`;
writeFileSync(resolve(OUT_DIR, 'mil-sym-android-colors.xml'), xml);

console.log('Bridge build complete.');
console.log(`  mil-sym-ts-colors.json`);
console.log(`  mil-sym-java-colors.properties`);
console.log(`  mil-sym-android-colors.xml`);
