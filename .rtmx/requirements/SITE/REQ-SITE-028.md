# REQ-SITE-028: Safe-area-inset handling for notched phones

## Description
On notched and rounded-corner phones the bottom navigation bar and side padding
fell inside the system inset areas, placing controls under the home indicator.
The app shell reserves space with `env(safe-area-inset-*)` and the viewport meta
opts into `viewport-fit=cover` so those insets are reported to CSS.

## Acceptance Criteria
- [x] Bottom bar height and padding include `env(safe-area-inset-bottom)`
- [x] Content area padding includes left and right safe-area insets
- [x] Sidebar bottom padding includes `env(safe-area-inset-bottom)`
- [x] Viewport meta includes `viewport-fit=cover`
- [x] Zoom is not blocked by `user-scalable=no` or `maximum-scale=1` (WCAG 1.4.4)

## Validation
- **Test**: tests/site/test_mobile_touch.mjs
- **Method**: Unit Test
