# REQ-BDD-017: Pairing line between map items Gherkin

## Description
ATAK core workflow specified as Gherkin so behavior can be checked the same way
on every platform. File: `specs/pairing-line.feature`.

Scenarios: Create, follow moving end, delete, same-item refused.

## Acceptance Criteria
- [x] `specs/pairing-line.feature` exists
- [x] Starts with `Feature:` and has at least four `Scenario:` blocks
- [x] Each scenario contains Given, When, and Then
- [x] Failure path is specified even when no React component exists for the workflow

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
