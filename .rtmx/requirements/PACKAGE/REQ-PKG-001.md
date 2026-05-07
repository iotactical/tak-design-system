# REQ-PKG-001: Release Tarball Contents

## Description
Release tarball must contain all required artifacts for all platforms.

## Acceptance Criteria
- [ ] tokens/ directory included (3 JSON files)
- [ ] platforms/atak/res/ included (Android XML)
- [ ] platforms/atak/compose/generated/ included (Kotlin)
- [ ] platforms/web/generated/ included (CSS)
- [ ] platforms/vscode/generated/ included (theme JSON)
- [ ] packages/react/dist/ included (React library)
- [ ] data/ included (COT, MIL-STD-2525)
- [ ] icons/ included (role icons)
- [ ] LICENSE and README.md included

## Validation
- **Test**: tests/package/test_tarball.mjs::test_tarball_contents
- **Method**: Integration Test
