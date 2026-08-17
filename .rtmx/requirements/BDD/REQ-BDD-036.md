# REQ-BDD-036: Brightness, Night Vision, and globe rendering Gherkin

## Description
ATAK core tool specified as Gherkin from SUM prose and Settings XML so behavior
can be checked the same way on every platform. File: `specs/device-tools.feature`.

Scenarios: Brightness Night Vision compass ring globe.

## Acceptance Criteria
- [x] `specs/device-tools.feature` exists
- [x] Starts with `Feature:` and has at least four `Scenario:` blocks
- [x] Each scenario contains Given, When, and Then
- [x] Each scenario quotes ATAK_SUM.typ 5.5 with `# SUM:` (REQ-SITE-044)

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
