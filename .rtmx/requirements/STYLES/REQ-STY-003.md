# REQ-STY-003: ATAK Theme Token Definition

## Description
The `ATAKTheme` base theme (parent `Theme.Holo.NoActionBar`) must be fully captured as a W3C token set in the semantic layer. ATAKTheme is the root theme for the entire ATAK application and defines default values for window background, text colors, action bar styling, and all inherited widget defaults. Every other ATAK style inherits from or is applied within ATAKTheme. Capturing it as a semantic token set ensures that every platform implementation starts from the same visual foundation -- the dark, high-contrast military-grade UI that defines ATAK.

ATAKTheme overrides include:
- `android:windowBackground` -- the global background color
- `android:colorBackground` -- surface color used by dialogs and popups
- `android:textColorPrimary`, `android:textColorSecondary`, `android:textColorTertiary`
- `android:colorAccent` -- the accent/highlight color
- `android:colorPrimary`, `android:colorPrimaryDark`
- `android:actionBarStyle`, `android:actionBarSize`
- `android:windowNoTitle`, `android:windowActionBar`
- Default widget styles: `android:buttonStyle`, `android:editTextStyle`, `android:checkboxStyle`, `android:spinnerStyle`
- Status bar and navigation bar colors
- Divider and list selector defaults

## Acceptance Criteria
- [ ] A `theme/atak` group exists in `tokens/w3c/semantic.json` containing all ATAKTheme attribute overrides.
- [ ] `window-background` token references the correct core color token (dark/onyx background).
- [ ] `color-primary`, `color-primary-dark`, and `color-accent` tokens are defined and reference core palette entries.
- [ ] `text-color-primary`, `text-color-secondary`, and `text-color-tertiary` tokens are defined with correct core references.
- [ ] `actionbar-height` and `actionbar-background` tokens are defined.
- [ ] Default widget style references (button, editText, checkbox, spinner) point to their respective component token groups.
- [ ] The theme token set includes at least 15 attributes matching the ATAKTheme definition.
- [ ] All values reference tokens from REQ-STY-001 (colors) or REQ-STY-002 (dimensions); no hard-coded literals in the semantic layer.
- [ ] The token file passes `style-dictionary` validation without errors.

## Validation
- **Test**: tests/styles/test_theme.mjs::test_atak_theme_token_group_exists
- **Method**: Unit Test
- **Test**: tests/styles/test_theme.mjs::test_theme_references_core_tokens_only
- **Method**: Unit Test
- **Test**: tests/styles/test_theme.mjs::test_theme_minimum_attribute_count
- **Method**: Unit Test
