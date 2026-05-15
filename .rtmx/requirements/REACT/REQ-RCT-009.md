# REQ-RCT-009: TakIcon Shape Renderer

## Description
An internal sub-component of TakIcon that renders Android shape drawables (rectangle, oval, ring, line) as CSS-styled HTML elements. This renderer consumes shape definition data from `data/atak-shapes.json` and produces a `<div>` with inline styles for background color, gradient, border, border-radius, and dimensions. It formalizes the rendering logic proven in the site's `ShapePreview` component (`site/src/pages/Icons.tsx`), promoting it from a site-only utility to a library-grade renderer. The renderer handles all four Android shape types, linear/radial/sweep gradients, per-corner radii, dashed strokes, and ring inner/outer radius.

## Acceptance Criteria
- [ ] An internal module `packages/react/src/components/TakIcon/ShapeRenderer.tsx` exists.
- [ ] Renders `rectangle` shapes as `<div>` with `border-radius` from corner data.
- [ ] Renders `oval` shapes as `<div>` with `border-radius: 50%`.
- [ ] Renders `line` shapes as `<div>` with a border-bottom or `<hr>`.
- [ ] Renders `ring` shapes as `<div>` with a circular border and transparent center.
- [ ] Supports `solidColor` as `background-color`.
- [ ] Supports `gradient` with `linear-gradient()` for linear, `radial-gradient()` for radial, and `conic-gradient()` for sweep type.
- [ ] Supports `stroke` with `border` including `dashWidth`/`dashGap` mapped to dashed border styling.
- [ ] Supports per-corner radii (`topLeftRadius`, `topRightRadius`, `bottomLeftRadius`, `bottomRightRadius`).
- [ ] Accepts a `size` prop that maps to pixel dimensions: sm=24, md=32, lg=40, xl=48.
- [ ] Falls back to `#333` background when no fill or gradient is defined.
- [ ] All 70 shapes in `data/atak-shapes.json` render without error.

## Validation
- **Test**: tests/react/test_tak_icon.mjs::test_shape_renderer_rectangle
- **Test**: tests/react/test_tak_icon.mjs::test_shape_renderer_oval
- **Test**: tests/react/test_tak_icon.mjs::test_shape_renderer_gradient
- **Test**: tests/react/test_tak_icon.mjs::test_shape_renderer_stroke
- **Test**: tests/react/test_tak_icon.mjs::test_shape_renderer_all_shapes_no_error
- **Method**: Unit Test
