# REQ-BDD-003: Mission package import/export Gherkin

## Description
ATAK core workflow specified as Gherkin so behavior can be checked the same way
on every platform. File: `specs/mission-packages.feature`.

Scenarios: Import zip, export selection, server download, corrupt zip.

## Acceptance Criteria
- [x] `specs/mission-packages.feature` exists
- [x] Starts with `Feature:` and has at least four `Scenario:` blocks
- [x] Each scenario contains Given, When, and Then
- [x] Failure path is specified even when no React component exists for the workflow

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
