// rtmx:req REQ-XW-130
// Test: @iotactical/tak-react package.json is correctly configured for npm publish

import { readFileSync } from 'fs';
import { strict as assert } from 'assert';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

const pkg = JSON.parse(readFileSync(resolve(root, 'packages/react/package.json'), 'utf8'));

// Correct package name
assert.equal(pkg.name, '@iotactical/tak-react', 'package name must be @iotactical/tak-react');

// Version
assert.equal(pkg.version, '0.2.0', 'version must be 0.2.0');

// Files field includes dist
assert.ok(Array.isArray(pkg.files), 'files field must be an array');
assert.ok(pkg.files.includes('dist'), 'files must include "dist"');

// Repository field
assert.ok(pkg.repository, 'repository field must exist');
assert.equal(pkg.repository.type, 'git');
assert.ok(pkg.repository.url.includes('iotactical/tak-design-system'), 'repository url must reference the repo');

// Keywords
assert.ok(Array.isArray(pkg.keywords), 'keywords must be an array');
assert.ok(pkg.keywords.includes('tak'), 'keywords must include tak');
assert.ok(pkg.keywords.includes('react'), 'keywords must include react');

// prepublishOnly script
assert.ok(pkg.scripts.prepublishOnly, 'prepublishOnly script must exist');
assert.ok(pkg.scripts.prepublishOnly.includes('build'), 'prepublishOnly must run build');

// Exports field
assert.ok(pkg.exports, 'exports field must exist');
assert.ok(pkg.exports['.'], 'exports must have "." entry');

// Verify all 28 components are exported from index
const indexSrc = readFileSync(resolve(root, 'packages/react/src/index.ts'), 'utf8');
const expectedComponents = [
  'Button', 'ToolBar', 'Modal', 'EditText', 'TabLayout', 'Checkbox',
  'Toggle', 'Spinner', 'RadioGroup', 'ProgressBar', 'CoordinateDisplay',
  'ConnectionStatus', 'GPSStatus', 'NavBar', 'DockPane', 'DialogPanel',
  'ListView', 'RadialMenu', 'ChatPanel', 'MarkerDetail', 'UserList',
  'RangeBearing', 'RoutePlanner', 'NineLineForm', 'ScaleBar',
  'CompassHeading', 'ElevationProfile', 'SkittleMarker'
];

for (const comp of expectedComponents) {
  assert.ok(indexSrc.includes(`export { ${comp}`) || indexSrc.includes(`${comp},`) || indexSrc.includes(`${comp} }`),
    `Component ${comp} must be exported from index.ts`);
}

assert.equal(expectedComponents.length, 28, 'must verify all 28 components');

// TakThemeProvider export
assert.ok(indexSrc.includes('TakThemeProvider'), 'TakThemeProvider must be exported');

console.log('PASS: test_npm_react - all assertions passed');
