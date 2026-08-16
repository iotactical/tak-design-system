# REQ-BDD-015: Radial menu on map items Gherkin

## Description
ATAK core workflow specified as Gherkin so behavior can be checked the same way
on every platform. File: `specs/radial-menu.feature`.

Scenarios: Open on marker, submenu, delete, dismiss.

## Acceptance Criteria
- [x] `specs/radial-menu.feature` exists
- [x] Starts with `Feature:` and has at least four `Scenario:` blocks
- [x] Each scenario contains Given, When, and Then
- [x] Names design-system components in Then/And steps: RadialMenu

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
