# REQ-BDD-013: Emergency alert broadcast Gherkin

## Description
ATAK core workflow specified as Gherkin so behavior can be checked the same way
on every platform. File: `specs/emergency-alert.feature`.

Scenarios: Trigger 911, cancel, remote emergency, no GPS or network.

## Acceptance Criteria
- [x] `specs/emergency-alert.feature` exists
- [x] Starts with `Feature:` and has at least four `Scenario:` blocks
- [x] Each scenario contains Given, When, and Then
- [x] Names design-system components in Then/And steps: UserList

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
