# REQ-APK-003: FalconView Iconset

## Description
The `assets/iconsets/iconset_falconview.zip` archive contains 489 PNG icons derived from the FalconView mapping and geospatial intelligence application. These icons represent military and intelligence mapping symbology including waypoints, threat areas, routes, observation posts, and terrain features. This requirement covers extraction, cataloging, and SVG conversion for cross-platform use in the TAK Design System.

## Acceptance Criteria
- [ ] All 489 PNGs are extracted from `iconset_falconview.zip` and individually inventoried
- [ ] Each icon is categorized by FalconView functional group (waypoints, threats, routes, terrain, overlays, other) based on the iconset.xml descriptor or filename convention
- [ ] A machine-readable manifest (JSON) is produced with fields: filename, functional group, original dimensions, and description
- [ ] Each PNG is converted to an optimized SVG with consistent viewBox dimensions
- [ ] SVGs preserve the source color palette and transparency data
- [ ] The iconset.xml descriptor bundled in the ZIP is parsed and its hierarchy is reflected in the manifest
- [ ] Icon names are normalized to kebab-case with `fv-` prefix to distinguish from other iconsets
- [ ] Any icons with identical visual content to the responder iconset are flagged as duplicates in the manifest but retained with their FalconView-specific naming
- [ ] The manifest validates against the design system icon schema
- [ ] Extracted icon count matches exactly 489; any deviation fails the build

## Validation
- **Test**: tests/asset-packs/test_falconview_iconset.mjs::test_extraction_count
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_falconview_iconset.mjs::test_functional_group_categorization
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_falconview_iconset.mjs::test_svg_conversion_complete
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_falconview_iconset.mjs::test_manifest_schema_valid
- **Method**: Unit Test
