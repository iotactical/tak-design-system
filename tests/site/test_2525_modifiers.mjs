// tests/site/test_2525_modifiers.mjs
// Validates REQ-XW-093 (Modifier Inspector) and REQ-XW-105 (Modifier panel with live toggle)
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) { passed++; console.log(`  PASS: ${message}`); }
  else { failed++; console.error(`  FAIL: ${message}`); }
}

const explorerSrc = readFileSync(resolve(root, 'site/src/pages/Explorer.tsx'), 'utf-8');
const cssSrc = readFileSync(resolve(root, 'site/src/pages/Explorer.module.css'), 'utf-8');

console.log('REQ-XW-093: Modifier Inspector');
console.log('---');

assert(explorerSrc.includes('REQ-XW-093'), 'Explorer.tsx contains REQ-XW-093 traceability tag');
assert(explorerSrc.includes('REQ-XW-105'), 'Explorer.tsx contains REQ-XW-105 traceability tag');
assert(explorerSrc.includes('function ModifierInspector'), 'ModifierInspector component is defined');
assert(explorerSrc.includes('data-testid="modifier-inspector"'), 'Inspector panel has data-testid');
assert(explorerSrc.includes('entity.label') && explorerSrc.includes('ModifierInspector'), 'Inspector displays entity name');
assert(/ModifierInspector[\s\S]*?<MilSymRenderer\s+sidc=\{dSidc\}/.test(explorerSrc), 'Inspector renders symbol with MilSymRenderer using dSidc');

console.log('');
console.log('REQ-XW-105: Modifier panel with live toggle');
console.log('---');

assert(explorerSrc.includes('data-testid="modifier-controls"'), 'Modifier controls section exists');
assert(explorerSrc.includes('data-testid="modifier-s1-select"'), 's1 modifier select exists');
assert(explorerSrc.includes('data-testid="modifier-s2-select"'), 's2 modifier select exists');
assert(explorerSrc.includes("setS1(e.target.value)") && explorerSrc.includes("setS2(e.target.value)"), 's1/s2 state setters wired');
assert(explorerSrc.includes('buildDSidcFromEntity'), 'D SIDC built dynamically');
assert(explorerSrc.includes('function getModifierOptions'), 'getModifierOptions helper exists');
assert(explorerSrc.includes('inspectedEntity') && explorerSrc.includes('setInspectedEntity'), 'BrowsePanel tracks inspected entity state');
assert(explorerSrc.includes('setInspectedEntity('), 'Entity cards clickable to open inspector');
assert(explorerSrc.includes('onClose'), 'Inspector has close handler');
assert(cssSrc.includes('.inspectorPanel'), 'CSS includes .inspectorPanel');
assert(cssSrc.includes('#1e1e1e'), 'Dark theme used');

console.log('');
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failed > 0) process.exit(1);
