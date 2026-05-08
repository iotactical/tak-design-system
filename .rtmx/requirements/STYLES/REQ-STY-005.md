# REQ-STY-005: ATAK Typography Style Family Tokens

## Description
The complete AtakTextAppearance style family must be captured as W3C component tokens. ATAK defines a typographic hierarchy used consistently across all screens: `Body`, `Header1` through `Header4`, `Toolbar`, `Button`, `Button.Inverse`, and `Button.Secondary`. These styles govern font size, font weight, line height, letter spacing, text color, and text transform. Consistent typography is critical for readability in field conditions -- ATAK's type scale was designed for outdoor use on ruggedized devices with varying screen densities.

Typography variants and their roles:
- **Body**: default text style for content and descriptions
- **Header1**: largest heading, used for screen titles and primary labels
- **Header2**: section headings within a screen
- **Header3**: sub-section headings and card titles
- **Header4**: smallest heading, used for group labels and minor sections
- **Toolbar**: text style for toolbar titles and action labels
- **Button**: text style applied within AtakButton (bold, uppercase)
- **Button.Inverse**: button text on light backgrounds (dark color)
- **Button.Secondary**: button text with reduced visual weight

Each variant defines at minimum: `font-size`, `font-weight`, `line-height`, `letter-spacing`, `text-color`, and where applicable `text-transform`.

## Acceptance Criteria
- [ ] A `component/typography` group exists in `tokens/w3c/component.json` with sub-groups for each variant: `body`, `header1`, `header2`, `header3`, `header4`, `toolbar`, `button`, `button-inverse`, `button-secondary`.
- [ ] Each variant defines tokens for: `font-size`, `font-weight`, `line-height`, `letter-spacing`, `text-color`.
- [ ] `Header1` through `Header4` form a descending size scale where each level is smaller than the previous.
- [ ] `Button` variant includes `text-transform: uppercase` token.
- [ ] `Button.Inverse` text-color references a dark color token (inverse of standard button text).
- [ ] Font size tokens reference core dimension tokens from REQ-STY-002.
- [ ] Text color tokens reference core color tokens from REQ-STY-001 or semantic tokens from REQ-STY-003.
- [ ] Total typography token count is >= 45 (5 properties x 9 variants).
- [ ] The token file passes `style-dictionary` validation without errors.

## Validation
- **Test**: tests/styles/test_typography.mjs::test_all_typography_variants_present
- **Method**: Unit Test
- **Test**: tests/styles/test_typography.mjs::test_header_descending_scale
- **Method**: Unit Test
- **Test**: tests/styles/test_typography.mjs::test_button_text_transform_uppercase
- **Method**: Unit Test
- **Test**: tests/styles/test_typography.mjs::test_no_hardcoded_literals_in_typography
- **Method**: Unit Test
