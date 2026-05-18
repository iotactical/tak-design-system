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
  it('displays TAK Design System title', () => {
    assert.ok(homeSource.includes('TAK Design System'), 'should contain title');
  });

  it('displays tagline', () => {
    assert.ok(homeSource.includes('One TAK for every device'), 'should contain tagline');
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
      'page', 'hero', 'title', 'tagline',
      'cardGrid', 'card', 'cardTitle', 'cardDesc',
      'installBlock', 'copyBtn',
      'carousel', 'carouselTrack', 'carouselCard',
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

  it('has mobile carousel for small viewports', () => {
    assert.ok(homeSource.includes('carousel'), 'should have carousel');
    assert.ok(homeSource.includes('carouselTrack'), 'should have carousel track');
    assert.ok(homeSource.includes('handleScroll'), 'should handle scroll');
  });

  it('has platform and tactical graphics cards', () => {
    assert.ok(homeSource.includes('Tactical Graphics'), 'should have Tactical Graphics card');
    assert.ok(homeSource.includes('2525 Explorer'), 'should have 2525 Explorer card');
    assert.ok(homeSource.includes('Platforms'), 'should have Platforms card');
  });
});
