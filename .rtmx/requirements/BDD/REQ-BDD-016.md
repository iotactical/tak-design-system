# REQ-BDD-016: GPS status and coordinate formats Gherkin

## Description
ATAK core workflow specified as Gherkin so behavior can be checked the same way
on every platform. File: `specs/gps-location.feature`.

Scenarios: HUD status, MGRS/UTM/DD cycle, copy, no-fix.

## Acceptance Criteria
- [x] `specs/gps-location.feature` exists
- [x] Starts with `Feature:` and has at least four `Scenario:` blocks
- [x] Each scenario contains Given, When, and Then
- [x] Names design-system components in Then/And steps: GPSStatus CoordinateDisplay

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
