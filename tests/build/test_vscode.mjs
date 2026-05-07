import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const VSCODE_DIR = resolve(ROOT, 'platforms', 'vscode', 'generated');

// rtmx:req REQ-BLD-005
describe('REQ-BLD-005: VS Code dark theme generation', () => {
  before(() => {
    execSync('npm run build:vscode', { cwd: ROOT, stdio: 'pipe' });
  });

  it('tak-dark-theme.json exists', () => {
    assert.ok(existsSync(resolve(VSCODE_DIR, 'tak-dark-theme.json')));
  });

  it('theme name is "TAK Dark"', () => {
    const theme = JSON.parse(readFileSync(resolve(VSCODE_DIR, 'tak-dark-theme.json'), 'utf8'));
    assert.equal(theme.name, 'TAK Dark');
  });

  it('theme type is "dark"', () => {
    const theme = JSON.parse(readFileSync(resolve(VSCODE_DIR, 'tak-dark-theme.json'), 'utf8'));
    assert.equal(theme.type, 'dark');
  });

  it('has editor colors', () => {
    const theme = JSON.parse(readFileSync(resolve(VSCODE_DIR, 'tak-dark-theme.json'), 'utf8'));
    assert.ok(theme.colors['editor.background'], 'Missing editor.background');
    assert.ok(theme.colors['editor.foreground'], 'Missing editor.foreground');
  });

  it('has UI element colors', () => {
    const theme = JSON.parse(readFileSync(resolve(VSCODE_DIR, 'tak-dark-theme.json'), 'utf8'));
    assert.ok(theme.colors['activityBar.background'], 'Missing activityBar.background');
    assert.ok(theme.colors['statusBar.background'], 'Missing statusBar.background');
    assert.ok(theme.colors['sideBar.background'], 'Missing sideBar.background');
  });

  it('has tokenColors for syntax highlighting', () => {
    const theme = JSON.parse(readFileSync(resolve(VSCODE_DIR, 'tak-dark-theme.json'), 'utf8'));
    assert.ok(Array.isArray(theme.tokenColors), 'tokenColors should be an array');
    assert.ok(theme.tokenColors.length > 0, 'tokenColors should not be empty');
  });
});
