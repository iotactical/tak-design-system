import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const DIST = resolve(ROOT, 'packages', 'react', 'dist');

// rtmx:req REQ-CMP-007
describe('REQ-CMP-007: RoutePlanner component', () => {
  let dts;

  before(() => {
    dts = readFileSync(resolve(DIST, 'index.d.ts'), 'utf8');
  });

  // rtmx:req REQ-CMP-007
  it('RoutePlanner component exported', () => {
    assert.match(dts, /export declare const RoutePlanner/);
  });

  // rtmx:req REQ-CMP-007
  it('RoutePlannerProps type exported', () => {
    assert.match(dts, /RoutePlannerProps/);
  });

  // rtmx:req REQ-CMP-007
  it('Waypoint type exported', () => {
    assert.match(dts, /Waypoint/);
  });

  // rtmx:req REQ-CMP-007
  it('waypoints prop accepts Waypoint array', () => {
    assert.match(dts, /waypoints:\s*Waypoint\[\]/);
  });

  // rtmx:req REQ-CMP-007
  it('onWaypointAdd callback prop exists', () => {
    assert.match(dts, /onWaypointAdd\?.*\(waypoint:\s*Waypoint\)\s*=>\s*void/);
  });

  // rtmx:req REQ-CMP-007
  it('onWaypointRemove callback prop exists', () => {
    assert.match(dts, /onWaypointRemove\?.*\(index:\s*number\)\s*=>\s*void/);
  });

  // rtmx:req REQ-CMP-007
  it('onWaypointReorder callback prop exists', () => {
    assert.match(dts, /onWaypointReorder\?.*\(fromIndex:\s*number,\s*toIndex:\s*number\)\s*=>\s*void/);
  });

  // rtmx:req REQ-CMP-007
  it('totalDistance prop exists as number', () => {
    assert.match(dts, /totalDistance\?.*number/);
  });

  // rtmx:req REQ-CMP-007
  it('estimatedTime prop exists as number', () => {
    assert.match(dts, /estimatedTime\?.*number/);
  });

  // rtmx:req REQ-CMP-007
  it('Waypoint has name, coordinate with lat/lon, and optional type', () => {
    assert.match(dts, /name:\s*string/);
    assert.match(dts, /lat:\s*number/);
    assert.match(dts, /lon:\s*number/);
    assert.match(dts, /alt\?.*number/);
    assert.match(dts, /type\?.*'waypoint'\s*\|\s*'checkpoint'\s*\|\s*'target'/);
  });

  // rtmx:req REQ-CMP-007
  it('children prop exists', () => {
    assert.match(dts, /RoutePlannerProps[\s\S]*children\?/);
  });
});
