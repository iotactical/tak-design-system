# REQ-SITE-035: Sources page links resolve to authoritative upstream references

## Description
The Sources page presents itself as the list of authoritative references behind the
design system, so a link that does not resolve, or that resolves to something other
than the source of record, misleads the reader. Every entry must point at the
canonical upstream and must be reachable from a phone as well as a desktop.

Two classes of failure motivated this requirement. The ATAK-CIV and TAK Server
entries pointed at repositories under a personal account that return 404, rather
than the TAK Product Center repositories the design system actually derives from.
Both Figma entries shared a single community file ID that no longer exists, which
returns 404 to a mobile user agent, so the Design section was a dead end on the
device most likely to open it.

## Approach
- Link ATAK-CIV to `TAK-Product-Center/atak-civ` and TAK Server to
  `TAK-Product-Center/Server`, the upstreams named in the REQ-SITE-007 source
  material
- Point the Figma entries at their separate ATAK and WinTAK community files,
  including the URL slug, which is what makes them resolve on mobile
- Describe the Figma kits as unofficial, since they disclaim affiliation with the
  TAK Product Center and this page otherwise implies endorsement
- Note on those entries that pulling a kit into a library needs a desktop browser
- Key the cards on name; two entries sharing a URL also collided as React keys

## Acceptance Criteria
- [x] Every source URL uses https
- [x] No two entries share a URL
- [x] GitHub entries for ATAK-CIV and TAK Server point at TAK Product Center
- [x] Every GitHub link names both an owner and a repository
- [x] Figma community links carry the file slug so they resolve on mobile
- [x] Figma entries carry a note that they need a desktop browser to reuse
- [x] Page does not scroll sideways at 360px

## Validation
- **Test**: tests/site/test_sources.mjs, tests/e2e/mobile-responsive.spec.ts
- **Method**: Unit Test, E2E Test
