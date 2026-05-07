# REQ-BLD-004: CSS Custom Properties Generation

## Description
Build must produce CSS file with root-level custom properties using --tak- prefix.

## Acceptance Criteria
- [ ] platforms/web/generated/tak-tokens.css exists after build
- [ ] All variables use --tak- prefix
- [ ] Variables declared under :root selector
- [ ] All token types represented (colors, dimensions, typography)

## Validation
- **Test**: tests/build/test_css.mjs::test_css_output
- **Method**: Integration Test
