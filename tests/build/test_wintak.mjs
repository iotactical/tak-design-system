import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const WINTAK_DIR = resolve(ROOT, 'platforms', 'wintak', 'generated');
const XAML_FILE = resolve(WINTAK_DIR, 'TakResourceDictionary.xaml');

// rtmx:req REQ-XW-034
describe('REQ-XW-034: build:wintak exits 0 and produces output', () => {
  it('npm run build:wintak exits 0', () => {
    execSync('npm run build:wintak', { cwd: ROOT, stdio: 'pipe' });
  });

  it('TakResourceDictionary.xaml exists', () => {
    assert.ok(existsSync(XAML_FILE), 'TakResourceDictionary.xaml not found');
  });
});

// rtmx:req REQ-XW-030
describe('REQ-XW-030: Valid WPF ResourceDictionary format', () => {
  it('contains ResourceDictionary root element', () => {
    const xaml = readFileSync(XAML_FILE, 'utf8');
    assert.match(xaml, /<ResourceDictionary/);
  });

  it('declares required XML namespaces', () => {
    const xaml = readFileSync(XAML_FILE, 'utf8');
    assert.match(xaml, /xmlns:x="http:\/\/schemas\.microsoft\.com\/winfx\/2006\/xaml"/);
    assert.match(xaml, /xmlns:sys="clr-namespace:System;assembly=mscorlib"/);
  });
});

// rtmx:req REQ-XW-031
describe('REQ-XW-031: Color tokens become SolidColorBrush', () => {
  it('contains SolidColorBrush entries', () => {
    const xaml = readFileSync(XAML_FILE, 'utf8');
    const brushes = xaml.match(/<SolidColorBrush /g) || [];
    assert.ok(brushes.length > 0, 'No SolidColorBrush entries found');
  });

  it('SolidColorBrush has x:Key and Color attributes', () => {
    const xaml = readFileSync(XAML_FILE, 'utf8');
    assert.match(xaml, /<SolidColorBrush x:Key="[^"]+" Color="#[0-9A-Fa-f]+"\s*\/>/);
  });
});

// rtmx:req REQ-XW-032
describe('REQ-XW-032: Dimension tokens become sys:Double', () => {
  it('contains sys:Double entries', () => {
    const xaml = readFileSync(XAML_FILE, 'utf8');
    const doubles = xaml.match(/<sys:Double /g) || [];
    assert.ok(doubles.length > 0, 'No sys:Double entries found');
  });

  it('sys:Double values are numeric (no units)', () => {
    const xaml = readFileSync(XAML_FILE, 'utf8');
    const values = xaml.match(/<sys:Double x:Key="[^"]+">([^<]+)<\/sys:Double>/g) || [];
    for (const entry of values) {
      const num = entry.match(/>([^<]+)</)[1];
      assert.ok(!isNaN(Number(num)), `Expected numeric value, got: ${num}`);
    }
  });
});

// rtmx:req REQ-XW-033
describe('REQ-XW-033: Resource keys use Tak prefix and PascalCase', () => {
  it('all x:Key values start with Tak', () => {
    const xaml = readFileSync(XAML_FILE, 'utf8');
    const keys = xaml.match(/x:Key="([^"]+)"/g) || [];
    assert.ok(keys.length > 0, 'No x:Key attributes found');
    for (const key of keys) {
      const name = key.match(/x:Key="([^"]+)"/)[1];
      assert.ok(name.startsWith('Tak'), `Key does not start with Tak: ${name}`);
    }
  });

  it('keys are PascalCase (no underscores or hyphens)', () => {
    const xaml = readFileSync(XAML_FILE, 'utf8');
    const keys = xaml.match(/x:Key="([^"]+)"/g) || [];
    for (const key of keys) {
      const name = key.match(/x:Key="([^"]+)"/)[1];
      assert.ok(!name.includes('_'), `Key contains underscore: ${name}`);
      assert.ok(!name.includes('-'), `Key contains hyphen: ${name}`);
    }
  });
});
