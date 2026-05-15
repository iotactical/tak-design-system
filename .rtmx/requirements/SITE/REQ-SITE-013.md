# REQ-SITE-013: Single-Point Control Measure Handling

## Description
SS25 entities fall into two categories: multipoint graphics (rendered by `WebRenderer.RenderSymbol` as GeoJSON geometry) and single-point icons (rendered by `MilStdIconRenderer.RenderSVG` as SVG). The Control Measures panel must distinguish between these. When a single-point entity is selected, the panel displays its icon via `MilSymRenderer` alongside a message explaining it is a single-point symbol rendered in the Browse tab. The entity tree in the sidebar visually distinguishes single-point vs multipoint entities. The `ControlMeasuresPanel` defaults `minPoints` to 1 for entities without example data so that future multipoint entities without examples can still be plotted.

Single-point SS25 entities include: Action Point (130100), Amnesty Point (130200), Checkpoint (130300), Contact Point (130500), Coordinating Point (130600), Decision Point (130700), Waypoint (131800), and others in the 13xxxx and 18xxxx groups. These return `"is not a multipoint symbol"` from `WebRenderer.RenderSymbol`.

## Acceptance Criteria
- [ ] When a single-point entity is selected, the map area shows the entity's icon (via `MilSymRenderer`) centered, with a label "Single-point symbol -- view in Browse tab".
- [ ] Map click-to-plot is disabled for single-point entities.
- [ ] Single-point entities in the sidebar tree have a distinct visual indicator (e.g., a dot icon vs a line icon).
- [ ] Multipoint entities without example data default to `minPoints: 1` so a single user click triggers a render attempt.
- [ ] If `WebRenderer.RenderSymbol` returns an error containing "not a multipoint symbol", the panel falls back to displaying the icon.
- [ ] At least the 15 entities in group 13 (Control Points) and 25 entities in group 18 (Airspace Control Points) are correctly identified as single-point.

## Validation
- **Test**: tests/site/test_control_measures.mjs::test_single_point_shows_icon
- **Test**: tests/site/test_control_measures.mjs::test_single_point_no_plot
- **Test**: tests/site/test_control_measures.mjs::test_multipoint_default_minpoints
- **Method**: Integration Test
