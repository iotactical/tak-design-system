# REQ-SITE-042: Sandbox SIDC is addressable and construction behavior is preserved

## Description
A sandbox that cannot be shared is a local toy. The constructed SIDC belongs in
the URL so a link opens the same symbol, and so the page can be embedded or
bookmarked. Moving Build out of Explorer (REQ-SITE-038) must not drop the
construction behavior REQ-XW-103 and REQ-XW-119 already specify: field selectors,
four-version cross-updating SIDCs, entity search, and live render.

Modifier 1 and Modifier 2 are currently hardcoded to `None (00)` in BuildPanel.
That is a defect in the existing behavior, not a new feature: the Sandbox must
populate those selectors from the modifier lists the renderer already knows, or
the "construction" claim is false for any symbol that uses them.

## Approach
- URL shape: `/sandbox?sidc=<15-or-20-char>` (query, not path, so a partial SIDC
  while typing does not 404)
- On load, a valid 15- or 20-character `sidc` hydrates the same field state
  BuildPanel uses today; an absent or invalid param uses the current default
  (Command and Control, land unit)
- Changing fields or gestures (REQ-SITE-041) writes the D-series SIDC back to
  the query with `history.replaceState` so the back button is not a trail of
  every tap
- Entity search, SI, symbol set, status, HQ/TF/FD, echelon, entity, modifier 1,
  and modifier 2 remain available (desktop always; mobile via the sheet in
  REQ-SITE-039)
- Modifier 1 and 2 options come from the symbol set's modifier catalog, not a
  single `None` option

## Acceptance Criteria
- [x] Opening `/sandbox?sidc=10031000001100000000` renders that SIDC
- [x] Opening `/sandbox?sidc=SFGPU-----*****` hydrates the B-series equivalent
      and the D/E crosswalk
- [x] An invalid or truncated `sidc` param does not crash; the default symbol
      is shown
- [x] Editing a field updates the query string without pushing a history entry
- [x] Modifier 1 and Modifier 2 selectors list more than `None` when the
      current symbol set defines modifiers
- [x] All REQ-XW-103 field selectors still exist and still live-update the
      render

## Validation
- **Test**: tests/site/test_sandbox.mjs, tests/e2e/sandbox.spec.ts
- **Method**: Unit Test, E2E Test
