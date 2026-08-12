# REQ-SITE-031: Interfaces intent table scrollable on mobile

## Description
The intent catalog table holds an action name, a type badge, and a fully qualified
class name. Squeezing three columns of monospace identifiers into a phone viewport
made the action and class columns unreadable. The table keeps a legible minimum
width and scrolls inside its own wrapper, so the page itself never scrolls
sideways.

## Approach
- Wrap the table in `.intentTableWrap` with `overflow-x: auto` on mobile
- Give the table a 560px minimum width below 768px
- Release the sticky header on mobile: a scroll container on the wrapper would pin
  the header to the wrapper rather than the viewport

## Acceptance Criteria
- [x] Table is wrapped in a container with `overflow-x: auto` on mobile
- [x] Table keeps a minimum width so columns stay legible
- [x] `-webkit-overflow-scrolling: touch` enables momentum scrolling
- [x] Sticky header is disabled where it would otherwise misbehave
- [x] Row expansion and code snippets still work inside the wrapper

## Validation
- **Test**: tests/site/test_mobile_perf.mjs, tests/e2e/mobile-responsive.spec.ts
- **Method**: Unit Test, E2E Test
