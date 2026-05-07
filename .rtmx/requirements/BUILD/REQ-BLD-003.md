# REQ-BLD-003: Jetpack Compose Kotlin Generation

## Description
Build must produce valid Kotlin object with Color constants for Jetpack Compose.

## Acceptance Criteria
- [ ] platforms/atak/compose/generated/TakColors.kt exists after build
- [ ] Package declaration is co.iotactical.tak.designsystem
- [ ] Imports androidx.compose.ui.graphics.Color
- [ ] All color tokens present as val properties
- [ ] RGBA to AARRGGBB conversion is correct

## Validation
- **Test**: tests/build/test_compose.mjs::test_compose_kotlin_output
- **Method**: Integration Test
