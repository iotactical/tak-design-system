# REQ-BDD-009: Bloodhound navigation line Gherkin

## Description
ATAK core workflow specified as Gherkin so behavior can be checked the same way
on every platform. File: `specs/bloodhound.feature`.

Scenarios: Start to marker, follow moving friendly, stop, no GPS.

## Acceptance Criteria
- [x] `specs/bloodhound.feature` exists
- [x] Starts with `Feature:` and has at least four `Scenario:` blocks
- [x] Each scenario contains Given, When, and Then
- [x] Failure path is specified even when no React component exists for the workflow

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
