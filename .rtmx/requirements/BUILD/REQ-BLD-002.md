# REQ-BLD-002: Android XML Resource Generation

## Description
Build must produce valid Android XML resource files with correct format conventions.

## Acceptance Criteria
- [ ] platforms/atak/res/values/tak_colors.xml exists after build
- [ ] platforms/atak/res/values/tak_dimens.xml exists after build
- [ ] Color values use Android #AARRGGBB format
- [ ] Dimension values use dp units
- [ ] Resource names use snake_case with tak_ prefix

## Validation
- **Test**: tests/build/test_android.mjs::test_android_xml_output
- **Method**: Integration Test
