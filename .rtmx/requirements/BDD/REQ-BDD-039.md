# REQ-BDD-039: One Gherkin Scenario per ATAK preference key

## Description
Generated Gherkin so every SharedPreferences key in
`data/atak-preferences.json` is a named Scenario. File:
`specs/preference-keys.feature`.

## Acceptance Criteria
- [x] `specs/preference-keys.feature` exists
- [x] Starts with `Feature:` and has 514 `Scenario:` blocks matching the catalog
- [x] Each scenario contains Given, When, and Then
- [x] Each scenario quotes ATAK_SUM.typ 5.5 with `# SUM:` (REQ-SITE-044)

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
