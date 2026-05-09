# REQ-XW-081: Skittles Palette Tab (Team Member Circles)

## Description
The "Skittles" are ATAK's team member markers as seen by other users on the
map. They are small colored circles (rendered from reference_point.png tinted
with the user's team color) with a role abbreviation text overlay. This is
distinct from the Self Marker (directional arrow).

The Skittles tab shows every combination of team color and role as rendered
circles matching ATAK's SpotMapIconAdapter behavior: reference_point.png
base icon + setColor() tint + role text overlay.

## ATAK Source
- Base icon: assets/icons/reference_point.png (32x32 circle with raised edge)
- Tinting: SpotMapIconAdapter.java applies Icon.Builder.setColor(0, color)
- Role abbreviations: TL (Team Lead), HQ, S (Sniper), M (Medic), FO
  (Forward Observer), RTO, K9, blank (Team Member)
- Affiliation dots: fdot.png (friendly), hdot.png (hostile), ndot.png
  (neutral), udot.png (unknown) -- colored by affiliation, not team

## Layout
- **Team Color Grid**: 15 circles, one per team color
- **Role x Color Matrix**: 8 roles x 15 colors = 120 skittles, showing the
  role abbreviation text overlay on each
- **Staleness States**: connected (full), stale (faded), expired (grayed)
  for representative colors
- **Affiliation Dots**: 4 CoT affiliation-colored dots (f/h/n/u)
- **Size comparison**: reference_point vs ic_self side-by-side to show
  the difference between skittle and self marker

## Acceptance Criteria
- [ ] "Skittles" tab appears in Palettes page
- [ ] Renders colored circles (not arrows) matching reference_point.png
- [ ] All 15 team colors displayed
- [ ] Role text overlay for all 8 roles
- [ ] Staleness visual states (opacity reduction)
- [ ] Affiliation dots (friendly/hostile/neutral/unknown)
- [ ] Visual comparison with Self Marker arrows

## Validation
- **Test**: tests/site/test_skittle_palette.mjs::test_skittle_circle_tab
- **Method**: Integration Test
