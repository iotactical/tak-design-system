# REQ-SITE-007: BDD Workflow Specifications in Gherkin Syntax

## Description
Produce Behavior-Driven Development specifications in Gherkin syntax
documenting the major TAK workflows. This creates a machine-readable,
human-understandable specification of how TAK features behave across
platforms, enabling cross-platform behavioral consistency verification.

Source material: ATAK source at github.com/TAK-Product-Center/atak-civ,
local ATAK source at ~/Downloads/atak-master, WinTAK SDK documentation.

## Candidate Workflows
The original list. The first six have files under REQ-XW-050 through 055.
REQ-SITE-043 expands this to the ATAK core catalog (self marker, palettes,
mission packages, layers, geofence, orientation, overlays, range-bearing,
bloodhound, drawing, attachments, import/export, emergency, viewshed, radial
menu, GPS, pairing line, tracks, go-to, video, fires, contacts).

- Self marker placement and team assignment
- CoT marker creation, transmission, and expiry (staleness lifecycle)
- Team member discovery and roster management
- Route planning and navigation
- GeoChat messaging between users and channels
- 9-line CAS/MEDEVAC form submission
- Icon palette selection and marker customization
- Plugin loading and lifecycle
- Connection management (TAK Server, mesh networking)
- Data package import/export
- Map layer management
- Geofence creation and alerting

## Acceptance Criteria
- [x] Gherkin .feature files for the original six workflows (REQ-XW-050..055)
- [x] Scenarios cover happy path and key error paths (in those six)
- [x] Steps reference TAK design system components where applicable
- [x] Feature files parseable by standard Gherkin tooling (Cucumber)
- [x] Remaining candidates from this list are specified under REQ-SITE-043

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
