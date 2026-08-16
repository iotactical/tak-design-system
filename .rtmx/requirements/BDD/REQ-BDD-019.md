# REQ-BDD-019: Go To coordinate Gherkin

## Description
ATAK core workflow specified as Gherkin so behavior can be checked the same way
on every platform. File: `specs/coordinate-goto.feature`.

Scenarios: Decimal degrees, MGRS, place marker, unparseable.

## Acceptance Criteria
- [x] `specs/coordinate-goto.feature` exists
- [x] Starts with `Feature:` and has at least four `Scenario:` blocks
- [x] Each scenario contains Given, When, and Then
- [x] Names design-system components in Then/And steps: CoordinateDisplay MarkerDetail

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
