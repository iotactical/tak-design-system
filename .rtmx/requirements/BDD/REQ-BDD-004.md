# REQ-BDD-004: Map layer management Gherkin

## Description
ATAK core workflow specified as Gherkin so behavior can be checked the same way
on every platform. File: `specs/map-layers.feature`.

Scenarios: Select imagery, toggle GRG, zoom to extent, unreadable layer.

## Acceptance Criteria
- [x] `specs/map-layers.feature` exists
- [x] Starts with `Feature:` and has at least four `Scenario:` blocks
- [x] Each scenario contains Given, When, and Then
- [x] Failure path is specified even when no React component exists for the workflow

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
