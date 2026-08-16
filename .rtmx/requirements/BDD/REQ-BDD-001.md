# REQ-BDD-001: Self marker and SA broadcast Gherkin

## Description
ATAK core workflow specified as Gherkin so behavior can be checked the same way
on every platform. File: `specs/self-marker.feature`.

Scenarios: GPS placement, SA CoT, stale GPS, missing certificate.

## Acceptance Criteria
- [x] `specs/self-marker.feature` exists
- [x] Starts with `Feature:` and has at least four `Scenario:` blocks
- [x] Each scenario contains Given, When, and Then
- [x] Names design-system components in Then/And steps: SkittleMarker GPSStatus

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
