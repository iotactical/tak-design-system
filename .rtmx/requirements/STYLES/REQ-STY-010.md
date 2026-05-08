# REQ-STY-010: ATAK Tab Widget Tokens

## Description
All ATAK tab widget styles must be captured as W3C component tokens. ATAK uses a custom tab system for switching between views within a screen: `newTab` (base tab style), `newTabLeft` (left-positioned tab with left-side rounding), `newTabRight` (right-positioned tab with right-side rounding), `newTabTitle` (text style for tab labels), and `newTabWidget` (the tab bar container). These tabs use asymmetric corner radii and distinct selected/unselected states to provide clear navigation affordances on the dark ATAK interface.

Tab widget styles and their key properties:
- **newTab**: base tab with background color (selected/unselected), text color (selected/unselected), padding, height, border
- **newTabLeft**: inherits from newTab, applies corner radius only to top-left and bottom-left corners
- **newTabRight**: inherits from newTab, applies corner radius only to top-right and bottom-right corners
- **newTabTitle**: text style for tab labels -- font size, font weight, text transform, letter spacing
- **newTabWidget**: tab bar container -- background color, height, bottom border/divider, horizontal padding, elevation

## Acceptance Criteria
- [ ] A `component/tab` group exists in `tokens/w3c/component.json` with sub-groups: `base`, `left`, `right`, `title`, `widget`.
- [ ] `base` defines: `background-color-selected`, `background-color-unselected`, `text-color-selected`, `text-color-unselected`, `padding-horizontal`, `padding-vertical`, `height`, `border-color`, `border-width`.
- [ ] `left` defines asymmetric corner radii: `corner-radius-top-left`, `corner-radius-bottom-left` with non-zero values, and `corner-radius-top-right: 0`, `corner-radius-bottom-right: 0`.
- [ ] `right` defines asymmetric corner radii: `corner-radius-top-right`, `corner-radius-bottom-right` with non-zero values, and `corner-radius-top-left: 0`, `corner-radius-bottom-left: 0`.
- [ ] `title` defines: `font-size`, `font-weight`, `text-transform`, `letter-spacing`.
- [ ] `widget` defines: `background-color`, `height`, `bottom-border-color`, `bottom-border-width`, `padding-horizontal`, `elevation`.
- [ ] Selected and unselected background/text colors are visually distinct (different token references).
- [ ] All values reference core tokens (REQ-STY-001, REQ-STY-002); no hard-coded literals.
- [ ] Total tab token count is >= 30.
- [ ] The token file passes `style-dictionary` validation without errors.

## Validation
- **Test**: tests/styles/test_tabs.mjs::test_all_tab_variants_present
- **Method**: Unit Test
- **Test**: tests/styles/test_tabs.mjs::test_tab_left_asymmetric_radii
- **Method**: Unit Test
- **Test**: tests/styles/test_tabs.mjs::test_tab_right_asymmetric_radii
- **Method**: Unit Test
- **Test**: tests/styles/test_tabs.mjs::test_selected_unselected_distinct
- **Method**: Unit Test
- **Test**: tests/styles/test_tabs.mjs::test_tab_references_core_tokens
- **Method**: Unit Test
