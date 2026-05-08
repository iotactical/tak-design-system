# REQ-STY-004: ATAK Button Style Family Tokens

## Description
The complete AtakButton style family must be captured as W3C component tokens. ATAK defines a button hierarchy where `AtakButton` is the base style and five variants inherit from it: `AtakButton.Alert`, `AtakButton.Inverse`, `AtakButton.Marker`, `AtakButton.Secondary`, and `AtakButton.Secondary.Black`. Each variant overrides background color, text color, padding, corner radius, and sometimes font weight or text transform. These buttons are the primary interactive elements in ATAK and must render identically across all TAK platforms.

Button variants and their key properties:
- **AtakButton** (base): dark background, white text, standard padding, rounded corners, bold text
- **AtakButton.Alert**: red/alert background, white text, used for destructive or urgent actions
- **AtakButton.Inverse**: white/light background, dark text, used on dark overlays
- **AtakButton.Marker**: specialized marker-related actions, distinct accent color
- **AtakButton.Secondary**: reduced visual weight, outline or muted background
- **AtakButton.Secondary.Black**: secondary variant with black/dark background override

Each variant defines at minimum: `background`, `textColor`, `textSize`, `paddingLeft`, `paddingRight`, `paddingTop`, `paddingBottom`, `minHeight`, `minWidth`, and `cornerRadius`.

## Acceptance Criteria
- [ ] A `component/button` group exists in `tokens/w3c/component.json` with sub-groups for each variant: `base`, `alert`, `inverse`, `marker`, `secondary`, `secondary-black`.
- [ ] Each variant defines tokens for: `background-color`, `text-color`, `text-size`, `padding-horizontal`, `padding-vertical`, `min-height`, `min-width`, `corner-radius`, `font-weight`.
- [ ] The `base` variant tokens match ATAK's `AtakButton` style definition.
- [ ] Each child variant inherits from `base` and only overrides the properties that differ, using token aliases where values are shared.
- [ ] `alert` variant background references the `atak-alert` core color token.
- [ ] `inverse` variant swaps foreground and background relative to `base`.
- [ ] All token values reference core (REQ-STY-001, REQ-STY-002) or semantic (REQ-STY-003) tokens; no hard-coded literals.
- [ ] Total button token count is >= 54 (9 properties x 6 variants).
- [ ] The token file passes `style-dictionary` validation without errors.

## Validation
- **Test**: tests/styles/test_buttons.mjs::test_all_button_variants_present
- **Method**: Unit Test
- **Test**: tests/styles/test_buttons.mjs::test_button_inheritance_chain
- **Method**: Unit Test
- **Test**: tests/styles/test_buttons.mjs::test_alert_button_uses_alert_color
- **Method**: Unit Test
- **Test**: tests/styles/test_buttons.mjs::test_no_hardcoded_literals_in_buttons
- **Method**: Unit Test
