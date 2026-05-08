# REQ-STY-009: ATAK Input Widget Tokens

## Description
All ATAK input widget styles must be captured as W3C component tokens. ATAK defines custom styles for every input control to maintain the dark military theme: `ATAKEditText` (text fields), `ATAKAutoCompleteText` (autocomplete fields), `ATAKSpinner` (dropdown selectors), `ATAKCheckBox` (checkboxes), `newSwitch` (toggle switches), and `newSpinnerStyle` (alternative spinner). These input controls are used throughout ATAK for mission planning, marker editing, settings, and data entry forms. Each must be styled to maintain readability and operability in field conditions with gloved hands.

Input widget styles and their key properties:
- **ATAKEditText**: dark background, light text, visible border, hint text color, padding, corner radius, cursor color, selection highlight color, min height for touch target
- **ATAKAutoCompleteText**: inherits from ATAKEditText, adds dropdown background, dropdown item styling
- **ATAKSpinner**: dropdown trigger background, arrow indicator tint, text color, padding, min height, dropdown popup background and item style
- **ATAKCheckBox**: checkbox tint color (checked/unchecked), padding, min size for touch target, text color and size for label
- **newSwitch**: thumb color (on/off), track color (on/off), min width, min height, text label styling
- **newSpinnerStyle**: alternative spinner appearance, potentially different from ATAKSpinner in border or indicator style

## Acceptance Criteria
- [ ] A `component/input` group exists in `tokens/w3c/component.json` with sub-groups: `edit-text`, `autocomplete-text`, `spinner`, `checkbox`, `switch`, `spinner-alt`.
- [ ] `edit-text` defines: `background-color`, `text-color`, `hint-color`, `border-color`, `border-width`, `corner-radius`, `padding-horizontal`, `padding-vertical`, `min-height`, `cursor-color`, `selection-color`, `font-size`.
- [ ] `autocomplete-text` inherits from `edit-text` and adds: `dropdown-background-color`, `dropdown-item-text-color`, `dropdown-item-height`.
- [ ] `spinner` defines: `background-color`, `text-color`, `arrow-tint`, `padding`, `min-height`, `dropdown-background-color`.
- [ ] `checkbox` defines: `tint-checked`, `tint-unchecked`, `min-size`, `label-text-color`, `label-font-size`, `padding`.
- [ ] `switch` defines: `thumb-color-on`, `thumb-color-off`, `track-color-on`, `track-color-off`, `min-width`, `min-height`.
- [ ] All input min-height/min-size values meet the minimum touch target from REQ-STY-002.
- [ ] All color values reference core tokens (REQ-STY-001); all dimensions reference core tokens (REQ-STY-002).
- [ ] Total input token count is >= 50.
- [ ] The token file passes `style-dictionary` validation without errors.

## Validation
- **Test**: tests/styles/test_inputs.mjs::test_all_input_variants_present
- **Method**: Unit Test
- **Test**: tests/styles/test_inputs.mjs::test_switch_on_off_colors_differ
- **Method**: Unit Test
- **Test**: tests/styles/test_inputs.mjs::test_touch_target_minimums
- **Method**: Unit Test
- **Test**: tests/styles/test_inputs.mjs::test_input_references_core_tokens
- **Method**: Unit Test
