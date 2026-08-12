# REQ-SITE-026: Home layout works on landscape phones

## Description
Fixed viewport heights clipped the Home hero and grid on short landscape
viewports. The layout uses max-height rather than height and compresses the hero
in landscape orientation so no content is cut off.

## Acceptance Criteria
- [x] Hero uses max-height instead of a fixed height
- [x] Landscape orientation media query compresses hero spacing
- [x] No content is clipped on short viewports

## Validation
- **Test**: tests/site/test_mobile_home.mjs
- **Method**: Unit Test
