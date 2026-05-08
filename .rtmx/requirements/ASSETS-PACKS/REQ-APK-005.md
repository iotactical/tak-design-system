# REQ-APK-005: Wildfire Management Iconset

## Description
The `assets/iconsets/iconset_wildfire.zip` archive contains 48 PNG icons specific to wildfire management operations including fire perimeters, hot spots, drop points, helispots, incident command posts, safety zones, and resource staging areas. These icons follow NWCG (National Wildfire Coordinating Group) symbology conventions. This requirement covers extraction, cataloging, and SVG conversion for cross-platform use in the TAK Design System.

## Acceptance Criteria
- [ ] All 48 PNGs are extracted from `iconset_wildfire.zip` and individually inventoried
- [ ] Each icon is categorized by NWCG functional role (fire behavior, infrastructure, resources, hazards, other)
- [ ] A machine-readable manifest (JSON) is produced with fields: filename, NWCG category, original dimensions, NWCG symbol reference (if applicable), and description
- [ ] Each PNG is converted to an optimized SVG with consistent viewBox dimensions
- [ ] SVGs preserve the NWCG-standard color coding (red for active fire, yellow for caution, green for safe zones)
- [ ] The iconset.xml descriptor bundled in the ZIP is parsed and reflected in the manifest
- [ ] Icon names are normalized to kebab-case with `wf-` prefix
- [ ] The manifest validates against the design system icon schema
- [ ] Extracted icon count matches exactly 48; any deviation fails the build

## Validation
- **Test**: tests/asset-packs/test_wildfire_iconset.mjs::test_extraction_count
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_wildfire_iconset.mjs::test_nwcg_categorization
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_wildfire_iconset.mjs::test_svg_conversion_complete
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_wildfire_iconset.mjs::test_manifest_schema_valid
- **Method**: Unit Test
