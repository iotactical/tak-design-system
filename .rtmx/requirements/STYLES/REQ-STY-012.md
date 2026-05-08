# REQ-STY-012: ATAK Color State Lists

## Description
All 9 color state lists defined in ATAK's `color/` resource directory must be captured as W3C component tokens with state-dependent value resolution. Android color state lists (`ColorStateList` XML files) define different colors for different widget states: pressed, focused, selected, checked, enabled, disabled, and default. ATAK uses these for interactive elements like buttons, checkboxes, switches, tabs, and list items to provide visual feedback. Without these state mappings, platform implementations cannot replicate ATAK's interactive color behavior and widgets will appear static or use platform-default state colors.

The 9 color state lists include mappings for:
- **button_text_color**: text color across pressed, disabled, and default states
- **button_background**: background color across pressed, disabled, and default states
- **checkbox_tint_list**: tint color for checked vs unchecked states
- **switch_thumb_color**: thumb color for checked (on) vs unchecked (off) states
- **switch_track_color**: track color for checked (on) vs unchecked (off) states
- **tab_text_color**: text color for selected vs unselected tab states
- **tab_background_color**: background for selected vs unselected tab states
- **list_item_background**: background for pressed, selected, focused, and default states
- **nav_button_tint**: icon tint for pressed, focused, and default states

Each state list defines 2-4 state/color pairs plus a default fallback color.

## Acceptance Criteria
- [ ] A `component/color-states` group exists in `tokens/w3c/component.json` with sub-groups for each of the 9 state lists.
- [ ] Each state list sub-group contains tokens keyed by state name: `pressed`, `focused`, `selected`, `checked`, `disabled`, `default` (as applicable).
- [ ] Each state token value references a core color token from REQ-STY-001; no hard-coded hex values.
- [ ] Every state list has a `default` state token that serves as the fallback.
- [ ] `checkbox_tint_list` defines at minimum `checked` and `default` (unchecked) states.
- [ ] `switch_thumb_color` and `switch_track_color` each define `checked` and `default` states with distinct color references.
- [ ] `tab_text_color` and `tab_background_color` each define `selected` and `default` states with distinct color references.
- [ ] `button_text_color` and `button_background` each define `pressed`, `disabled`, and `default` states.
- [ ] `list_item_background` defines `pressed`, `selected`, `focused`, and `default` states.
- [ ] `nav_button_tint` defines `pressed`, `focused`, and `default` states.
- [ ] Total color state token count is >= 27 (average 3 states x 9 lists).
- [ ] The token file passes `style-dictionary` validation without errors.

## Validation
- **Test**: tests/styles/test_color_states.mjs::test_all_9_state_lists_present
- **Method**: Unit Test
- **Test**: tests/styles/test_color_states.mjs::test_every_state_list_has_default
- **Method**: Unit Test
- **Test**: tests/styles/test_color_states.mjs::test_state_values_reference_core_colors
- **Method**: Unit Test
- **Test**: tests/styles/test_color_states.mjs::test_switch_states_are_distinct
- **Method**: Unit Test
