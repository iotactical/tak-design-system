// rtmx:req REQ-XW-083
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', '..');
const homePath = join(root, 'site', 'src', 'pages', 'Home.tsx');
const homeCssPath = join(root, 'site', 'src', 'pages', 'Home.module.css');

const homeSource = readFileSync(homePath, 'utf-8');
const homeCss = readFileSync(homeCssPath, 'utf-8');

describe('REQ-XW-083: Overview dashboard redesign', () => {
  it('displays TAK Design System title with version', () => {
    assert.ok(homeSource.includes('TAK Design System'), 'should contain title');
    assert.ok(homeSource.includes('v0.1.0'), 'should contain version');
  });

  it('displays tagline "ATAK on every OS"', () => {
    assert.ok(homeSource.includes('ATAK on every OS'), 'should contain tagline');
  });

  it('has live stats section with token count', () => {
    assert.ok(homeSource.includes('countTokens'), 'should count tokens from JSON');
    assert.ok(homeSource.includes('totalTokens'), 'should compute total tokens');
  });

  it('stats include Tokens, Components, Icons, Palettes, Platforms, Tests', () => {
    const expected = ['Tokens', 'Components', 'Icons', 'Palettes', 'Platforms', 'Tests'];
    for (const label of expected) {
      assert.ok(
        homeSource.includes(`label: '${label}'`),
        `stats should include ${label}`
      );
    }
  });

  it('imports catalog for icon count', () => {
    assert.ok(
      homeSource.includes('atak-drawable-catalog.json'),
      'should import drawable catalog'
    );
    assert.ok(
      homeSource.includes('.length'),
      'should use catalog length for icon count'
    );
  });

  it('has navigation cards linking to sections', () => {
    const routes = ['/colors', '/components', '/icons', '/palettes', '/platforms'];
    for (const route of routes) {
      assert.ok(
        homeSource.includes(`to: '${route}'`),
        `should have nav card for ${route}`
      );
    }
  });

  it('navigation cards use react-router Link', () => {
    assert.ok(
      homeSource.includes("import { Link } from 'react-router-dom'"),
      'should import Link from react-router-dom'
    );
    assert.ok(
      homeSource.includes('<Link'),
      'should render Link components'
    );
  });

  it('has platform support matrix', () => {
    const platforms = ['ATAK', 'WinTAK', 'WebTAK', 'VS Code'];
    for (const p of platforms) {
      assert.ok(
        homeSource.includes(p),
        `platform matrix should include ${p}`
      );
    }
  });

  it('has quick-start install snippet with copy button', () => {
    assert.ok(
      homeSource.includes('npm install @iotactical/tak-react'),
      'should have install command'
    );
    assert.ok(
      homeSource.includes('handleCopy'),
      'should have copy handler'
    );
    assert.ok(
      homeSource.includes('clipboard'),
      'should use clipboard API'
    );
  });

  it('uses CSS modules', () => {
    assert.ok(
      homeSource.includes("import styles from './Home.module.css'"),
      'should import Home.module.css'
    );
  });

  it('CSS module defines expected classes', () => {
    const classes = [
      'dashboard', 'header', 'title', 'version', 'tagline',
      'statsGrid', 'statCard', 'statValue', 'statLabel',
      'navGrid', 'navCard', 'navCardTitle', 'navCardDesc',
      'matrixTable', 'quickStart', 'codeBlock', 'copyBtn',
    ];
    for (const cls of classes) {
      assert.ok(
        homeCss.includes(`.${cls}`),
        `CSS module should define .${cls}`
      );
    }
  });

  it('sets document.title via useEffect', () => {
    assert.ok(
      homeSource.includes('document.title'),
      'should set document.title'
    );
    assert.ok(
      homeSource.includes('useEffect'),
      'should use useEffect hook'
    );
  });
});
