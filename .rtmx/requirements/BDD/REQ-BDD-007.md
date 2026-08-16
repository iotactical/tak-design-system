# REQ-BDD-007: Overlay hierarchy visibility Gherkin

## Description
ATAK core workflow specified as Gherkin so behavior can be checked the same way
on every platform. File: `specs/overlay-hierarchy.feature`.

Scenarios: Hide parent, mixed child, zoom to, locked system overlay.

## Acceptance Criteria
- [x] `specs/overlay-hierarchy.feature` exists
- [x] Starts with `Feature:` and has at least four `Scenario:` blocks
- [x] Each scenario contains Given, When, and Then
- [x] Failure path is specified even when no React component exists for the workflow

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
