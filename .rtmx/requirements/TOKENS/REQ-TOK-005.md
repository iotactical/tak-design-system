# REQ-TOK-005: MIL-STD-2525 Affiliation Color Compliance

## Description
Affiliation colors must comply with MIL-STD-2525 / APP-6 standards for force identification.

## Acceptance Criteria
- [ ] Friendly = Blue (#2196F3)
- [ ] Hostile = Red (#F44336)
- [ ] Neutral = Green (#4CAF50)
- [ ] Unknown = Yellow (#FFEB3B)
- [ ] Suspect/Joker/Faker = Orange (#FF9800)
- [ ] Pending = Yellow-700 (#FBC02D)

## Validation
- **Test**: tests/tokens/test_milstd.mjs::test_affiliation_colors
- **Method**: Unit Test
