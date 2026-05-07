# REQ-TOK-004: Token Validation Script

## Description
The validate-tokens.mjs script must catch structural errors, missing types, invalid hex values, and unresolvable references.

## Acceptance Criteria
- [ ] npm run validate exits with code 0 on valid tokens
- [ ] Detects invalid JSON structure
- [ ] Detects missing $type annotations
- [ ] Detects invalid hex color values
- [ ] Detects unresolvable token references

## Validation
- **Test**: tests/tokens/test_validate.mjs::test_validate_passes
- **Method**: Unit Test
