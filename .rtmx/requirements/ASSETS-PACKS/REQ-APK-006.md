# REQ-APK-006: Incident Management Iconset

## Description
The `assets/iconsets/iconset_incident_management.zip` archive contains 12 PNG icons for incident command system (ICS) operations including incident command posts, staging areas, helibases, camps, and division/group supervisors. These icons follow NIMS (National Incident Management System) symbology. This requirement covers extraction, cataloging, and SVG conversion for cross-platform use in the TAK Design System.

## Acceptance Criteria
- [ ] All 12 PNGs are extracted from `iconset_incident_management.zip` and individually inventoried
- [ ] Each icon is categorized by ICS function (command, operations, logistics, planning, finance/admin)
- [ ] A machine-readable manifest (JSON) is produced with fields: filename, ICS function, original dimensions, NIMS symbol reference (if applicable), and description
- [ ] Each PNG is converted to an optimized SVG with consistent viewBox dimensions
- [ ] SVGs preserve the ICS-standard color associations from the source PNGs
- [ ] The iconset.xml descriptor bundled in the ZIP is parsed and reflected in the manifest
- [ ] Icon names are normalized to kebab-case with `ics-` prefix
- [ ] The manifest validates against the design system icon schema
- [ ] Extracted icon count matches exactly 12; any deviation fails the build

## Validation
- **Test**: tests/asset-packs/test_incident_iconset.mjs::test_extraction_count
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_incident_iconset.mjs::test_ics_function_categorization
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_incident_iconset.mjs::test_svg_conversion_complete
- **Method**: Unit Test
- **Test**: tests/asset-packs/test_incident_iconset.mjs::test_manifest_schema_valid
- **Method**: Unit Test
