# REQ-ICN-007: ATAK Selector/State-List Definitions

## Description
Convert the 117 Android selector (state-list) drawable XMLs from ATAK into cross-platform state map definitions. Android selectors map combinations of UI states (pressed, focused, selected, checked, enabled, activated, window-focused) to specific drawable resources. These selectors control the visual feedback for buttons, list items, toggles, and interactive map elements. The design system must express each selector as a structured JSON state map that any platform can interpret to apply the correct visual treatment for a given interaction state, ensuring consistent tactile feedback across TAK clients.

## Acceptance Criteria
- [ ] A directory `icons/state-lists/` contains 117 state-list definition files as JSON.
- [ ] Each JSON file contains: `name`, `atakSourceFile`, `defaultDrawable`, and `states` (array of state-mapping objects).
- [ ] Each state-mapping object contains: `conditions` (object mapping state names to boolean values), `drawable` (reference to the resolved asset), and `priority` (integer reflecting Android selector evaluation order, first-match wins).
- [ ] State condition names are normalized to platform-agnostic terms: `pressed`, `focused`, `selected`, `checked`, `enabled`, `activated`, `hovered` (mapped from Android `state_pressed`, `state_focused`, etc.).
- [ ] The `drawable` reference resolves to an asset produced by another ICN requirement (SVG from REQ-ICN-002/003/004, shape from REQ-ICN-006, or button from REQ-ICN-005) via a `$ref` path.
- [ ] A CSS mapping file is generated for each state-list at `icons/state-lists/css/` using `:hover`, `:active`, `:focus`, `:disabled`, `[aria-checked]`, and `[aria-selected]` pseudo-classes/attributes.
- [ ] A manifest file `icons/state-lists/manifest.json` indexes all 117 state-lists with: `name`, `stateCount`, `referencedDrawables` (array), `atakSourceFile`.
- [ ] All JSON files pass schema validation against `schemas/state-list-definition.schema.json`.
- [ ] Circular references (state-list referencing another state-list) are detected and flagged in a warnings log rather than producing infinite resolution chains.

## Validation
- **Test**: tests/icons/test_state_lists.mjs::test_state_list_count
- **Test**: tests/icons/test_state_lists.mjs::test_state_list_schema
- **Test**: tests/icons/test_state_lists.mjs::test_state_list_drawable_refs_resolve
- **Test**: tests/icons/test_state_lists.mjs::test_state_list_css_generated
- **Test**: tests/icons/test_state_lists.mjs::test_state_list_no_circular_refs
- **Test**: tests/icons/test_state_lists.mjs::test_state_list_manifest_complete
- **Method**: Unit Test
