# REQ-BDD-006: Map orientation and compass Gherkin

## Description
ATAK core workflow specified as Gherkin so behavior can be checked the same way
on every platform. File: `specs/map-orientation.feature`.

Scenarios: North-up, track-up, 3D tilt, uncalibrated magnetic.

## Acceptance Criteria
- [x] `specs/map-orientation.feature` exists
- [x] Starts with `Feature:` and has at least four `Scenario:` blocks
- [x] Each scenario contains Given, When, and Then
- [x] Names design-system components in Then/And steps: CompassHeading

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
