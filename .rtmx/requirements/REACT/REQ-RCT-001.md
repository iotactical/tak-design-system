# REQ-RCT-001: Button Component

## Description
Button component must render with primary, secondary, and danger variants using TAK design tokens.

## Acceptance Criteria
- [ ] Primary variant renders with blue background and white text
- [ ] Secondary variant renders with transparent background and blue text
- [ ] Danger variant renders with red background and white text
- [ ] Supports className merging
- [ ] Extends HTMLButtonElement props
- [ ] Accessible (proper button semantics)

## Validation
- **Test**: tests/react/test_button.mjs::test_button_variants
- **Method**: Unit Test
