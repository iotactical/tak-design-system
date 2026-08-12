# REQ-SITE-025: Home dot indicators meet 44px WCAG touch target

## Description
The carousel's 6px dot indicators were far below the WCAG 2.5.5 minimum tap area
of 44px. Replacing the carousel with a grid (REQ-SITE-024) removes the dots
entirely, so the undersized targets no longer exist rather than being enlarged.

## Acceptance Criteria
- [x] No dot indicator container or active-dot state remains in Home.tsx
- [x] No 6px dot dimensions remain in Home.module.css
- [x] Remaining mobile navigation targets are at least 44px

## Validation
- **Test**: tests/site/test_mobile_home.mjs
- **Method**: Unit Test
