# REQ-SITE-021: Virtualize multipoint gallery grid

## Description
The gallery renders all 100+ thumbnail cards at once, queueing every card
through the single off-screen MapLibre instance before the page appears
loaded. Virtualize the grid so only visible cards (approximately 12-24
depending on viewport) are rendered. Cards entering the viewport trigger
thumbnail generation on demand.

## Acceptance Criteria
- [ ] Only cards within or near the viewport are mounted in the DOM
- [ ] Scrolling into view triggers thumbnail rendering for newly visible cards
- [ ] Time from route navigation to first visible thumbnail is under 3 seconds
- [ ] Category filter, version switch, and affiliation switch still work

## Validation
- **Test**: DOM node count stays under 50 on initial load; scroll triggers new renders
- **Method**: E2E Test + Unit Test
