# REQ-SITE-027: Component tab touch targets meet 44px minimum

## Description
Tab bars on the Components, Palettes, Explorer, Interfaces, and Platforms pages
used desktop-sized padding that produced tap targets under the WCAG 2.5.5
minimum of 44px. Mobile tab padding increases to at least 12px vertical with an
explicit 44px minimum height.

## Acceptance Criteria
- [x] Components, Palettes, Explorer, Interfaces, and Platforms tabs set `min-height: 44px` on mobile
- [x] Mobile tab vertical padding is at least 12px
- [x] Tab bars remain horizontally scrollable rather than wrapping

## Validation
- **Test**: tests/site/test_mobile_touch.mjs
- **Method**: Unit Test
