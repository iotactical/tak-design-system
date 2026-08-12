# REQ-SITE-033: Skittles label width responsive on mobile

## Description
The Skittles role and state matrices reserve a fixed label column before the first
team-color circle. At 100px that column consumed roughly a third of a phone
viewport. Below 480px the label column halves to 50px while the circle columns keep
their 34px pitch, so the matrix stays aligned and only the labels narrow.

## Approach
- Replace the `LABEL_W` numeric constant with the `--skittle-label-w` custom
  property so every label column and the header row width read one value
- Scope the property to `.skittlesPanel` and override it below 480px

## Acceptance Criteria
- [x] Label width is 100px on desktop and 50px below 480px
- [x] All label columns and the header spacer read the same custom property
- [x] Circle column pitch stays fixed so rows remain aligned
- [x] Header row minimum width tracks the responsive label width

## Validation
- **Test**: tests/site/test_mobile_polish.mjs
- **Method**: Unit Test
