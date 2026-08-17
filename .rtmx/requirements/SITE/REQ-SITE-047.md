# REQ-SITE-047: One Gherkin Scenario per catalogued preference key

## Description
REQ-SITE-045 names every ATAK preference key. REQ-SITE-046 covers Settings as
workflows. Operators and tests still cannot ask “is `bloodhound_outer_eta` in
Gherkin?” without grepping tool files. This requirement is a generated Scenario
list: one `Scenario:` per row in `data/atak-preferences.json`.

Bodies are templates by `kind` (setting, screen, category, xml-alias). Hideable
keys include a hide-row step. Tool-specific behavior stays in the chapter
feature files (Bloodhound ETA flash, load/save, and so on).

## Approach
- Generate `specs/preference-keys.feature` from the catalog via
  `scripts/generate-preference-key-scenarios.mjs`
- Fail the test if the generated file is stale
- Register the file in the BDD catalog (REQ-BDD-039)

## Acceptance Criteria
- [x] `specs/preference-keys.feature` contains one `Scenario:` per catalog key
- [x] Every catalog `key` appears as `preference "…"` in that file
- [x] Hideable keys cite their `hidePreferenceItem_` name
- [x] Tests fail if the catalog grows and the feature is not regenerated

## Validation
- **Test**: tests/bdd/test_sum_catalog.mjs
- **Method**: Unit Test
