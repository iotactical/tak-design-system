# REQ-SITE-004: Platform Output Reference

## Description
Reference pages showing generated output for each platform target (Android XML,
Jetpack Compose, CSS, VS Code, WPF XAML, mil-sym bridge). Developers can see
exactly what their platform receives from the design system.

## Acceptance Criteria
- [ ] Android XML resources viewable (tak_colors.xml, tak_dimens.xml)
- [ ] Compose Kotlin constants viewable (TakColors.kt)
- [ ] CSS custom properties viewable (tak-tokens.css)
- [ ] VS Code theme preview
- [ ] mil-sym color bridge output for all 3 platforms
- [ ] Copy-to-clipboard for platform-specific code snippets

## Validation
- **Test**: tests/site/test_platform_reference.mjs::test_platform_pages
- **Method**: Integration Test
