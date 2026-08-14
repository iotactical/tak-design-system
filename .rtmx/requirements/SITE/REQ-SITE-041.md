# REQ-SITE-041: Sandbox supports native touch interaction on the symbol

## Description
The live renderer already updates echelon, HQ/TF/FD, status, and affiliation at
runtime through `MilSymRendererLive` and the mil-sym worker (REQ-XW-137). The
Build tab never exposes that as a gesture: every change is a `<select>`. On a
phone, cycling affiliation or echelon should be a tap or swipe on the symbol,
and inspecting detail should be a pinch, not a form.

Gestures are Pointer Events, not mouse-only `wheel` or `mousedown`. They must
not steal vertical page scroll outside the canvas, and they must not fight the
browser's back-swipe at the left edge. Keyboard and the field selectors remain
the desktop path; touch is additive.

## Approach
- Canvas `touch-action: none` only on the preview surface, not the page
- Pinch (two-pointer) scales the preview between a defined min and max; a
  double-tap resets to the default size
- Tap the frame cycles Standard Identity (pending → unknown → friend →
  neutral → hostile, wrapping)
- Swipe horizontally on the canvas cycles affiliation in the same order
- Tap the amplifier region (bottom of the symbol) cycles echelon
- Each gesture updates the SIDC strings and the live render, same as the
  corresponding `<select>`
- `prefers-reduced-motion` disables scale animation but not the state change
- Pointer Events so a stylus and a mouse still work on desktop

## Acceptance Criteria
- [ ] Preview element uses Pointer Events (not mouse-only listeners)
- [ ] `touch-action: none` is scoped to the preview, not `body` or `.page`
- [ ] Two-pointer pinch changes preview size; double-tap restores the default
- [ ] Tap on the frame (or a documented hit target) cycles Standard Identity
      and updates the SIDC
- [ ] Horizontal swipe on the canvas cycles Standard Identity the same way
- [ ] Tap on the amplifier region cycles echelon and updates the SIDC
- [ ] Equivalent `<select>`s still exist and stay in sync with gesture state
- [ ] Vertical scroll of the page is unaffected when the gesture starts outside
      the preview

## Validation
- **Test**: tests/site/test_sandbox.mjs, tests/e2e/sandbox.spec.ts
- **Method**: Unit Test, E2E Test
