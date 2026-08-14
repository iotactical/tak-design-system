# REQ-SITE-039: Sandbox is a canvas-first layout on mobile

## Description
The current Build panel is a desktop form: a search box, a four-column SIDC grid
(`minmax(200px, 1fr)`, shrinking to `minmax(150px, 1fr)` below 768px), a 48px
preview inside each version card, and eight stacked `<select>`s. On a 390px phone
that is four clipped SIDC inputs and a symbol too small to inspect. The Sandbox
page inverts this: the live symbol is the primary surface, and the field controls
are secondary chrome around it.

Desktop may keep a two-pane arrangement (canvas + inspectors). Mobile must not
show more than one SIDC string at a time in the initial view, and the preview
must be large enough to read frame, icon, and amplifiers without pinch (pinch
itself is REQ-SITE-041).

## Approach
- One live `MilSymRendererLive` preview, sized from the available canvas rather
  than a hardcoded 48px
- Below 768px: canvas occupies the upper viewport; identity, echelon, status, and
  entity controls sit in a sheet or stacked list beneath it, each a 44px target
- A single SIDC readout (D/E by default) with a control to reveal B/C/D/E, rather
  than four simultaneous inputs
- Entity search remains, but as a full-width field, not a dropdown that fights
  the on-screen keyboard
- No horizontal page scroll at 360px or 430px

## Acceptance Criteria
- [ ] Below 768px the live preview is at least 160px on the shorter side
- [ ] Below 768px the page does not render a four-column SIDC grid
- [ ] Every interactive control in the Sandbox has `min-height: 44px` below 768px
- [ ] The page does not force horizontal document scroll at 360px or 430px
- [ ] Desktop (min-width 768px) still exposes all four version SIDCs and all
      field selectors from REQ-XW-103

## Validation
- **Test**: tests/site/test_sandbox.mjs, tests/e2e/sandbox.spec.ts
- **Method**: Unit Test, E2E Test
