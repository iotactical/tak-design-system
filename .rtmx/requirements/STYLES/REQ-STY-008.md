# REQ-STY-008: ATAK List/Table Style Tokens

## Description
All ATAK list and table styles must be captured as W3C component tokens. ATAK uses lists extensively for displaying contacts, markers, routes, mission packages, and other data-driven views. The style family includes: `listView` (the container), `listViewItem` (individual row), `ListViewItemTitle` (primary text), `ListViewItemSecondaryTitle` (secondary/subtitle text), and `ListViewItemTertiaryTitle` (tertiary/metadata text). These styles ensure that dense data lists remain readable and scannable in field conditions with a clear visual hierarchy across title, subtitle, and metadata lines.

List/table style variants and their key properties:
- **listView**: container background, divider color, divider height, padding, scroll indicators
- **listViewItem**: row background, row height, horizontal padding, vertical padding, pressed/selected background, focused background
- **ListViewItemTitle**: primary text -- largest size, highest contrast color, bold or medium weight
- **ListViewItemSecondaryTitle**: subtitle text -- medium size, secondary text color, regular weight
- **ListViewItemTertiaryTitle**: metadata text -- smallest size, tertiary text color, regular weight, potentially italic or monospace for timestamps

## Acceptance Criteria
- [ ] A `component/list` group exists in `tokens/w3c/component.json` with sub-groups: `container`, `item`, `title`, `secondary-title`, `tertiary-title`.
- [ ] `container` defines: `background-color`, `divider-color`, `divider-height`, `padding`.
- [ ] `item` defines: `background-color`, `height`, `padding-horizontal`, `padding-vertical`, `pressed-background-color`, `selected-background-color`, `focused-background-color`.
- [ ] `title` defines: `font-size`, `font-weight`, `text-color`, `line-height`.
- [ ] `secondary-title` defines: `font-size`, `font-weight`, `text-color`, `line-height`.
- [ ] `tertiary-title` defines: `font-size`, `font-weight`, `text-color`, `line-height`.
- [ ] Title font-size > secondary-title font-size > tertiary-title font-size (descending hierarchy).
- [ ] Title text-color has higher contrast than secondary-title, which has higher contrast than tertiary-title.
- [ ] All values reference core tokens (REQ-STY-001, REQ-STY-002); no hard-coded literals.
- [ ] Total list token count is >= 25.
- [ ] The token file passes `style-dictionary` validation without errors.

## Validation
- **Test**: tests/styles/test_list.mjs::test_all_list_variants_present
- **Method**: Unit Test
- **Test**: tests/styles/test_list.mjs::test_title_hierarchy_descending
- **Method**: Unit Test
- **Test**: tests/styles/test_list.mjs::test_list_references_core_tokens
- **Method**: Unit Test
