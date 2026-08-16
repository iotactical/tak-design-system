# REQ-BDD-020: Video stream playback Gherkin

## Description
ATAK core workflow specified as Gherkin so behavior can be checked the same way
on every platform. File: `specs/video-stream.feature`.

Scenarios: Open from marker, alias list, add alias, unreachable.

## Acceptance Criteria
- [x] `specs/video-stream.feature` exists
- [x] Starts with `Feature:` and has at least four `Scenario:` blocks
- [x] Each scenario contains Given, When, and Then
- [x] Failure path is specified even when no React component exists for the workflow

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
