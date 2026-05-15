# REQ-RCT-011: TakIcon Layer-List Renderer

## Description
An internal sub-component of TakIcon that renders layer-list drawables as composited layers using CSS absolute positioning. Each layer in the layer-list definition (from `data/atak-layer-lists.json`, produced by REQ-ICN-011) is rendered as a child element positioned within a containing `<div>` using `position: absolute` with `left`, `top`, `right`, `bottom` offsets converted from Android dp to CSS px. Each layer's drawable is resolved and rendered by the appropriate sub-renderer (ShapeRenderer for inline shapes, `<img>` for PNG/SVG references). The container `<div>` uses `position: relative` and is sized according to the TakIcon `size` prop.

## Acceptance Criteria
- [ ] An internal module `packages/react/src/components/TakIcon/LayerListRenderer.tsx` exists.
- [ ] Renders a container `<div>` with `position: relative` and dimensions from the `size` prop.
- [ ] Each layer is rendered as a child with `position: absolute` and `left`/`top`/`right`/`bottom` offsets.
- [ ] Layers are rendered in array order (index 0 is bottommost, last index is topmost), matching Android stacking.
- [ ] Layer drawable references (`@drawable/foo`) are resolved via the catalog and rendered using the correct sub-renderer.
- [ ] Inline shape definitions within layers are rendered using ShapeRenderer (REQ-RCT-009).
- [ ] Color references (`@color/foo`) are rendered as solid-fill `<div>` elements.
- [ ] Width and height constraints on individual layers are respected when present.
- [ ] Gravity values (`center`, `fill`, `top|left`, etc.) are mapped to CSS equivalents.
- [ ] All 36 layer-lists in `data/atak-layer-lists.json` render without error.

## Validation
- **Test**: tests/react/test_tak_icon.mjs::test_layer_list_stacking_order
- **Test**: tests/react/test_tak_icon.mjs::test_layer_list_offsets
- **Test**: tests/react/test_tak_icon.mjs::test_layer_list_inline_shape
- **Test**: tests/react/test_tak_icon.mjs::test_layer_list_all_render_no_error
- **Method**: Unit Test
