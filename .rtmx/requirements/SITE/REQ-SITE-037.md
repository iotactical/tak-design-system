# REQ-SITE-037: Floating navigation controls stay visible while the nav drawer is open

## Description
On mobile the share and menu buttons float above the bottom right of the page. Both
disappeared behind the drawer backdrop as soon as the navigation opened: the backdrop
sits at z-index 199 and the buttons at 150, so they dimmed to near-invisibility and
stopped responding to taps. The menu button is the control that closes the drawer, so
the affordance the user just pressed vanished, leaving the drawer looking modal with
no visible way out.

Raising the z-index alone was not enough for the menu button. It was a child of the
bottom bar, which is itself positioned with a z-index and therefore creates a
stacking context; the button could only be ordered against its siblings inside that
bar, never against the backdrop.

## Approach
- Move the menu button out of the bottom bar so it is a sibling of the share button
  and participates in the root stacking context
- Raise both controls above the backdrop and the drawer
- Reflect state on the control: `aria-expanded`, and a close glyph while open

## Acceptance Criteria
- [x] Both controls hit-test to themselves while the drawer is open
- [x] Both controls sit above the backdrop and the drawer
- [x] The menu button closes the drawer when it is open
- [x] The menu button carries `aria-expanded` reflecting drawer state
- [x] The menu button shows a close glyph while the drawer is open
- [x] The bottom bar layout is unchanged on desktop, where the control is hidden

## Validation
- **Test**: tests/site/test_mobile_touch.mjs, tests/e2e/mobile-responsive.spec.ts
- **Method**: Unit Test, E2E Test
