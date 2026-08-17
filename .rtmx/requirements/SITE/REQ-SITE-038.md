# REQ-SITE-038: Symbol Sandbox is a standalone first-class page

## Description
The interactive SIDC constructor lives today as the Build tab of 2525 Explorer
(`/explorer/build`). It is one of five sibling tabs, with a four-column SIDC grid
and eight `<select>`s, and it is not linked from Home or the sidebar in its own
right. A sandbox is a destination, not a sub-mode of a catalog. It gets its own
route, nav item, and Home card so it can grow a canvas-first layout (REQ-SITE-039)
and touch interactions (REQ-SITE-041) without dragging Browse, Decode, Compare, or
Control Measures with it.

REQ-XW-103 and REQ-XW-119 remain the source of the construction behavior: field
selectors, live render, and the four-version SIDC that cross-updates. This
requirement relocates that behavior; it does not replace it.

## Approach
- New page at `/sandbox`, lazy-loaded like every other route (REQ-XW-201)
- Sidebar nav item "Sandbox" adjacent to 2525 Explorer
- Home card linking to `/sandbox`
- `/explorer/build` redirects to `/sandbox` so existing URLs and search results
  keep working
- Explorer tab bar drops the Build tab; Decode, Browse, Compare, and Control
  Measures stay

## Acceptance Criteria
- [x] `App.tsx` declares a `/sandbox` route whose element is a dedicated page,
      not `Explorer` with a tab param
- [x] Sidebar `navItems` includes a Sandbox entry pointing at `/sandbox`
- [x] Home `pageCards` includes a Sandbox card pointing at `/sandbox`
- [x] Navigating to `/explorer/build` lands the user on `/sandbox`
- [x] Explorer tab list no longer contains a Build tab
- [x] Global search "Build" result resolves to `/sandbox`

## Validation
- **Test**: tests/site/test_sandbox.mjs, tests/site/test_url_routing.mjs
- **Method**: Unit Test
