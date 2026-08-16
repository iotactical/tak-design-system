# REQ-BDD-011: Attachments and Quick Pic Gherkin

## Description
ATAK core workflow specified as Gherkin so behavior can be checked the same way
on every platform. File: `specs/attachments.feature`.

Scenarios: Quick Pic, existing file, server transfer, unsupported type.

## Acceptance Criteria
- [x] `specs/attachments.feature` exists
- [x] Starts with `Feature:` and has at least four `Scenario:` blocks
- [x] Each scenario contains Given, When, and Then
- [x] Names design-system components in Then/And steps: MarkerDetail

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
