# REQ-SITE-029: Virtualize Icons grid with IntersectionObserver

## Description
The Icons page renders the full drawable catalog of 1,317 entries. Mounting every
card preview at once issues over a thousand image requests and inflates the DOM,
which is the dominant cost of the page on a phone. Card previews mount when their
card approaches the viewport and unmount once it is well clear, so the number of
live previews stays bounded no matter how far the user scrolls.

## Approach
- Shared `useInView` hook wrapping IntersectionObserver, with an `once` option for
  callers whose content is expensive to re-create (multipoint symbol rendering)
- `LazyCardPreview` mounts `CardPreview` only while in view, using a 400px root
  margin so previews are ready before they are scrolled to
- The preview box keeps its fixed 80px height, so mounting and unmounting never
  changes grid geometry or scroll position
- Card shell, name, badges, and `data-highlight` anchor stay mounted so filtering,
  counts, and deep links are unaffected
- Falls back to rendering everything where IntersectionObserver is unavailable

## Acceptance Criteria
- [x] Only previews near the viewport are present in the DOM
- [x] All catalog entries keep a card, so the grid and counts stay complete
- [x] Scrolling mounts new previews and releases those left behind
- [x] Grid does not reflow when previews mount or unmount
- [x] Search and filters operate on the full catalog, not just mounted cards
- [x] The duplicate local `useInView` in MultipointGallery is removed

## Validation
- **Test**: tests/site/test_mobile_perf.mjs, tests/e2e/icons-virtualization.spec.ts
- **Method**: Unit Test, E2E Test
