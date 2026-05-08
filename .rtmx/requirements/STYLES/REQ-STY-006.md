# REQ-STY-006: ATAK Dialog Style Tokens

## Description
All ATAK dialog styles must be captured as W3C component tokens. ATAK defines several dialog variants used for alerts, confirmations, settings, and full-screen overlays: `standardDialog`, `newAlertDialog`, `full_screen_dialog`, `dialogTextAppearance`, `dialogTitleTextView`, and `dialogMessageTextView`. Dialogs in ATAK use a dark theme with specific corner radii, elevation, overlay dimming, and internal padding that must be consistent across TAK platforms. The dialog text styles (`dialogTitleTextView`, `dialogMessageTextView`) define the internal typographic hierarchy.

Dialog variants and their key properties:
- **standardDialog**: default dialog with dark background, rounded corners, dim overlay, standard width constraints
- **newAlertDialog**: alert/confirmation dialog with alert-colored action buttons, potentially different background tint
- **full_screen_dialog**: edge-to-edge dialog with no margin, no corner radius, used for complex forms
- **dialogTextAppearance**: base text style inherited by title and message text views
- **dialogTitleTextView**: title text inside dialogs -- larger, bold, specific color
- **dialogMessageTextView**: body/message text inside dialogs -- standard body size, secondary text color

Each dialog defines at minimum: `background-color`, `corner-radius`, `padding`, `elevation`, `overlay-dim-color`, `min-width`, `max-width`. Text styles define: `font-size`, `font-weight`, `text-color`, `line-height`, `margin-bottom`.

## Acceptance Criteria
- [ ] A `component/dialog` group exists in `tokens/w3c/component.json` with sub-groups: `standard`, `alert`, `full-screen`, `text-appearance`, `title-text`, `message-text`.
- [ ] `standard` defines: `background-color`, `corner-radius`, `padding`, `elevation`, `overlay-dim-color`, `min-width`, `max-width`.
- [ ] `alert` inherits from `standard` and overrides action button color references.
- [ ] `full-screen` sets `corner-radius` to 0, `min-width` and `max-width` to 100%, and removes outer margin.
- [ ] `title-text` defines `font-size`, `font-weight`, `text-color`, `line-height`, `margin-bottom`.
- [ ] `message-text` defines `font-size`, `font-weight`, `text-color`, `line-height`.
- [ ] All color values reference core tokens (REQ-STY-001); all dimensions reference core tokens (REQ-STY-002).
- [ ] Total dialog token count is >= 30.
- [ ] The token file passes `style-dictionary` validation without errors.

## Validation
- **Test**: tests/styles/test_dialogs.mjs::test_all_dialog_variants_present
- **Method**: Unit Test
- **Test**: tests/styles/test_dialogs.mjs::test_full_screen_zero_corner_radius
- **Method**: Unit Test
- **Test**: tests/styles/test_dialogs.mjs::test_dialog_references_core_tokens
- **Method**: Unit Test
