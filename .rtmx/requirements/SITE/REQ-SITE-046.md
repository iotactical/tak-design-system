# REQ-SITE-046: Comprehensive Gherkin for every catalogued ATAK SUM feature

## Description
REQ-SITE-045 names every ATAK Civilian Software User Manual feature. Operators
cannot check WinTAK, WebTAK, or `@iotactical/tak-react` against a heading unless
that heading has Gherkin. This requirement is that coverage: every row in
`data/atak-sum-features.json` maps to a parseable `specs/*.feature` file that
already satisfies REQ-SITE-044 (SUM quote, component, CoT, intent, preference).

Preference coverage is workflows plus one Scenario per key (REQ-SITE-047).
`specs/preferences.feature` specifies Settings screens, load/save, hide,
encryption passphrase, Unit Display Format, and Show All.
`specs/preference-keys.feature` is generated so every catalog key is a named
Scenario. Individual tools still cite the keys the SUM Settings path names.

## Approach
- Register remaining SUM chapters as Gherkin: Overview, Red X, Radio Controls,
  Chat inbox, Lasso, Digital Pointer, Contour Lines, Resection, Rubber Sheet,
  Toolbar Manager, Clear Content, TAK Package Management / Other Features, and
  Preferences
- Expand Overlay Manager, Drawing Tools, Maps and Favorites, Bloodhound,
  Elevation Tools, Radial Menus, Overview, and Preferences so SUM-prose tools
  (heatmap, extrude, WMS, Fine Adjust, Dataset Instructions, load/save prefs)
  have scenarios
- Add Gherkin for Additional Tools that Settings XML documents even when the
  SUM has no dedicated chapter: brightness/night vision, LRF/Bluetooth, and
  Vehicle Models
- Keep plugin-only tools (Jumpmaster, SSE, GeoCam) out of the catalog
- Discover catalog files from `data/atak-sum-features.json` in tests; fail if a
  heading’s spec is missing or unregistered

## Acceptance Criteria
- [x] Every `spec` in `data/atak-sum-features.json` exists under `specs/`
- [x] Every such file is in the BDD catalog enforced by `tests/bdd/test_gherkin.mjs`
- [x] New chapter files have at least four Scenario blocks with Given/When/Then
      and `# SUM:` quotations from ATAK_SUM.typ 5.5
- [x] `specs/preferences.feature` covers encryption passphrase, hiding a
      preference, toolbar/action-bar prefs, and the catalog of keys
- [x] Preference keys cited in Gherkin exist in `data/atak-preferences.json`
- [x] Every catalogued preference key has a Scenario (REQ-SITE-047)

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
