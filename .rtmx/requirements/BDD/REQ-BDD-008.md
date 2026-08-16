# REQ-BDD-008: Range and bearing measurement Gherkin

## Description
ATAK core workflow specified as Gherkin so behavior can be checked the same way
on every platform. File: `specs/range-bearing.feature`.

Scenarios: Two-point measure, from self, mag/true, cancel after one point.

## Acceptance Criteria
- [x] `specs/range-bearing.feature` exists
- [x] Starts with `Feature:` and has at least four `Scenario:` blocks
- [x] Each scenario contains Given, When, and Then
- [x] Names design-system components in Then/And steps: RangeBearing

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
