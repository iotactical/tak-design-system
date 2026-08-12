// rtmx:req REQ-XW-130
// Test: @iotactical/tak-react package.json is correctly configured for npm publish

import { readdirSync, readFileSync } from 'fs';
import { strict as assert } from 'assert';
import { basename, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

const pkg = JSON.parse(readFileSync(resolve(root, 'packages/react/package.json'), 'utf8'));

// Correct package name
assert.equal(pkg.name, '@iotactical/tak-react', 'package name must be @iotactical/tak-react');

// Version tracks the root package, which is what the release tag is cut from.
// Asserting a literal would make the version bump that publishing requires fail CI.
const rootPkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
assert.match(pkg.version, /^\d+\.\d+\.\d+(-[\w.]+)?$/, 'version must be semver');
assert.equal(pkg.version, rootPkg.version, 'version must stay in lockstep with the root package version');

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

// Scoped packages default to restricted access, so publishConfig must opt in
assert.equal(pkg.publishConfig?.access, 'public', 'publishConfig.access must be public');

// Exports field
assert.ok(pkg.exports, 'exports field must exist');
assert.ok(pkg.exports['.'], 'exports must have "." entry');

// rtmx:req REQ-PKG-005
// Data and schema subpath exports must resolve to files that exist in the source
// tree, otherwise the published tarball has dangling exports.
const sourceFiles = new Set(
  ['data', 'schemas']
    .flatMap(dir => readdirSync(resolve(root, dir), { recursive: true }))
    .map(entry => basename(entry.toString()))
);
const stagedSubpaths = Object.entries(pkg.exports).filter(([key]) => key.startsWith('./data') || key.startsWith('./schemas'));
assert.ok(stagedSubpaths.length > 0, 'exports must include data and schema subpaths');
for (const [key, value] of stagedSubpaths) {
  assert.ok(value.startsWith('./dist/'), `export ${key} must resolve inside dist/`);
  assert.ok(
    sourceFiles.has(basename(value)),
    `export ${key} points at ${basename(value)}, which has no source file under data/ or schemas/`
  );
}

// rtmx:req REQ-SYM-011
assert.ok(pkg.exports['./data/doctrine'], 'exports must have ./data/doctrine entry');
assert.ok(pkg.exports['./schemas/doctrine'], 'exports must have ./schemas/doctrine entry');

// Data subpaths are plain JSON and must not drag React into scope
assert.ok(!pkg.dependencies, 'package must not declare runtime dependencies');
assert.ok(pkg.peerDependencies.react, 'react must stay a peer dependency');

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
