# REQ-ICN-006: ATAK Shape Drawable Library

## Description
Convert the 118 Android shape drawables from ATAK into platform-agnostic equivalents in CSS, SVG, and XAML. Android shape drawables define rectangles, ovals, lines, and rings with gradient fills, strokes, corner radii, and padding. These shapes are used as backgrounds for list items, cards, dialogs, status bars, and input fields throughout ATAK. The design system must express each shape in three output formats so that web, mobile, and desktop consumers can achieve pixel-identical backgrounds and containers without reverse-engineering Android XML.

## Acceptance Criteria
- [ ] A directory `icons/shapes/` contains 118 shape definition directories, one per ATAK shape drawable.
- [ ] Each directory contains: `definition.json`, `shape.svg`, `shape.css`, and `shape.xaml`.
- [ ] The `definition.json` contains fields: `name`, `shapeType` (rectangle, oval, line, ring), `fill` (solid color or gradient definition), `stroke` (color, width, dashWidth, dashGap), `cornerRadius` (topLeft, topRight, bottomRight, bottomLeft or uniform), `size` (width, height or null for match-parent), `padding`, `atakSourceFile`.
- [ ] Gradient definitions include `type` (linear, radial, sweep), `colors` (array), `angle` (for linear), `centerX`/`centerY`/`radius` (for radial).
- [ ] The SVG output uses `<rect>`, `<ellipse>`, `<line>`, or path elements with matching `<linearGradient>`/`<radialGradient>` definitions.
- [ ] The CSS output uses `background`, `border`, `border-radius`, and `linear-gradient()`/`radial-gradient()` properties.
- [ ] The XAML output uses `<Rectangle>`, `<Ellipse>`, or `<Path>` with `<LinearGradientBrush>`/`<RadialGradientBrush>`.
- [ ] Color values reference design tokens where a mapping exists.
- [ ] A manifest file `icons/shapes/manifest.json` indexes all 118 shapes with: `name`, `shapeType`, `hasGradient`, `atakSourceFile`.
- [ ] All definition JSON files pass schema validation against `schemas/shape-definition.schema.json`.

## Validation
- **Test**: tests/icons/test_shape_drawables.mjs::test_shape_count
- **Test**: tests/icons/test_shape_drawables.mjs::test_shape_definition_schema
- **Test**: tests/icons/test_shape_drawables.mjs::test_shape_svg_valid
- **Test**: tests/icons/test_shape_drawables.mjs::test_shape_css_valid
- **Test**: tests/icons/test_shape_drawables.mjs::test_shape_xaml_valid
- **Test**: tests/icons/test_shape_drawables.mjs::test_shape_manifest_complete
- **Method**: Unit Test
