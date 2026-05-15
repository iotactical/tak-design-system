/**
 * Pure geometry utilities for multipoint graphic transforms.
 * Extracted from MultipointMap and ControlMeasuresPanel for testability.
 */

export type Point = [number, number];

/** Parse canonical "lon,lat lon,lat" control-point string into Point[] */
export function parseControlPoints(cp: string): Point[] {
  return cp.split(' ').map((p) => {
    const [lon, lat] = p.split(',').map(Number);
    return [lon, lat] as Point;
  });
}

/** Rotate a point around a center by cos/sin of angle, accounting for latitude scaling */
export function rotatePoint(
  lng: number, lat: number, cx: number, cy: number,
  cosA: number, sinA: number, latScale: number,
): Point {
  const dx = (lng - cx) * latScale;
  const dy = lat - cy;
  return [cx + (dx * cosA - dy * sinA) / latScale, cy + dx * sinA + dy * cosA];
}

/** Compute the centroid of a set of points */
export function centroid(pts: Point[]): Point {
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  return [cx, cy];
}

/** Rotate all points by angleDeg around their centroid, with latitude compensation */
export function rotateAllPoints(pts: Point[], angleDeg: number): Point[] {
  if (pts.length < 2) return pts;
  const [cx, cy] = centroid(pts);
  const rad = (angleDeg * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);
  const latScale = Math.cos((cy * Math.PI) / 180);
  return pts.map(([lng, lat]) => {
    const dx = (lng - cx) * latScale;
    const dy = lat - cy;
    const rx = dx * cosA - dy * sinA;
    const ry = dx * sinA + dy * cosA;
    return [cx + rx / latScale, cy + ry] as Point;
  });
}

/** Scale all points by factorX/factorY relative to an anchor */
export function scaleAllPoints(
  pts: Point[], factorX: number, factorY: number,
  anchorLng: number, anchorLat: number,
): Point[] {
  return pts.map(([lng, lat]) => [
    anchorLng + (lng - anchorLng) * factorX,
    anchorLat + (lat - anchorLat) * factorY,
  ] as Point);
}

/** Translate all points by delta */
export function translateAllPoints(pts: Point[], dLng: number, dLat: number): Point[] {
  return pts.map(([lng, lat]) => [lng + dLng, lat + dLat] as Point);
}

/** Project mouse deltas onto rotated bbox axes for resize */
export function projectResizeDeltas(
  rawDx: number, rawDy: number,
  prevRawDx: number, prevRawDy: number,
  cosR: number, sinR: number,
): { scaleX: number; scaleY: number } {
  const prevU =  prevRawDx * cosR + prevRawDy * sinR;
  const prevV = -prevRawDx * sinR + prevRawDy * cosR;
  const newU =  rawDx * cosR + rawDy * sinR;
  const newV = -rawDx * sinR + rawDy * cosR;
  const scaleX = Math.abs(prevU) > 0.0001 ? newU / prevU : 1;
  const scaleY = Math.abs(prevV) > 0.0001 ? newV / prevV : 1;
  return { scaleX, scaleY };
}

export interface Snapshot {
  points: Point[];
  rotation: number;
}

/** Undo/redo stack manager for point transforms */
export class PointHistory {
  points: Point[] = [];
  rotation = 0;
  private undoStack: Snapshot[] = [];
  private redoStack: Snapshot[] = [];
  private dragActive = false;

  pushUndo() {
    this.undoStack.push({ points: [...this.points], rotation: this.rotation });
    this.redoStack = [];
  }

  addPoint(pt: Point) {
    this.pushUndo();
    this.points = [...this.points, pt];
  }

  updatePoint(index: number, pt: Point) {
    if (index < 0 || index >= this.points.length) return;
    if (!this.dragActive) this.pushUndo();
    this.dragActive = true;
    const next = [...this.points];
    next[index] = pt;
    this.points = next;
  }

  translateAll(dLng: number, dLat: number) {
    if (!this.dragActive) this.pushUndo();
    this.dragActive = true;
    this.points = translateAllPoints(this.points, dLng, dLat);
  }

  rotateAll(angleDeg: number) {
    if (this.points.length < 2) return;
    if (!this.dragActive) this.pushUndo();
    this.dragActive = true;
    this.points = rotateAllPoints(this.points, angleDeg);
    this.rotation += angleDeg;
  }

  scaleAll(factorX: number, factorY: number, anchorLng: number, anchorLat: number) {
    if (!this.dragActive) this.pushUndo();
    this.dragActive = true;
    this.points = scaleAllPoints(this.points, factorX, factorY, anchorLng, anchorLat);
  }

  commitDrag() {
    this.dragActive = false;
  }

  undo(): boolean {
    const snapshot = this.undoStack.pop();
    if (!snapshot) return false;
    this.redoStack.push({ points: [...this.points], rotation: this.rotation });
    this.points = snapshot.points;
    this.rotation = snapshot.rotation;
    return true;
  }

  redo(): boolean {
    const snapshot = this.redoStack.pop();
    if (!snapshot) return false;
    this.undoStack.push({ points: [...this.points], rotation: this.rotation });
    this.points = snapshot.points;
    this.rotation = snapshot.rotation;
    return true;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
    this.points = [];
    this.rotation = 0;
    this.dragActive = false;
  }

  get canUndo() { return this.undoStack.length > 0; }
  get canRedo() { return this.redoStack.length > 0; }
}
