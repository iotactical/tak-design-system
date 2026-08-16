# REQ-BDD-010: Drawing tools and tactical graphics Gherkin

## Description
ATAK core workflow specified as Gherkin so behavior can be checked the same way
on every platform. File: `specs/drawing-tools.feature`.

Scenarios: Polyline, filled polygon, 2525 graphic, too few vertices.

## Acceptance Criteria
- [x] `specs/drawing-tools.feature` exists
- [x] Starts with `Feature:` and has at least four `Scenario:` blocks
- [x] Each scenario contains Given, When, and Then
- [x] Failure path is specified even when no React component exists for the workflow

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
