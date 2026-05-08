# REQ-ICN-005: ATAK Button State Drawables

## Description
Convert the 40 `btn_*` button state drawables from ATAK into platform-agnostic state definitions. Android button drawables typically combine nine-patch bitmaps or shape drawables with selector XMLs that map visual states (normal, pressed, focused, disabled, checked) to specific assets. The design system must decompose these into a structured format that web (CSS pseudo-classes), iOS (UIControl.State), and desktop frameworks can consume. Each button definition includes its geometry, corner radii, fill/stroke colors per state, shadow/elevation values, and padding derived from nine-patch stretch regions.

## Acceptance Criteria
- [ ] A directory `icons/buttons/` contains 40 button definition directories, one per `btn_*` drawable family.
- [ ] Each button directory contains a `definition.json` with fields: `name`, `states` (array of objects with `state`, `fill`, `stroke`, `strokeWidth`, `cornerRadius`, `elevation`, `opacity`), `padding` (top, right, bottom, left), `minWidth`, `minHeight`.
- [ ] Supported states include at minimum: `default`, `pressed`, `focused`, `disabled`. Additional states (`checked`, `selected`, `activated`) are included where the ATAK source defines them.
- [ ] Nine-patch stretch regions are converted to `padding` and `resizable` metadata rather than relying on Android nine-patch binary encoding.
- [ ] For each button, a reference SVG (`reference.svg`) is generated showing the button in its default state.
- [ ] Color values in definitions use design-token references (e.g., `{color.button.primary.fill}`) rather than hard-coded hex where a token mapping exists.
- [ ] A top-level `icons/buttons/manifest.json` indexes all 40 buttons with fields: `name`, `path`, `stateCount`, `hasNinePatch`, `atakSourceFiles` (array).
- [ ] All JSON files pass schema validation against `schemas/button-definition.schema.json`.
- [ ] CSS equivalents are generated in `icons/buttons/css/` with one `.css` file per button using pseudo-class selectors for state mapping.

## Validation
- **Test**: tests/icons/test_button_states.mjs::test_button_definition_count
- **Test**: tests/icons/test_button_states.mjs::test_button_definition_schema
- **Test**: tests/icons/test_button_states.mjs::test_button_states_coverage
- **Test**: tests/icons/test_button_states.mjs::test_button_manifest_complete
- **Test**: tests/icons/test_button_states.mjs::test_button_css_generated
- **Method**: Unit Test
