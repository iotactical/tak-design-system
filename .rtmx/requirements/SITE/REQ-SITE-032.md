# REQ-SITE-032: Icon inspector modal mobile-optimized padding

## Description
The selector and layer-list inspectors combined a 24px overlay inset with 20px
panel padding, consuming 88px of horizontal space before any state row rendered.
Below 480px the overlay inset and panel padding both tighten to 12px and the panel
may use more of the viewport height.

## Acceptance Criteria
- [x] Overlay padding is 12px below 480px
- [x] Inspector header and body padding are 12px below 480px
- [x] Panel max-height increases to 90vh once padding is reclaimed
- [x] Close control retains a 44px minimum touch target

## Validation
- **Test**: tests/site/test_mobile_polish.mjs
- **Method**: Unit Test
