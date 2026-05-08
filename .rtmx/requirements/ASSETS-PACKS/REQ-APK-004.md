# REQ-APK-004: Air Platform Iconset

## Description
The `assets/iconsets/iconset_ps_air.zip` archive contains 51 PNG icons representing air platforms including fixed-wing aircraft, rotary-wing aircraft, UAVs/drones, and airborne sensor packages. These icons are used in ATAK for airspace deconfliction, air asset tracking, and combined arms coordination. This requirement covers extraction, cataloging, and SVG conversion for cross-platform use in the TAK Design System.

## Acceptance Criteria
- [ ] All 51 PNGs are extracted from `iconset_ps_air.zip` and individually inventoried
- [ ] Each icon is categorized by air platform type (fixed-wing, rotary-wing, UAV, sensor, other)
- [ ] A machine-readable manifest (JSON) is produced with fields: filename, platform type, original dimensions, and description
- [ ] Each PNG is converted to an optimized SVG with consistent viewBox dimensions
- [ ] SVGs preserve orientation indicators (nose direction, heading reference) from the source PNGs
- [ ] The iconset.xml descriptor bundled in the ZIP is parsed and reflected in the manifest
- [ ] Icon names are normalized to kebab-case with `air-` prefix
- [ ] Icons that represent the same platform at different altitudes or states are linked in the manifest via a `variant_group` field
- [ ] The manifest validates against the design system icon schema
- [ ] Extracted icon count matches exactly 51; any deviation fails the build

## Validation
- **Test**: tests/asset-packs/test_air_iconset.mjs::test_extraction_count
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_air_iconset.mjs::test_platform_type_categorization
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_air_iconset.mjs::test_svg_conversion_complete
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_air_iconset.mjs::test_manifest_schema_valid
- **Method**: Unit Test
