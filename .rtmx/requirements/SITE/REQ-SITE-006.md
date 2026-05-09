# REQ-SITE-006: Palette Icon Rendering Fix

## Description
Many palette icons are not displaying on the GitHub Pages site. The SQLite-
extracted PNGs exist in site/public/palettes/ (2,031 files) but the Palettes
page tab rendering needs to correctly resolve the image paths grouped by
iconset and sub-group, matching the manifest JSON structure.

For non-SQLite palettes (Responder, FalconView, PS Air, Incident, GeoOps),
the actual PNG files need to be extracted from the ATAK iconset ZIPs into
site/public/palettes/ so the browser can render them.

## Acceptance Criteria
- [ ] All 6 SQLite palette icons render in their respective tabs
- [ ] All 5 ZIP-based palette icons extracted and render
- [ ] Fallback placeholder for any icons that fail to load
- [ ] Icon count matches manifest for each palette
- [ ] Grouped by sub-category within each palette tab

## Validation
- **Test**: tests/site/test_palette_rendering.mjs::test_palette_icons_render
- **Method**: Integration Test
