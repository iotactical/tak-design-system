# REQ-BDD-002: Icon palette selection Gherkin

## Description
ATAK core workflow specified as Gherkin so behavior can be checked the same way
on every platform. File: `specs/icon-palettes.feature`.

Scenarios: Place from palette, switch iconset, label/color, unknown icon.

## Acceptance Criteria
- [x] `specs/icon-palettes.feature` exists
- [x] Starts with `Feature:` and has at least four `Scenario:` blocks
- [x] Each scenario contains Given, When, and Then
- [x] Names design-system components in Then/And steps: TakIcon

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
