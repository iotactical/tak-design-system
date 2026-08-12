// rtmx:req REQ-XW-131
// Test: @iotactical/tak-tokens package.json is correctly configured for npm publish

import { existsSync, readFileSync } from 'fs';
import { strict as assert } from 'assert';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');

const pkg = JSON.parse(readFileSync(resolve(root, 'packages/tokens/package.json'), 'utf8'));

// Correct package name
assert.equal(pkg.name, '@iotactical/tak-tokens', 'package name must be @iotactical/tak-tokens');

// Tokens version independently of the component library, so only the format is
// pinned; asserting a literal would make a version bump fail CI.
assert.match(pkg.version, /^\d+\.\d+\.\d+(-[\w.]+)?$/, 'version must be semver');

// License
assert.equal(pkg.license, 'MIT', 'license must be MIT');

// Files field includes w3c/
assert.ok(Array.isArray(pkg.files), 'files field must be an array');
assert.ok(pkg.files.some(f => f.includes('w3c')), 'files must include w3c directory');

// Scoped packages default to restricted access, so publishConfig must opt in
assert.equal(pkg.publishConfig?.access, 'public', 'publishConfig.access must be public');

// Exports field with all token sets
assert.ok(pkg.exports, 'exports field must exist');
assert.ok(pkg.exports['./core'], 'exports must have ./core');
assert.ok(pkg.exports['./semantic'], 'exports must have ./semantic');
assert.ok(pkg.exports['./component'], 'exports must have ./component');
assert.ok(pkg.exports['./atak'], 'exports must have ./atak');
assert.ok(pkg.exports['./wintak'], 'exports must have ./wintak');

// Every export must resolve to a token file that exists in the source tree
for (const [key, value] of Object.entries(pkg.exports)) {
  const source = resolve(root, 'tokens', value.replace('./', ''));
  assert.ok(existsSync(source), `export ${key} has no source token file at tokens/${value.replace('./', '')}`);
}

// All exports point to .json files
for (const [key, value] of Object.entries(pkg.exports)) {
  assert.ok(value.endsWith('.json'), `export ${key} must point to a .json file`);
  assert.ok(value.includes('w3c/'), `export ${key} must be in w3c/ directory`);
}

// Repository field
assert.ok(pkg.repository, 'repository field must exist');
assert.equal(pkg.repository.type, 'git');
assert.ok(pkg.repository.url.includes('iotactical/tak-design-system'), 'repository url must reference the repo');

// npm has not run `prepublish` on publish since npm 5; the token copy must run
// from `prepack` so it also happens for `npm pack` dry runs.
assert.ok(pkg.scripts.prepack, 'prepack script must exist to stage w3c/ before packing');
assert.ok(!pkg.scripts.prepublish, 'prepublish is not run on publish and must not be relied on');

console.log('PASS: test_npm_tokens - all assertions passed');
