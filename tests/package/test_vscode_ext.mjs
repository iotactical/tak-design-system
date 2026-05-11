// rtmx:req REQ-XW-132
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const extDir = join(__dirname, '..', '..', 'vscode-extension');

test('vscode-extension/package.json exists', () => {
  const pkgPath = join(extDir, 'package.json');
  assert.ok(existsSync(pkgPath), 'vscode-extension/package.json should exist');
});

test('package.json has contributes.themes field', () => {
  const pkgPath = join(extDir, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  assert.ok(pkg.contributes, 'package.json should have contributes field');
  assert.ok(pkg.contributes.themes, 'package.json should have contributes.themes field');
  assert.ok(Array.isArray(pkg.contributes.themes), 'contributes.themes should be an array');
  assert.ok(pkg.contributes.themes.length > 0, 'contributes.themes should have at least one entry');
});

test('contributes.themes references tak-dark-theme.json', () => {
  const pkgPath = join(extDir, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  const theme = pkg.contributes.themes[0];
  assert.ok(
    theme.path.includes('tak-dark-theme.json'),
    `Theme path should reference tak-dark-theme.json, got: ${theme.path}`
  );
  assert.equal(theme.uiTheme, 'vs-dark', 'uiTheme should be vs-dark');
  assert.equal(theme.label, 'TAK Dark', 'label should be TAK Dark');
});

test('themes/tak-dark-theme.json exists in extension', () => {
  const themePath = join(extDir, 'themes', 'tak-dark-theme.json');
  assert.ok(existsSync(themePath), 'themes/tak-dark-theme.json should exist in vscode-extension');
});

test('theme JSON is valid and has required fields', () => {
  const themePath = join(extDir, 'themes', 'tak-dark-theme.json');
  const theme = JSON.parse(readFileSync(themePath, 'utf-8'));
  assert.ok(theme.name, 'Theme should have a name');
  assert.equal(theme.type, 'dark', 'Theme type should be dark');
  assert.ok(theme.colors, 'Theme should have colors');
  assert.ok(theme.tokenColors, 'Theme should have tokenColors');
});
