# REQ-SITE-024: Replace Home carousel with vertical compact grid on mobile

## Description
The Home page carousel presented 78vw cards that required horizontal swiping to
discover the eleven section links, and each card loaded a preview image. Below
680px the carousel is replaced by a vertical two-column grid of icon and title
cards with no preview images, so every destination is reachable by scrolling and
the initial payload drops.

## Acceptance Criteria
- [x] `mobileGrid` replaces the carousel markup, tagged `data-testid="mobile-grid"`
- [x] Grid is one column below 560px and two columns from 560px to 680px
      (revised by REQ-SITE-036, which found that two columns did not fit)
- [x] Carousel track, dots, and scroll-snap styles are removed
- [x] Mobile cards render no `<img>` previews
- [x] All eleven page links remain reachable

## Validation
- **Test**: tests/site/test_mobile_home.mjs
- **Method**: Unit Test
