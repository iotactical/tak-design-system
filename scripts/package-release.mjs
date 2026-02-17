#!/usr/bin/env node
/**
 * TAK Design System - Package Release
 *
 * Creates a distributable tarball containing all platform outputs
 * for consumption by DBSDK containers.
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
const version = pkg.version;

const distDir = resolve(ROOT, 'dist');
if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });

const tarball = `tak-design-system-${version}.tar.gz`;

console.log(`Packaging TAK Design System v${version}...`);

// Build all platforms first
execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });

// Create tarball with all platform outputs and source tokens
const includes = [
  'tokens/',
  'platforms/atak/res/',
  'platforms/atak/compose/generated/',
  'platforms/web/generated/',
  'platforms/vscode/generated/',
  'icons/',
  'LICENSE',
  'README.md'
].filter(p => existsSync(resolve(ROOT, p)));

execSync(
  `tar czf dist/${tarball} ${includes.join(' ')}`,
  { cwd: ROOT, stdio: 'inherit' }
);

console.log(`\nPackaged: dist/${tarball}`);
console.log(`Version: ${version}`);
