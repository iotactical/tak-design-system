# REQ-BDD-014: Viewshed and elevation analysis Gherkin

## Description
ATAK core workflow specified as Gherkin so behavior can be checked the same way
on every platform. File: `specs/viewshed.feature`.

Scenarios: Compute, recompute after move, elevation tap, missing DTED.

## Acceptance Criteria
- [x] `specs/viewshed.feature` exists
- [x] Starts with `Feature:` and has at least four `Scenario:` blocks
- [x] Each scenario contains Given, When, and Then
- [x] Names design-system components in Then/And steps: CoordinateDisplay

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
