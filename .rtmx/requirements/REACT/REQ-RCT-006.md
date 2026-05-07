# REQ-RCT-006: Theme Provider

## Description
TakThemeProvider must manage dark/light mode via React context.

## Acceptance Criteria
- [ ] Default mode is dark
- [ ] Sets data-tak-theme attribute on wrapper
- [ ] useThakTheme hook returns current mode
- [ ] useThakTheme hook returns toggle function
- [ ] Theme changes propagate to child components

## Validation
- **Test**: tests/react/test_theme.mjs::test_theme_provider
- **Method**: Unit Test
