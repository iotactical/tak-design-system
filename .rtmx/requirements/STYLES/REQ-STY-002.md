# REQ-STY-002: ATAK Dimension Complete Mapping

## Description
All 81 dimensions defined in ATAK's `dimens.xml` must be mapped to W3C Design Token Format entries in the core token set. These dimensions control spacing, sizing, corner radii, icon sizes, margin/padding values, and touch-target minimums across the TAK ecosystem. Without complete dimension coverage, platform adaptations must guess at spacing and sizing, leading to misaligned layouts and inconsistent density across WinTAK, WebTAK, and TAKX.

Dimension categories include:
- **Spacing**: margins, paddings, gaps (e.g., `padding_small`, `padding_medium`, `padding_large`, `margin_standard`, `margin_wide`)
- **Sizing**: component heights, widths, icon sizes (e.g., `nav_button_size`, `compass_button_size`, `icon_size_small`, `icon_size_medium`, `icon_size_large`, `toolbar_height`, `actionbar_height`)
- **Corner radii**: border-radius values (e.g., `button_corner_radius`, `dialog_corner_radius`, `card_corner_radius`, `edit_text_corner_radius`)
- **Typography sizing**: font sizes, line heights (e.g., `text_size_body`, `text_size_header1` through `text_size_header4`, `text_size_button`, `text_size_toolbar`)
- **Touch targets**: minimum tap dimensions (e.g., `min_touch_target`, `min_button_height`, `min_button_width`)
- **Borders**: stroke widths (e.g., `border_width_thin`, `border_width_medium`, `divider_height`)
- **List/table**: row heights, cell padding (e.g., `list_item_height`, `list_item_padding`, `list_divider_height`)

## Acceptance Criteria
- [ ] Every one of the 81 dimensions from ATAK `dimens.xml` has a corresponding entry in `tokens/w3c/core.json` under a `dimension` group.
- [ ] Each token uses `$type: "dimension"` with values expressed in `px` or `rem` as appropriate.
- [ ] Android `dp` values are converted to `rem` using the standard 1dp = 0.0625rem (16px base) conversion.
- [ ] Android `sp` values for font sizes are converted to `rem` with the same base.
- [ ] Token names follow kebab-case and are prefixed `atak-` (e.g., `atak-padding-small`).
- [ ] The count of dimension tokens in `core.json` is >= 81.
- [ ] All component-level tokens that reference dimensions (buttons, dialogs, nav, lists, inputs, tabs) resolve to values defined here; no dangling references exist.
- [ ] The token file passes `style-dictionary` validation without errors.

## Validation
- **Test**: tests/styles/test_dimensions.mjs::test_all_81_dimensions_present
- **Method**: Unit Test
- **Test**: tests/styles/test_dimensions.mjs::test_dp_to_rem_conversion
- **Method**: Unit Test
- **Test**: tests/styles/test_dimensions.mjs::test_no_dangling_dimension_references
- **Method**: Unit Test
