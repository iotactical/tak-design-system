# REQ-SITE-045: Every ATAK SUM feature and preference is defined

## Description
Gherkin files quoted SUM instructions (REQ-SITE-044) but the catalog did not
enumerate every Software User Manual feature or every preference. The hide list
alone is incomplete: it names items that can be hidden, not every Settings key
ATAK actually registers.

This requirement defines machine-readable catalogs derived from ATAK-CIV `main`:

1. **Features** from `atak/docs/user_manual/ATAK_SUM.typ` (version 5.5) plus
   Settings screens and core tools the SUM describes in prose or that have
   dedicated `res/xml` preference screens (Brightness, Night Vision, LRF,
   Bluetooth, Vehicle Models, WMS, Fine Adjust, Heatmap, Terrain Slope)
2. **Preferences (hideable)** from `atak/docs/SupportedPreferenceDisable.txt`
3. **Preferences (all keys)** from every `android:key` in
   `atak/ATAK/app/src/main/res/xml/*.xml`, unioned with the hide list
4. **Preference screens** from those XML files, one row per file

## Approach
- Store headings in `data/atak-sum-features.json`
- Store the unioned preference inventory in `data/atak-preferences.json`
- Store XML screens in `data/atak-preference-screens.json`
- `data/atak-preference-keys.json` is the unique-key projection for Gherkin
- Pin source URLs to TAK Product Center `main`
- Jumpmaster, SSE, and GeoCam remain plugin products outside Civil SUM core

## Acceptance Criteria
- [x] `data/atak-sum-features.json` lists all 31 SUM chapters
- [x] Settings screens and SUM-prose tools (heatmap, vehicle models, Fine
      Adjust, Dataset Instructions, WMS, brightness, night vision, LRF) are
      catalogued with a Gherkin spec
- [x] `data/atak-preferences.json` includes every SupportedPreferenceDisable
      hide key and every `android:key` from preference XML (≥500 unique keys)
- [x] `data/atak-preference-screens.json` lists every `res/xml` file
- [x] Preference keys are unique; hide keys that exist are unique
- [x] Tests fail if a catalogued spec file is missing from `specs/`

## Validation
- **Test**: tests/bdd/test_sum_catalog.mjs
- **Method**: Unit Test
