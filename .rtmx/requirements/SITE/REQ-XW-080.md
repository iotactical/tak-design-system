# REQ-XW-080: Skittles Palette Tab with Live Rendered Variants

## Description
A dedicated "Skittles" tab in the Palettes page showing every variant of the
SkittleMarker component rendered live. This is the most recognizable visual
element in the TAK ecosystem -- colored directional arrows representing team
members on the map. The tab displays all permutations: 15 team colors, 3
connectivity states, 8 roles, 4 affiliation dots, and heading angles.

## Layout
- **Team Color Grid**: 15 arrows in a row, one per team color, all same heading
- **Staleness States**: 3 columns (connected, stale, expired) x 15 colors = 45
- **Role Variants**: 8 rows (one per role) x representative colors
- **Affiliation Dots**: 4 dots (friendly, hostile, neutral, unknown)
- **Heading Rose**: Single marker at 8 compass headings (N/NE/E/SE/S/SW/W/NW)
- **Interactive Controls**: Sliders/selectors to customize team color, heading,
  state, role, and size in a live preview area

## Acceptance Criteria
- [ ] "Skittles" tab appears in Palettes page tab bar
- [ ] All 15 team colors rendered as arrow markers
- [ ] All 3 connectivity states shown (connected, stale, expired)
- [ ] All 8 role badge variants shown
- [ ] All 4 affiliation dot variants shown
- [ ] Heading rotation demonstrated at 8 compass points
- [ ] Interactive controls allow customizing a live preview marker
- [ ] Uses the actual SkittleMarker React component (not static images)

## Validation
- **Test**: tests/site/test_skittle_palette.mjs::test_skittle_palette_tab
- **Method**: Integration Test
