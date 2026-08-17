# REQ-SITE-040: Sandbox preview supports fullscreen

## Description
On a phone the floating share and menu buttons, the bottom search bar, and the
page chrome compete with the symbol. A sandbox that is meant to be inspected
needs a mode where the live preview is the only chrome: no nav, no search, no
FABs. Fullscreen is that mode. It must be enterable and exitable with one tap,
and the system fullscreen gesture (Android back, iOS swipe, Escape) must exit it
as well.

## Approach
- A control on the canvas, at least 44px, that requests `document.documentElement`
  fullscreen via the Fullscreen API (with the webkit prefix where required)
- While fullscreen: hide the site sidebar, bottom bar, share FAB, and hamburger
  by scoping a class on `document.documentElement`; the close control remains
- Exit via the same control, `fullscreenchange`, Escape, and the UA's back
  gesture
- If the Fullscreen API is unavailable, expand the canvas to `100dvh` inside the
  page (pseudo-fullscreen) so the requirement still holds in in-app browsers
  that block the API
- `aria-pressed` on the control reflects fullscreen state

## Acceptance Criteria
- [x] A labelled control enters and exits fullscreen (or the `100dvh` fallback)
- [x] While fullscreen, the share FAB, hamburger, sidebar, and bottom search bar
      are not visible
- [x] Exiting fullscreen restores those controls
- [x] Escape exits fullscreen when the API is in use
- [x] The enter/exit control is at least 44px on both axes below 768px

## Validation
- **Test**: tests/site/test_sandbox.mjs, tests/e2e/sandbox.spec.ts
- **Method**: Unit Test, E2E Test
