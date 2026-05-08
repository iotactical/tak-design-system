# REQ-APK-002: First Responder Iconset

## Description
The `assets/iconsets/iconset_responder.zip` archive contains 1,117 PNG icons covering first responder and emergency service domains including law enforcement, fire, EMS, hazmat, search and rescue, and public safety vehicles and personnel. This is the largest single iconset in ATAK and serves as the primary visual vocabulary for domestic emergency operations. This requirement covers extraction, cataloging by sub-domain, and production of SVG variants for cross-platform use in the TAK Design System.

## Acceptance Criteria
- [ ] All 1,117 PNGs are extracted from `iconset_responder.zip` and individually inventoried
- [ ] Each icon is categorized into its sub-domain (law enforcement, fire, EMS, hazmat, SAR, vehicles, personnel, infrastructure, other) based on the iconset.xml descriptor or filename convention
- [ ] A machine-readable manifest (JSON) is produced with fields: filename, sub-domain, original dimensions, MIL-STD-2525 affiliation mapping (if applicable), and description
- [ ] Each PNG is converted to an optimized SVG with consistent viewBox dimensions per sub-domain
- [ ] SVG icons preserve transparency and multi-color detail from the source PNGs
- [ ] The iconset.xml descriptor bundled in the ZIP is parsed and its group/category hierarchy is reflected in the manifest
- [ ] Icon names are normalized to kebab-case with sub-domain prefix to avoid namespace collisions
- [ ] A sprite sheet is generated for each sub-domain containing all icons at 32x32 reference size
- [ ] The manifest validates against the design system icon schema
- [ ] Extracted icon count matches exactly 1,117; any deviation fails the build

## Validation
- **Test**: tests/asset-packs/test_responder_iconset.mjs::test_extraction_count
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_responder_iconset.mjs::test_subdomain_categorization
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_responder_iconset.mjs::test_svg_conversion_complete
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_responder_iconset.mjs::test_manifest_schema_valid
- **Method**: Unit Test
