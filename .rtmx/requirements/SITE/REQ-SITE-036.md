# REQ-SITE-036: Home card grid fits the viewport at every mobile width

## Description
The mobile card grid introduced by REQ-SITE-024 was two columns between 400px and
680px, but the second column ran off the right edge of the screen: at 430px the page
scrolled 181px sideways, and the titles in the right-hand column were clipped
mid-word. The grid must fit the viewport at every width it is used, presenting one
column where a card cannot hold its content and two only where both fit.

The cause was `grid-template-columns: repeat(2, 1fr)`. A bare `1fr` track resolves
its minimum to the item's min-content, and the nowrap card description gives each
card a min-content width of roughly 290px, so two tracks demanded 595px inside a
398px container. The description never ellipsized because the track grew instead.

The 360px viewport that the responsiveness sweep already covered is single column,
which is why the regression went unnoticed.

## Approach
- Size the tracks with `minmax(0, 1fr)` so a card can never widen its own column
- Default to one column across the mobile range, which covers every phone in
  portrait, including the 430px class of device
- Switch to two columns only from 560px, where each card still has room for its
  icon, title, and description

## Acceptance Criteria
- [x] Grid tracks use a zero minimum rather than a bare `1fr`
- [x] One column at every width below 560px
- [x] Two columns between 560px and 680px, sized equally
- [x] No horizontal page scroll at 360px, 390px, 430px, 480px, 560px, or 600px
- [x] No card is clipped at the right edge of the viewport

## Validation
- **Test**: tests/site/test_mobile_home.mjs, tests/e2e/mobile-responsive.spec.ts
- **Method**: Unit Test, E2E Test
