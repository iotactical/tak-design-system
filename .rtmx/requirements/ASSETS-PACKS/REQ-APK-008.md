# REQ-APK-008: ATAK Font Bundle

## Description
The `assets/fonts/` directory contains four font files used throughout ATAK: Digital.ttf and Digital-Bold.ttf (seven-segment digital display style for altitude/speed readouts) and Roboto-Bold.ttf and Roboto-Condensed.ttf (UI text rendering). This requirement covers licensing verification, format conversion for cross-platform use, and packaging as a design system font bundle with appropriate font-face declarations and design tokens.

## Acceptance Criteria
- [ ] All four font files (Digital.ttf, Digital-Bold.ttf, Roboto-Bold.ttf, Roboto-Condensed.ttf) are inventoried with metadata: family name, style, weight, license type, and glyph count
- [ ] License compatibility is verified for each font and documented (Apache 2.0 for Roboto, license TBD for Digital fonts)
- [ ] Each TTF is converted to WOFF2 format for web platform use
- [ ] CSS @font-face declarations are generated for all four fonts with appropriate weight and style mappings
- [ ] Design tokens are produced mapping semantic names (font-family-display, font-family-ui, font-family-ui-condensed) to the bundled fonts
- [ ] Font subsetting is applied to remove unused glyphs where license permits, targeting Latin + common symbols
- [ ] The Digital font pair renders numeric characters 0-9, decimal point, colon, and minus sign correctly across platforms
- [ ] The Roboto font pair renders the full Latin-1 character set without missing glyph fallbacks
- [ ] Font loading performance is validated: combined WOFF2 bundle does not exceed 500 KB
- [ ] A font specimen page or test fixture demonstrates all four fonts at reference sizes (12px, 16px, 24px, 48px)

## Validation
- **Test**: tests/asset-packs/test_font_bundle.mjs::test_font_inventory_complete
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_font_bundle.mjs::test_woff2_conversion
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_font_bundle.mjs::test_font_face_declarations
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_font_bundle.mjs::test_font_bundle_size
- **Method**: Unit Test
