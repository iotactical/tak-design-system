# REQ-SYM-001: MIL-STD-2525B to D/E Crosswalk Dataset

## Description
Build the missing crosswalk from MIL-STD-2525B 15-character SIDCs to
2525D/E 20-character SIDCs. The missioncommand/mil-sym-ts project provides
a C-to-D crosswalk (c2d.json, 1,915 entries) but no B-to-anything mapping.
WinTAK still uses Mil2525BIconManager, making this a genuine gap.

## Approach
- Use canonical intermediate form (hub-and-spoke, not pairwise)
- B normalizer maps 15-char B SIDC to canonical struct
- D/E emitter maps canonical struct to 20-char SIDC
- Reuse missioncommand C2DLookup patterns where applicable
- Dataset format: JSON matching c2d.json structure for upstream contribution

## Acceptance Criteria
- [ ] b2d.json crosswalk file maps B 15-char SIDCs to D 20-char fields
- [ ] Covers all entity codes present in WinTAK Mil2525B icon set
- [ ] Bidirectional: D/E codes map back to B where a valid B equivalent exists
- [ ] Lossy mappings flagged (D/E entities with no B equivalent)
- [ ] Format compatible with missioncommand/mil-sym-ts c2d.json structure

## Validation
- **Test**: tests/symbology/test_b2d_crosswalk.mjs::test_b2d_crosswalk_valid
- **Method**: Unit Test
