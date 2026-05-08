# REQ-APK-001: ATAK Core Asset Icon Inventory

## Description
The ATAK `assets/icons/` directory contains approximately 300 loose PNG icons used across the application for CoT (Cursor on Target) map markers, altitude indicators in 16 color variants, tool palette icons, file-type icons, and miscellaneous UI glyphs. This requirement covers cataloging every icon by name, category, and original pixel dimensions, then converting each to a scalable SVG variant suitable for cross-platform rendering in the TAK Design System.

## Acceptance Criteria
- [ ] Every PNG in `assets/icons/` is inventoried in a machine-readable manifest (JSON) with fields: filename, category, original width, original height, and color depth
- [ ] Each PNG is converted to an optimized SVG retaining visual fidelity at 1x, 2x, and 4x reference sizes
- [ ] SVG output passes SVGO optimization with no visual regression versus the source PNG at 64x64 reference
- [ ] Altitude indicator icons are grouped by their 16 color variants and validated for consistent geometry across all colors
- [ ] CoT map marker icons include correct anchor-point metadata (center, bottom-center, or custom offset) in the manifest
- [ ] Tool icons and file-type icons are tagged with their functional category in the manifest
- [ ] The manifest JSON validates against the design system icon schema (`schemas/icon-manifest.schema.json`)
- [ ] No icon filename collisions exist when flattened into a single namespace with category prefix
- [ ] Total SVG bundle size does not exceed 2x the aggregate original PNG size
- [ ] All converted SVGs render without error in Chrome, Firefox, Safari, and Android WebView

## Validation
- **Test**: tests/asset-packs/test_core_icons.mjs::test_core_icon_inventory_complete
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_core_icons.mjs::test_svg_conversion_fidelity
- **Method**: Visual Regression Test
- **Test**: tests/asset-packs/test_core_icons.mjs::test_manifest_schema_valid
- **Method**: Unit Test
