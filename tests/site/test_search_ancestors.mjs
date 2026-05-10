// rtmx:req REQ-XW-122
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GLOBAL_SEARCH_PATH = resolve(__dirname, '..', '..', 'site', 'src', 'components', 'GlobalSearch.tsx');
const globalSearchSrc = readFileSync(GLOBAL_SEARCH_PATH, 'utf8');

const CSS_PATH = resolve(__dirname, '..', '..', 'site', 'src', 'components', 'GlobalSearch.module.css');
const cssSrc = readFileSync(CSS_PATH, 'utf8');

describe('REQ-XW-122: Ancestor navigation in breadcrumbs', () => {

  it('breadcrumb segments are split and rendered individually', () => {
    assert.ok(
      globalSearchSrc.includes("entry.breadcrumb.split(' > ')"),
      'GlobalSearch should split breadcrumb string into segments',
    );
  });

  it('each breadcrumb segment is rendered as a clickable span', () => {
    assert.ok(
      globalSearchSrc.includes('breadcrumbLink'),
      'GlobalSearch should render breadcrumb segments with breadcrumbLink class',
    );
    assert.ok(
      globalSearchSrc.includes('onClick'),
      'Breadcrumb segments should have onClick handlers',
    );
  });

  it('breadcrumb segment clicks navigate to the correct path', () => {
    assert.ok(
      globalSearchSrc.includes('breadcrumbSegmentPath'),
      'GlobalSearch should use breadcrumbSegmentPath to determine navigation target',
    );
    assert.ok(
      globalSearchSrc.includes('navigate(breadcrumbSegmentPath('),
      'Breadcrumb segment onClick should call navigate with the segment path',
    );
  });

  it('breadcrumb segment path mapper handles top-level routes', () => {
    assert.ok(
      globalSearchSrc.includes("Interfaces: '/interfaces'"),
      'SEGMENT_ROUTES should map Interfaces to /interfaces',
    );
    assert.ok(
      globalSearchSrc.includes("Icons: '/icons'"),
      'SEGMENT_ROUTES should map Icons to /icons',
    );
    assert.ok(
      globalSearchSrc.includes("'2525': '/explorer'"),
      'SEGMENT_ROUTES should map 2525 to /explorer',
    );
  });

  it('breadcrumb segment path mapper handles tab-level routes', () => {
    assert.ok(
      globalSearchSrc.includes("Intents: '/interfaces?tab=intents'"),
      'TAB_SEGMENTS should map Intents to /interfaces?tab=intents',
    );
    assert.ok(
      globalSearchSrc.includes("External: '/interfaces?tab=external'"),
      'TAB_SEGMENTS should map External to /interfaces?tab=external',
    );
  });

  it('breadcrumb separator is rendered between segments', () => {
    assert.ok(
      globalSearchSrc.includes('breadcrumbSep'),
      'GlobalSearch should render breadcrumbSep class between segments',
    );
  });

  it('breadcrumb CSS removes truncation and allows full visibility', () => {
    assert.ok(
      !cssSrc.includes('text-overflow: ellipsis') ||
      !cssSrc.match(/\.resultBreadcrumb[^}]*text-overflow:\s*ellipsis/),
      'resultBreadcrumb should not truncate with ellipsis',
    );
    assert.ok(
      cssSrc.includes('word-break: break-word'),
      'resultBreadcrumb should use word-break: break-word for full visibility',
    );
  });

  it('breadcrumb links have underline on hover', () => {
    assert.ok(
      cssSrc.includes('.breadcrumbLink:hover'),
      'CSS should have .breadcrumbLink:hover rule',
    );
    assert.ok(
      cssSrc.includes('text-decoration: underline'),
      'Breadcrumb links should underline on hover',
    );
  });

  it('clicking a breadcrumb segment stops event propagation', () => {
    assert.ok(
      globalSearchSrc.includes('ev.stopPropagation()'),
      'Breadcrumb click should stopPropagation to avoid selecting the result item',
    );
  });
});
