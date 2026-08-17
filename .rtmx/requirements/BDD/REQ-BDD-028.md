# REQ-BDD-028: Digital Pointer SPI tools Gherkin

## Description
ATAK Civilian Software User Manual chapter specified as Gherkin so behavior can
be checked the same way on every platform. File: `specs/digital-pointer.feature`.

Scenarios: Place SPI radial GoTo MGRS legacy DPs.

## Acceptance Criteria
- [x] `specs/digital-pointer.feature` exists
- [x] Starts with `Feature:` and has at least four `Scenario:` blocks
- [x] Each scenario contains Given, When, and Then
- [x] Each scenario quotes ATAK_SUM.typ 5.5 with `# SUM:` (REQ-SITE-044)

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
