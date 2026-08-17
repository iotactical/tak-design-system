# REQ-SITE-043: ATAK core workflows each have a Gherkin definition

## Description
REQ-SITE-007 listed twelve TAK workflows and accepted six parseable `.feature`
files as done. ATAK-CIV exposes far more than that: 79 intent namespaces and 434
broadcast actions, plus radial menus, overlay hierarchy, layers, geofences,
mission packages, and the map tools operators actually use. Six files leave most
of that unspecified, so cross-platform behavior cannot be checked against a
shared definition.

This requirement replaces the "six files" target with a catalog of ATAK *core*
workflows (the product, not every plugin). Jumpmaster, SSE, and similar
plugin-delivered tools stay out until they ship in the design system. Each
catalog entry is a Gherkin file under `specs/` with a happy path, at least one
failure or edge path, and steps that name the design-system component where one
exists.

## Catalog

Already specified (REQ-XW-050 through 055):

| File | Workflow |
|------|----------|
| `specs/cot-lifecycle.feature` | CoT marker create, send, receive, stale, expire |
| `specs/team-management.feature` | Team color, roster, discovery, staleness, roles |
| `specs/geochat.feature` | Channels, send/receive, unread, coordinate links |
| `specs/route-planning.feature` | Waypoints, distance, reorder, export |
| `specs/nine-line.feature` | MEDEVAC / SALUTE templates, validate, submit |
| `specs/connections.feature` | TAK Server, reconnect, plugins, mesh |

Required additions (derived from ATAK intent namespaces and the SITE-007 remainder):

| File | ATAK source | Design-system hook |
|------|-------------|-------------------|
| `self-marker.feature` | `location`, `selfcoordoverlay` | `SkittleMarker`, `GPSStatus` |
| `icon-palettes.feature` | `icons`, `user.icon` | `TakIcon`, Palettes page |
| `mission-packages.feature` | `missionpackage` | Interfaces / data packages |
| `map-layers.feature` | `layers`, `grg` | overlay tokens |
| `geofence.feature` | `geofence.component` | — |
| `map-orientation.feature` | `mapcompass`, `compass` | `ToolBar`, `CoordinateDisplay` |
| `overlay-hierarchy.feature` | `hierarchy` | Overlay manager |
| `range-bearing.feature` | `toolbars` (RB/IQ) | `RangeBearing` |
| `bloodhound.feature` | `bloodhound` | — |
| `drawing-tools.feature` | `drawing`, `editableShapes` | Tactical Graphics |
| `attachments.feature` | `attachment`, `image`, `quickpic` | Marker attachments |
| `import-export.feature` | `importexport`, `importfiles` | KML / CoT / files |
| `emergency-alert.feature` | `emergency` | — |
| `viewshed.feature` | `elev`, `viewshed` | Elevation |
| `radial-menu.feature` | `menu` | `RadialMenu` |
| `gps-location.feature` | `location` | `GPSStatus`, `CoordinateDisplay` |
| `pairing-line.feature` | `pairingline` | — |
| `tracks.feature` | `track` | breadcrumbs |
| `coordinate-goto.feature` | `coordinate`, `coordoverlay` | `CoordinateDisplay` |
| `video-stream.feature` | `video` | — |
| `fires.feature` | `fires`, `nineline` CAS path | `NineLineForm` |
| `contacts.feature` | `contact` | `UserList`, `ChatPanel` |

Plugin-only namespaces (`jumpmaster`, `ssetool`, `geocam` as a selected plugin)
are explicitly out of catalog for this requirement. Remaining Software User
Manual chapters (Red X, radio, lasso, resection, and the rest) are catalogued
and specified under REQ-SITE-045 and REQ-SITE-046.

## Approach
- One `.feature` per catalog row, in `specs/`
- Minimum four scenarios: at least one happy path, one validation or failure path
- `Background` where the connection or map is a shared given
- Scenarios follow ATAK Civilian Software User Manual instructions (REQ-SITE-044):
  quote the SUM step, then map it to a React component, CoT type, intent, and
  preference
- Discover files from disk in `tests/bdd/test_gherkin.mjs`; do not hardcode a
  six-file allowlist

## Acceptance Criteria
- [x] `specs/` contains every file in the catalog above
- [x] Every catalog file starts with `Feature:` and has at least four `Scenario:`
      blocks each containing Given, When, and Then
- [x] SITE-007 remainder (self marker, palettes, data packages, layers, geofence)
      is covered
- [x] Tests fail if a catalog file is deleted
- [x] Tests do not treat a six-file directory as complete
- [x] Plugin-only tools remain unspecified until a later requirement
- [x] SUM-to-platform mapping is required by REQ-SITE-044

## Validation
- **Test**: tests/bdd/test_gherkin.mjs
- **Method**: Unit Test
