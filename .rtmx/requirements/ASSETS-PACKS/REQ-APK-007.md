# REQ-APK-007: Landing Point Tactical Icons

## Description
The `assets/lpticons/` directory contains 217 PNG icons used for helicopter landing zone (HLZ) designation, aircraft type identification, and colored tactical markers. These icons appear on the ATAK map when users designate landing points, mark aircraft positions, or place color-coded reference markers. This requirement covers cataloging the full set and producing SVG variants for cross-platform use in the TAK Design System.

## Acceptance Criteria
- [ ] All 217 PNGs in `assets/lpticons/` are inventoried in a machine-readable manifest (JSON) with fields: filename, category, original dimensions, and description
- [ ] Icons are categorized into sub-groups: helicopter landing zones, aircraft type silhouettes, colored markers, and directional indicators
- [ ] Each PNG is converted to an optimized SVG with consistent viewBox dimensions
- [ ] Landing zone icons include anchor-point metadata (center point for map placement) in the manifest
- [ ] Colored marker variants are grouped by base shape with a `color` field in the manifest identifying each variant
- [ ] Aircraft type silhouettes include a `platform_id` field linking to the air platform iconset (REQ-APK-004) where overlap exists
- [ ] SVGs preserve transparency and fine detail required for map overlay rendering at small sizes (24x24 minimum legibility)
- [ ] Icon names are normalized to kebab-case with `lpt-` prefix
- [ ] The manifest validates against the design system icon schema
- [ ] Inventoried icon count matches exactly 217; any deviation fails the build

## Validation
- **Test**: tests/asset-packs/test_lpt_icons.mjs::test_lpt_inventory_count
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_lpt_icons.mjs::test_lpt_categorization
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_lpt_icons.mjs::test_svg_conversion_complete
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_lpt_icons.mjs::test_manifest_schema_valid
- **Method**: Unit Test
