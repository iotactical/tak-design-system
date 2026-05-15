import { describe, it, expect } from 'vitest';
import {
  parseControlPoints,
  rotatePoint,
  centroid,
  rotateAllPoints,
  scaleAllPoints,
  translateAllPoints,
  projectResizeDeltas,
  PointHistory,
  type Point,
} from './geo-transform';

// ---- Helpers ----
function approxPoint(actual: Point, expected: Point, tol = 1e-6) {
  expect(actual[0]).toBeCloseTo(expected[0], 5);
  expect(actual[1]).toBeCloseTo(expected[1], 5);
}

function approxPoints(actual: Point[], expected: Point[], tol = 1e-6) {
  expect(actual.length).toBe(expected.length);
  for (let i = 0; i < actual.length; i++) {
    approxPoint(actual[i], expected[i], tol);
  }
}

// ---- parseControlPoints ----
describe('parseControlPoints', () => {
  it('parses space-separated lon,lat pairs', () => {
    const pts = parseControlPoints('-97.5,38.0 -96.0,37.5');
    expect(pts).toEqual([[-97.5, 38.0], [-96.0, 37.5]]);
  });

  it('handles single point', () => {
    const pts = parseControlPoints('-97.5,38.0');
    expect(pts).toEqual([[-97.5, 38.0]]);
  });
});

// ---- rotatePoint ----
describe('rotatePoint', () => {
  it('returns same point for 0-degree rotation', () => {
    const result = rotatePoint(10, 20, 10, 20, 1, 0, 1);
    approxPoint(result, [10, 20]);
  });

  it('rotates 90 degrees around center', () => {
    // Point at (1,0) relative to center (0,0), rotated 90 degrees CCW
    // cos(90)=0, sin(90)=1, latScale=1 for simplicity
    const result = rotatePoint(1, 0, 0, 0, 0, 1, 1);
    approxPoint(result, [0, 1]);
  });

  it('rotates 180 degrees', () => {
    const result = rotatePoint(1, 0, 0, 0, -1, 0, 1);
    approxPoint(result, [-1, 0]);
  });

  it('identity after 360 degrees', () => {
    const cos360 = Math.cos(2 * Math.PI);
    const sin360 = Math.sin(2 * Math.PI);
    const result = rotatePoint(5.5, 3.2, 2.0, 1.0, cos360, sin360, 1);
    approxPoint(result, [5.5, 3.2]);
  });
});

// ---- centroid ----
describe('centroid', () => {
  it('computes centroid of square', () => {
    const pts: Point[] = [[0, 0], [2, 0], [2, 2], [0, 2]];
    approxPoint(centroid(pts), [1, 1]);
  });

  it('computes centroid of single point', () => {
    approxPoint(centroid([[5, 10]]), [5, 10]);
  });
});

// ---- rotateAllPoints ----
describe('rotateAllPoints', () => {
  it('preserves centroid after rotation', () => {
    const pts: Point[] = [[-1, 0], [1, 0], [0, 1], [0, -1]];
    const c0 = centroid(pts);
    const rotated = rotateAllPoints(pts, 45);
    const c1 = centroid(rotated);
    approxPoint(c1, c0);
  });

  it('returns same points for 360-degree rotation', () => {
    const pts: Point[] = [[-97, 38], [-96, 38], [-96.5, 37.5]];
    const rotated = rotateAllPoints(pts, 360);
    approxPoints(rotated, pts);
  });

  it('two 45-degree rotations equal one 90-degree rotation', () => {
    const pts: Point[] = [[-1, 0], [1, 0], [0, 1]];
    const r45_twice = rotateAllPoints(rotateAllPoints(pts, 45), 45);
    const r90_once = rotateAllPoints(pts, 90);
    approxPoints(r45_twice, r90_once);
  });

  it('does not alter single-point arrays', () => {
    const pts: Point[] = [[5, 10]];
    const rotated = rotateAllPoints(pts, 90);
    approxPoints(rotated, pts);
  });

  it('preserves point count', () => {
    const pts: Point[] = [[-97, 38], [-96, 37], [-95, 38], [-96, 39], [-97.5, 38.5]];
    const rotated = rotateAllPoints(pts, 30);
    expect(rotated.length).toBe(5);
  });
});

// ---- scaleAllPoints ----
describe('scaleAllPoints', () => {
  it('scale by 1 is identity', () => {
    const pts: Point[] = [[1, 2], [3, 4]];
    const scaled = scaleAllPoints(pts, 1, 1, 0, 0);
    approxPoints(scaled, pts);
  });

  it('scale by 2 doubles distance from anchor', () => {
    const pts: Point[] = [[2, 0]];
    const scaled = scaleAllPoints(pts, 2, 2, 0, 0);
    approxPoints(scaled, [[4, 0]]);
  });

  it('independent X/Y scaling', () => {
    const pts: Point[] = [[4, 6]];
    const scaled = scaleAllPoints(pts, 2, 0.5, 0, 0);
    approxPoints(scaled, [[8, 3]]);
  });

  it('scaling from non-origin anchor', () => {
    const pts: Point[] = [[3, 3]];
    // anchor at (1,1), scale 2x: (3-1)*2+1=5, (3-1)*2+1=5
    const scaled = scaleAllPoints(pts, 2, 2, 1, 1);
    approxPoints(scaled, [[5, 5]]);
  });

  it('rotated scale preserves anchor point', () => {
    const pts: Point[] = [[0, 0], [2, 0], [2, 2], [0, 2]];
    const anchor: Point = [0, 0];
    const scaled = scaleAllPoints(pts, 1.5, 1.5, anchor[0], anchor[1], 45);
    // Anchor point should remain unchanged
    approxPoint(scaled[0], anchor);
  });

  it('rotated scale: 0-degree rotation matches unrotated', () => {
    const pts: Point[] = [[1, 0], [0, 1], [-1, 0]];
    const s1 = scaleAllPoints(pts, 2, 3, 0, 0, 0);
    const s2 = scaleAllPoints(pts, 2, 3, 0, 0);
    approxPoints(s1, s2);
  });

  it('rotated scale does not shear a rotated rectangle', () => {
    // Create a unit square centered at origin, rotated 45 degrees
    // After 45-deg rotation, vertices are at approximately:
    // (0, sqrt(2)), (sqrt(2), 0), (0, -sqrt(2)), (-sqrt(2), 0)
    const r2 = Math.SQRT2;
    const pts: Point[] = [[0, r2], [r2, 0], [0, -r2], [-r2, 0]];
    // Scale 2x in the rotated X-axis (which is the 45-degree diagonal)
    // With anchor at the bottom point (-r2, 0)
    const scaled = scaleAllPoints(pts, 2, 1, -r2, 0, 45);
    // The shape should stretch along the 45-degree axis without shearing
    // Verify the centroid moved along the rotated X-axis direction
    const c0 = centroid(pts);
    const c1 = centroid(scaled);
    // With scale factor 2 in rotated-X, centroid shifts along rotated-X direction
    // The shape should remain a parallelogram (opposite sides parallel)
    const dx01 = scaled[1][0] - scaled[0][0];
    const dy01 = scaled[1][1] - scaled[0][1];
    const dx32 = scaled[2][0] - scaled[3][0];
    const dy32 = scaled[2][1] - scaled[3][1];
    // Opposite sides should remain parallel
    expect(dx01).toBeCloseTo(dx32, 4);
    expect(dy01).toBeCloseTo(dy32, 4);
  });

  it('scaling rotated shape by uniform factor preserves shape', () => {
    // A uniform scale (same X and Y) should preserve the shape regardless of rotation
    const pts: Point[] = [[1, 1], [3, 1], [3, 3], [1, 3]];
    const uniformNoRot = scaleAllPoints(pts, 2, 2, 0, 0, 0);
    const uniformWithRot = scaleAllPoints(pts, 2, 2, 0, 0, 45);
    // Both should produce the same result: uniform scale is rotation-invariant
    approxPoints(uniformWithRot, uniformNoRot);
  });
});

// ---- translateAllPoints ----
describe('translateAllPoints', () => {
  it('translates all points by delta', () => {
    const pts: Point[] = [[1, 2], [3, 4]];
    const moved = translateAllPoints(pts, 10, -5);
    approxPoints(moved, [[11, -3], [13, -1]]);
  });

  it('zero delta is identity', () => {
    const pts: Point[] = [[1, 2]];
    approxPoints(translateAllPoints(pts, 0, 0), pts);
  });
});

// ---- projectResizeDeltas ----
describe('projectResizeDeltas', () => {
  it('no rotation: axes aligned, scaleX/Y are raw ratios', () => {
    const { scaleX, scaleY } = projectResizeDeltas(2, 3, 1, 1, 1, 0);
    expect(scaleX).toBeCloseTo(2);
    expect(scaleY).toBeCloseTo(3);
  });

  it('90-degree rotation: X/Y axes swapped', () => {
    const cos90 = Math.cos(Math.PI / 2);
    const sin90 = Math.sin(Math.PI / 2);
    // At 90 degrees, bbox X-axis is now global Y-axis
    // Moving +1 in global Y with prev +1 in global Y
    // prevU = 0*cos90 + 1*sin90 = 1, newU = 0*cos90 + 2*sin90 = 2
    const { scaleX } = projectResizeDeltas(0, 2, 0, 1, cos90, sin90);
    expect(scaleX).toBeCloseTo(2);
  });

  it('returns 1 when previous delta is near-zero', () => {
    const { scaleX, scaleY } = projectResizeDeltas(5, 5, 0, 0, 1, 0);
    expect(scaleX).toBe(1);
    expect(scaleY).toBe(1);
  });
});

// ---- PointHistory ----
describe('PointHistory', () => {
  it('starts empty', () => {
    const h = new PointHistory();
    expect(h.points).toEqual([]);
    expect(h.rotation).toBe(0);
    expect(h.canUndo).toBe(false);
    expect(h.canRedo).toBe(false);
  });

  it('addPoint pushes and enables undo', () => {
    const h = new PointHistory();
    h.addPoint([1, 2]);
    expect(h.points).toEqual([[1, 2]]);
    expect(h.canUndo).toBe(true);
  });

  it('undo reverses addPoint', () => {
    const h = new PointHistory();
    h.addPoint([1, 2]);
    h.addPoint([3, 4]);
    h.undo();
    expect(h.points).toEqual([[1, 2]]);
    h.undo();
    expect(h.points).toEqual([]);
  });

  it('redo restores after undo', () => {
    const h = new PointHistory();
    h.addPoint([1, 2]);
    h.undo();
    expect(h.points).toEqual([]);
    h.redo();
    expect(h.points).toEqual([[1, 2]]);
  });

  it('new action after undo clears redo stack', () => {
    const h = new PointHistory();
    h.addPoint([1, 2]);
    h.undo();
    h.addPoint([5, 6]);
    expect(h.canRedo).toBe(false);
  });

  it('undo reverses translateAll', () => {
    const h = new PointHistory();
    h.addPoint([0, 0]);
    h.addPoint([1, 1]);
    h.commitDrag();
    h.translateAll(10, 10);
    h.commitDrag();
    expect(h.points).toEqual([[10, 10], [11, 11]]);
    h.undo();
    expect(h.points).toEqual([[0, 0], [1, 1]]);
  });

  it('undo reverses rotateAll and restores rotation angle', () => {
    const h = new PointHistory();
    h.addPoint([1, 0]);
    h.addPoint([-1, 0]);
    h.commitDrag();
    h.rotateAll(90);
    h.commitDrag();
    expect(h.rotation).toBeCloseTo(90);
    h.undo();
    expect(h.rotation).toBeCloseTo(0);
    approxPoints(h.points, [[1, 0], [-1, 0]]);
  });

  it('undo reverses scaleAll', () => {
    const h = new PointHistory();
    h.addPoint([2, 0]);
    h.addPoint([4, 0]);
    h.commitDrag();
    h.scaleAll(2, 1, 0, 0);
    h.commitDrag();
    approxPoints(h.points, [[4, 0], [8, 0]]);
    h.undo();
    approxPoints(h.points, [[2, 0], [4, 0]]);
  });

  it('drag frames coalesce into one undo entry', () => {
    const h = new PointHistory();
    h.addPoint([0, 0]);
    h.commitDrag();
    // Simulate multiple translate frames in one drag
    h.translateAll(1, 0);
    h.translateAll(1, 0);
    h.translateAll(1, 0);
    h.commitDrag();
    approxPoints(h.points, [[3, 0]]);
    // Single undo should reverse all three frames
    h.undo();
    approxPoints(h.points, [[0, 0]]);
  });

  it('updatePoint is undoable as a single drag', () => {
    const h = new PointHistory();
    h.addPoint([0, 0]);
    h.addPoint([1, 1]);
    h.commitDrag();
    // Drag vertex 0 through multiple positions
    h.updatePoint(0, [0.5, 0.5]);
    h.updatePoint(0, [1.0, 1.0]);
    h.updatePoint(0, [2.0, 2.0]);
    h.commitDrag();
    approxPoints(h.points, [[2.0, 2.0], [1, 1]]);
    h.undo();
    approxPoints(h.points, [[0, 0], [1, 1]]);
  });

  it('clear resets everything', () => {
    const h = new PointHistory();
    h.addPoint([1, 2]);
    h.rotateAll(45);
    h.clear();
    expect(h.points).toEqual([]);
    expect(h.rotation).toBe(0);
    expect(h.canUndo).toBe(false);
    expect(h.canRedo).toBe(false);
  });
});
