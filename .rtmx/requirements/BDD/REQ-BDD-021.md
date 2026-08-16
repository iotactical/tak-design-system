# REQ-BDD-021: Fires and 9-line CAS Gherkin

## Description
ATAK core workflow specified as Gherkin so behavior can be checked the same way
on every platform. File: `specs/fires.feature`.

Scenarios: Start from marker, transmit, CFF from RB, missing line 6.

## Acceptance Criteria
- [x] `specs/fires.feature` exists
- [x] Starts with `Feature:` and has at least four `Scenario:` blocks
- [x] Each scenario contains Given, When, and Then
- [x] Names design-system components in Then/And steps: NineLineForm RangeBearing

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
