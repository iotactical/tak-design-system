# REQ-BDD-022: Contacts roster and callsign lookup Gherkin

## Description
ATAK core workflow specified as Gherkin so behavior can be checked the same way
on every platform. File: `specs/contacts.feature`.

Scenarios: List, pan to, start chat, stale contact.

## Acceptance Criteria
- [x] `specs/contacts.feature` exists
- [x] Starts with `Feature:` and has at least four `Scenario:` blocks
- [x] Each scenario contains Given, When, and Then
- [x] Names design-system components in Then/And steps: UserList ChatPanel

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
