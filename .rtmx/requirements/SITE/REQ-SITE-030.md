# REQ-SITE-030: Typography and Spacing tables responsive on narrow screens

## Description
The Typography font-size tables carried a 400px minimum width and the Spacing
scale drew bars at four times the token value, so a 64px spacing token produced a
row wider than a phone viewport. Both pages forced the page to scroll sideways.
Below 480px the Typography rows stack and the Spacing rows narrow their label
column and let the bars shrink, so neither page overflows.

## Approach
- Move both pages from inline styles to CSS modules so breakpoints are expressible,
  keeping inline styles only for token-derived values (font size, bar width, radius)
- Typography: below 480px drop the table minimum width, trim cell padding, and let
  the preview text wrap. The rows stay real table rows rather than being restyled
  into a grid, which would drop table semantics for assistive technology
- Spacing: below 480px drop the container minimum width, collapse the fixed label
  column, and allow the proportional bars to shrink into the remaining space

## Acceptance Criteria
- [x] No forced horizontal scroll on either page at 360px width
- [x] No inner wrapper on either page scrolls horizontally at 360px
- [x] Typography table min-width is released and the table reflows below 480px
- [x] Table semantics and column headers are preserved for assistive technology
- [x] Spacing container min-width is released and bars shrink below 480px
- [x] Font size and spacing values remain visible and correctly proportioned
- [x] Both pages use CSS modules consistent with the rest of the site

## Validation
- **Test**: tests/site/test_mobile_perf.mjs, tests/e2e/mobile-responsive.spec.ts
- **Method**: Unit Test, E2E Test
