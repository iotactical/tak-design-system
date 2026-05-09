# REQ-XW-083: Redesign Overview Page as Design System Dashboard

## Description
The Overview page currently shows static token counts. Replace it with a
useful design system dashboard that serves as a landing page and quick
reference. Should answer: "What is this system, what does it contain,
and how do I use it?"

## Content
- Project title, version, one-line description
- Quick-start code snippet (npm install + import)
- Stats dashboard: token count, component count, icon count, palette count,
  platform output count, test count, RTM completion percentage
- Recent changes / changelog summary
- Navigation cards linking to each major section (Colors, Components,
  Icons, Palettes, Platforms) with icon and description
- Platform support matrix (ATAK, WinTAK, WebTAK, VS Code)
- Links: GitHub repo, npm package, RTMX status

## Acceptance Criteria
- [ ] Dashboard shows live token/component/icon counts (not hardcoded)
- [ ] Quick-start code snippet with copy button
- [ ] Navigation cards to all major sections
- [ ] Platform support matrix
- [ ] Responsive layout

## Validation
- **Test**: tests/site/test_overview.mjs::test_overview_dashboard
- **Method**: Integration Test
