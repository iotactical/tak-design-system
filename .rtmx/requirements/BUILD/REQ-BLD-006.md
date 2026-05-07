# REQ-BLD-006: No CSS Double-Prefix Regression

## Description
CSS output must not contain the double-prefix bug (----tak-) that was previously fixed.

## Acceptance Criteria
- [ ] No occurrence of ----tak- in tak-tokens.css
- [ ] All prefixes are exactly --tak-

## Validation
- **Test**: tests/build/test_css.mjs::test_no_double_prefix
- **Method**: Unit Test
