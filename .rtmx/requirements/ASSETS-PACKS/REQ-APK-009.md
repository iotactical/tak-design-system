# REQ-APK-009: ATAK Map Tile Style Definitions

## Description
The `assets/style/` directory contains map tile style definitions with `omt/` (OpenMapTiles) and `rbt/` (Raster Base Tiles) subdirectories providing bright, dark, and overlay rendering variants. These styles control how base map tiles are rendered in ATAK including road colors, terrain shading, label placement, water features, and building footprints. This requirement covers converting these ATAK-specific style definitions into cross-platform style specifications usable by MapLibre GL, Mapbox GL, and Leaflet-based renderers in the TAK Design System.

## Acceptance Criteria
- [ ] All style files in `assets/style/omt/` and `assets/style/rbt/` are inventoried with metadata: filename, variant (bright/dark/overlay), tile source type, and layer count
- [ ] Each style variant (bright, dark, overlay) is parsed and converted to a MapLibre GL Style Specification JSON
- [ ] Bright variant provides high-contrast daytime rendering with light backgrounds and dark labels
- [ ] Dark variant provides low-light/nighttime rendering with dark backgrounds and light labels suitable for NVG-adjacent use
- [ ] Overlay variant provides a transparent-background style for compositing over satellite or terrain imagery
- [ ] Color palettes for each variant are extracted as design tokens (map-bg-bright, map-road-bright, map-label-bright, etc.)
- [ ] Style definitions reference the design system color tokens rather than hardcoded hex values
- [ ] Layer ordering (z-index) is preserved from the original ATAK styles
- [ ] Font references in label layers are updated to use the TAK Design System font bundle (REQ-APK-008)
- [ ] Each converted style validates against the MapLibre GL Style Specification schema
- [ ] A visual test fixture renders a reference tile (zoom 14, urban area) for each variant and compares against a baseline screenshot

## Validation
- **Test**: tests/asset-packs/test_map_styles.mjs::test_style_inventory_complete
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_map_styles.mjs::test_maplibre_schema_valid
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_map_styles.mjs::test_color_token_extraction
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_map_styles.mjs::test_variant_rendering
- **Method**: Visual Regression Test
