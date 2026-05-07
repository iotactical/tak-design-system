# REQ-TOK-006: MIL-STD-2525E Symbol Identification Support

## Description
Add support for MIL-STD-2525E (current standard, released 2014) which uses
20-character Symbol Identification Codes (SIDC) replacing the 15-character
format from 2525C/D. The existing ms2525cd-mapping.csv only covers legacy
C/D codes.

## Acceptance Criteria
- [ ] MIL-STD-2525E SIDC mapping data file exists (data/mil-std-2525/)
- [ ] 20-character SIDC format supported
- [ ] Mapping between 2525E SIDCs and legacy 2525C/D codes where applicable
- [ ] Affiliation field positions updated for 2525E encoding
- [ ] Symbol set codes for common TAK entity types covered

## Validation
- **Test**: tests/assets/test_milstd_2525e.mjs::test_2525e_mapping_valid
- **Method**: Unit Test
