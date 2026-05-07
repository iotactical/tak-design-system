# REQ-AST-002: COT Icon Filter Mapping

## Description
Cursor on Target icon filter XML must be valid and map COT types to icon resources.

## Acceptance Criteria
- [ ] data/cot/icon_filters.xml is valid XML
- [ ] 50+ filter mappings present
- [ ] Maps tactical codes (b-m-p-*, b-a-g, etc.) to icon PNGs

## Validation
- **Test**: tests/assets/test_cot.mjs::test_icon_filters_valid
- **Method**: Unit Test
