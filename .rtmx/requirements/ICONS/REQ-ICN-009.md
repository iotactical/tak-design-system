# REQ-ICN-009: ATAK Location Entry Marker Set

## Description
Extract and convert the 46 `enter_location_*` colored marker drawables used in ATAK for point-of-interest and coordinate entry. These markers appear when a user taps the map to place a point, select a destination, or define a waypoint. Each marker is color-coded to indicate purpose (e.g., red for hostile, blue for friendly, green for start, yellow for caution). The design system must provide these as SVG markers with parameterized color fills so that cross-platform map renderers can display identical point-entry affordances. The markers must work as both standalone SVG files and as map marker overlays with proper anchor points.

## Acceptance Criteria
- [ ] A directory `icons/svg/markers/` contains exactly 46 SVG files corresponding to every `enter_location_*` drawable in ATAK.
- [ ] Each SVG includes a metadata comment or a companion `marker-anchors.json` specifying the anchor point (the pixel coordinate that aligns with the map location) as `anchorX` and `anchorY` in fractional viewport units (0.0 to 1.0).
- [ ] Markers that are color variants of the same base shape share a common template; the `marker-anchors.json` groups them by `baseShape` and lists their `colorVariant` token.
- [ ] Color fills use design-token references from the semantic color layer (e.g., `{color.marker.hostile}`, `{color.marker.friendly}`).
- [ ] Each SVG renders correctly at 24px, 32px, and 48px heights without loss of detail.
- [ ] SVGs do not contain embedded raster images.
- [ ] A manifest file `icons/svg/markers/manifest.json` indexes all 46 markers with: `name`, `file`, `baseShape`, `colorToken`, `anchorX`, `anchorY`, `atakSourceFile`.
- [ ] The manifest groups markers by base shape and lists all color variants per group.
- [ ] SVGO optimization is applied; each file is under 3 KB.

## Validation
- **Test**: tests/icons/test_location_markers.mjs::test_marker_count
- **Test**: tests/icons/test_location_markers.mjs::test_marker_anchor_defined
- **Test**: tests/icons/test_location_markers.mjs::test_marker_color_tokens
- **Test**: tests/icons/test_location_markers.mjs::test_marker_no_embedded_raster
- **Test**: tests/icons/test_location_markers.mjs::test_marker_manifest_complete
- **Test**: tests/icons/test_location_markers.mjs::test_marker_file_size
- **Method**: Unit Test
