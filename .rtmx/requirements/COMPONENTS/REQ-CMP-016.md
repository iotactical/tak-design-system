# REQ-CMP-016: Skittle/Team Marker Component

## Description
The "skittle" is ATAK's signature team member marker -- a colored directional
arrow/puck displayed on the map for each connected user. The color indicates
team assignment (15 ATAK team colors), the arrow direction indicates heading,
and the visual state indicates connectivity (solid=connected, faded=stale,
grayed=expired). This is the most recognizable visual element in the TAK
ecosystem and must be pixel-accurate across platforms.

ATAK renders skittles by tinting `ic_self.png` (the directional arrow) with
the user's team color and applying staleness-based opacity. The colored dots
(`bluedot.png`, `fdot.png` for friendly, `hdot.png` for hostile, `ndot.png`
for neutral, `udot.png` for unknown) represent affiliation-colored simplified
variants.

## ATAK Source References
- Self marker icon: `res/drawable/ic_self.png`, `ic_self_tintable.png`, `ic_self_white.png`
- Affiliation dots: `res/drawable-hdpi/{blue,f,h,n,u,red,green,yellow,white}dot.png`
- Team color preference: `locationTeam` (default: "Cyan")
- Staleness logic: `CotMarkerRefresher.java` (forceStale, expireUnknowns, expireEverything)
- Color tinting: `IconsMapAdapter.java`, `CoTIcon.colorBitmap()`
- Roles: Team Member, Team Lead, HQ, Sniper, Medic, Forward Observer, RTO, K9

## Acceptance Criteria
- [ ] SkittleMarker React component renders directional arrow with team color tint
- [ ] Supports all 15 ATAK team colors (White through Pink)
- [ ] Heading rotation (0-360 degrees)
- [ ] Connectivity states: connected (full opacity), stale (reduced opacity), expired (grayed)
- [ ] Role icon variants (8 roles with _human and _nogps sub-variants)
- [ ] Affiliation dot variants (friendly, hostile, neutral, unknown)
- [ ] Self marker vs. other team member visual distinction

## Validation
- **Test**: tests/components/test_skittle.mjs::test_skittle_component
- **Method**: Unit Test
