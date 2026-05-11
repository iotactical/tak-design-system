#!/usr/bin/env node
/**
 * REQ-XW-152: Delta analysis between consecutive MIL-STD-2525 versions.
 *
 * Compares D vs E symbol sets and C-to-D crosswalk coverage.
 * Output: data/mil-std-2525/delta-analysis.json
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, '..', 'data', 'mil-std-2525');

// Load data
const msd = JSON.parse(readFileSync(resolve(dataDir, 'msd.json'), 'utf8'));
const mse = JSON.parse(readFileSync(resolve(dataDir, 'mse.json'), 'utf8'));
const c2d = JSON.parse(readFileSync(resolve(dataDir, 'c2d-reference.json'), 'utf8'));

/**
 * Resolve inherited ss fields. In both msd and mse, the ss field is empty
 * when it should be inherited from the previous entry that had a non-empty ss.
 */
function resolveSymbolSets(symbols) {
  let currentSs = '';
  return symbols.map(s => {
    if (s.ss !== '') {
      currentSs = s.ss;
    }
    return { ...s, ss: currentSs };
  });
}

// Resolve symbol sets
const dSymbols = resolveSymbolSets(msd.msd.SYMBOL);
const eSymbols = resolveSymbolSets(mse.mse.SYMBOL);

// Build lookup keys: ss + code uniquely identifies an entity
function buildKeySet(symbols) {
  const map = new Map();
  for (const s of symbols) {
    const key = `${s.ss}-${s.code}`;
    map.set(key, s);
  }
  return map;
}

const dMap = buildKeySet(dSymbols);
const eMap = buildKeySet(eSymbols);

// D vs E analysis
const dKeys = new Set(dMap.keys());
const eKeys = new Set(eMap.keys());

const shared = new Set([...dKeys].filter(k => eKeys.has(k)));
const dOnly = new Set([...dKeys].filter(k => !eKeys.has(k)));
const eOnly = new Set([...eKeys].filter(k => !dKeys.has(k)));

// Group by symbol set
const allSs = new Set([
  ...[...dKeys].map(k => k.split('-')[0]),
  ...[...eKeys].map(k => k.split('-')[0]),
]);

const changesBySymbolSet = {};
for (const ss of [...allSs].sort()) {
  const ssAdded = [...eOnly].filter(k => k.startsWith(`${ss}-`)).length;
  const ssRemoved = [...dOnly].filter(k => k.startsWith(`${ss}-`)).length;
  const ssShared = [...shared].filter(k => k.startsWith(`${ss}-`)).length;
  if (ssAdded > 0 || ssRemoved > 0 || ssShared > 0) {
    changesBySymbolSet[ss] = { added: ssAdded, removed: ssRemoved, shared: ssShared };
  }
}

// C vs D analysis
const c2dSymbols = c2d.c2d.symbols;
const cMapped = c2dSymbols.length;

// Build set of D codes that have a C mapping
const dCodesWithCMapping = new Set(c2dSymbols.map(s => `${s.ss}-${s.ec}`));
const dNew = [...dKeys].filter(k => {
  const [ss, code] = k.split('-');
  return !dCodesWithCMapping.has(`${ss}-${code}`);
}).length;

const mappingCoverage = ((cMapped / dMap.size) * 100).toFixed(1) + '%';

const result = {
  d_to_e: {
    d_only: dOnly.size,
    e_only: eOnly.size,
    shared: shared.size,
    d_total: dMap.size,
    e_total: eMap.size,
    changes_by_symbol_set: changesBySymbolSet,
  },
  c_to_d: {
    c_mapped: cMapped,
    d_total: dMap.size,
    d_new: dNew,
    mapping_coverage: mappingCoverage,
  },
};

// Write output
const outputPath = resolve(dataDir, 'delta-analysis.json');
writeFileSync(outputPath, JSON.stringify(result, null, 2) + '\n');

console.log('Delta analysis written to:', outputPath);
console.log(JSON.stringify(result, null, 2));
