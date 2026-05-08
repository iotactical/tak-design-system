# REQ-CMP-013: Form Controls Component Set

## Description
Form controls are the foundational input elements used throughout ATAK for settings, configuration, and data entry. This component set covers Checkbox (ATAKCheckBox style), Toggle/Switch (newSwitch style), Spinner/Select (ATAKSpinner style), RadioGroup (RadioState/RadioTitle/RadioSubTitle styles), and ProgressBar (progressBarHorizontal style). Cross-platform consistency ensures that every interactive control looks and behaves like native ATAK, maintaining the dark-theme tactical aesthetic and touch-optimized sizing.

## Acceptance Criteria

### Checkbox
- [ ] Renders a square checkbox with checked, unchecked, and indeterminate states
- [ ] Check mark uses the ATAK green accent color (color.accent.primary token)
- [ ] Label text positioned to the right of the checkbox
- [ ] Minimum touch target of 48dp
- [ ] Supports disabled state with reduced opacity

### Toggle/Switch
- [ ] Renders a sliding toggle matching ATAK newSwitch style
- [ ] Track and thumb use distinct on/off color tokens
- [ ] Animates thumb slide on state change (duration under 150ms)
- [ ] Supports disabled state
- [ ] Emits onChange with boolean value

### Spinner/Select
- [ ] Renders a dropdown selector matching ATAKSpinner style
- [ ] Closed state shows current selection with a dropdown arrow
- [ ] Open state shows a scrollable list of options with the selected item highlighted
- [ ] Supports option groups with separator labels
- [ ] Keyboard: arrow keys navigate, Enter selects, Escape closes

### RadioGroup
- [ ] Renders a vertical or horizontal group of radio buttons
- [ ] Each option has a title (RadioTitle) and optional subtitle (RadioSubTitle)
- [ ] Only one option is selectable at a time within a group
- [ ] Selected state uses accent color fill; unselected uses border only
- [ ] Supports disabled individual options or the entire group

### ProgressBar
- [ ] Renders a horizontal bar showing determinate (0-100%) or indeterminate progress
- [ ] Determinate mode fills left-to-right with accent color
- [ ] Indeterminate mode shows a cycling animation
- [ ] Supports a label or percentage text above or beside the bar
- [ ] Bar height matches ATAK progressBarHorizontal (4dp default)

### Shared
- [ ] All controls apply design tokens: color.accent.primary, surface.input, border.input, text.label
- [ ] All controls support a label prop and an error/helper text prop
- [ ] All controls emit standard change events with the current value
- [ ] Focus states show a visible ring for keyboard accessibility

## Validation
- **Test**: tests/components/test_form_controls.mjs::checkbox_states
- **Test**: tests/components/test_form_controls.mjs::toggle_switch_animation
- **Test**: tests/components/test_form_controls.mjs::spinner_select_keyboard
- **Test**: tests/components/test_form_controls.mjs::radio_group_single_selection
- **Test**: tests/components/test_form_controls.mjs::progress_bar_determinate
- **Test**: tests/components/test_form_controls.mjs::progress_bar_indeterminate
- **Test**: tests/components/test_form_controls.mjs::disabled_states_all_controls
- **Method**: Unit Test, Accessibility Test
