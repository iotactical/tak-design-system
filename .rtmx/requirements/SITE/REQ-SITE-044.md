# REQ-SITE-044: Gherkin scenarios follow the Software User Manual and name platform mappings

## Description
Catalog files under `specs/` described TAK-like workflows in inventable language
(tap, send, fail). Operators do not follow that script. They follow the ATAK
Civilian Software User Manual: [Point Dropper], [North Arrow], Overlay Manager,
radial options, Settings paths.

Each Scenario must be one SUM instruction (quoted in a `# SUM:` comment). Each
file must then map those instructions onto the four platform surfaces this
design system actually holds:

1. **UI component** in `@iotactical/tak-react` when one exists
2. **CoT type** the instruction produces or consumes
3. **Intent action** from `data/atak-intents.json`
4. **Preference key** the SUM Settings path corresponds to

Without that mapping the feature files cannot be used to check WinTAK, WebTAK,
or the React chrome against ATAK.

## Approach
- Cite `Source: ATAK Civilian Software User Manual` and the SUM section on the
  Feature line
- One `# SUM:` quotation per Scenario, taken from Placement, Range Tools,
  Bloodhound, CASEVAC, Maps & Favorites, Overlay Manager, Data Package Tool,
  Contacts, GeoChat, Video Player, Go To, Drawing Tools, Geofencing, Quick Pic,
  Track History, Elevation Tools, Import Manager, Emergency Beacon, Encrypted
  Mesh, or TAK Package Management
- Quote intent actions that exist in `data/atak-intents.json`
- Quote preference keys that exist in `data/atak-preference-keys.json`
- Name CoT types with `CoT type "..."` and React components by PascalCase
  export name

## Acceptance Criteria
- [x] Every catalog `.feature` file includes `Source: ATAK Civilian Software User Manual`
- [x] Every Scenario includes a `# SUM:` comment quoting the instruction
- [x] Every catalog file maps at least one real intent, preference, and CoT type
- [x] Intents cited in features exist in `data/atak-intents.json`
- [x] Preference keys cited in features exist in `data/atak-preference-keys.json`
- [x] Components cited are exports of `@iotactical/tak-react`

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
