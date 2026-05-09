# REQ-SYM-004: MIL-STD-2525B-to-D/E Crosswalk from old-mil-sym-java

## Description
Extract the MIL-STD-2525B entity code table from the retired
missioncommand/old-mil-sym-java repository (which supported B and C) and
build the B-to-D/E crosswalk dataset. The C-to-D crosswalk already exists
in mil-sym-ts (c2d.json, 1,915 entries). Chaining B-to-C (from old repo)
with C-to-D (from mil-sym-ts) yields B-to-D, and D-to-E is 97% identity.

## Approach
- Clone old-mil-sym-java, extract B entity code tables from Java source
- Map B codes to C codes (structural identity, different code table values)
- Chain with existing C-to-D crosswalk from mil-sym-ts c2d.json
- Output: data/mil-std-2525/b2d.json matching c2d.json format
- Canonical intermediate form for hub-and-spoke conversion

## Acceptance Criteria
- [ ] data/mil-std-2525/b2d.json exists with B-to-D mappings
- [ ] Covers all entity codes present in old-mil-sym-java B tables
- [ ] Bidirectional: D codes map back to B where valid B equivalent exists
- [ ] Lossy mappings flagged (D/E entities with no B equivalent)
- [ ] Format compatible with missioncommand c2d.json structure

## Validation
- **Test**: tests/symbology/test_b2d_crosswalk.mjs::test_b2d_crosswalk_valid
- **Method**: Unit Test
