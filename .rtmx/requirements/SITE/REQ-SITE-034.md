# REQ-SITE-034: Platforms copy button does not overlap code on mobile

## Description
The Platforms page floats a Copy button over the top-right corner of each generated
file listing. On a narrow viewport it covers the first line of code, which is where
XML declarations and Kotlin package statements appear. Below 480px the button
leaves the overlay and becomes a full-width bar above the code block.

## Acceptance Criteria
- [x] Button remains an absolute overlay on desktop
- [x] Button is in normal flow and full width below 480px
- [x] No code text is obscured at 360px width
- [x] Repositioned button meets the 44px minimum touch target

## Validation
- **Test**: tests/site/test_mobile_polish.mjs, tests/e2e/mobile-responsive.spec.ts
- **Method**: Unit Test, E2E Test
