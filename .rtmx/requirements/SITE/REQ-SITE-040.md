# REQ-SITE-040: Sandbox preview stays in page flow

## Description
The Symbol Sandbox is a construction surface, not a presentation mode. A
dedicated fullscreen control hid site chrome and competed with field selectors
and the live preview. Inspection happens on the in-page canvas (pinch to resize
via REQ-SITE-041). The sandbox must not enter document fullscreen or hide site
chrome.

## Approach
- Do not render a Full / fullscreen control on the sandbox canvas
- Do not call the Fullscreen API or a `100dvh` pseudo-fullscreen fallback
- Do not apply a `sandbox-fullscreen` class that hides sidebar, search, or FABs

## Acceptance Criteria
- [x] The sandbox canvas has no labelled fullscreen control
- [x] The page does not request `requestFullscreen` / `webkitRequestFullscreen`
- [x] Site chrome is not hidden via `html.sandbox-fullscreen`

## Validation
- **Test**: tests/site/test_sandbox.mjs, tests/e2e/sandbox.spec.ts
- **Method**: Unit Test, E2E Test
