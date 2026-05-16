# REQ-SYM-007: SS25 Tier 2 Doctrinal Definitions (Remaining Entities)

## Description
Complete SS25 coverage with doctrinal definitions for remaining ~397 entities
not in Tier 1. Source from MIL-STD-2525D/E Appendix B and FM 1-02. These
lower-priority entities include planning, meteorological, and space symbols.

## Approach
- Same schema as Tier 1 (mil-std-2525-doctrine.schema.json)
- Lower priority entities: planning, meteorological, space, general maneuver
- Definitions sourced from MIL-STD-2525D/E standard PDFs and FM 1-02
- Risk levels generally low/medium for non-fire-support entities
- Append to ss25-control-measures.json maintaining sorted entity code order

## Acceptance Criteria
- [ ] All SS25 entity codes in b2d.json or msd.json have doctrine entries
- [ ] Complete version coverage where applicable (null where version lacks entity)
- [ ] All entries pass schema validation
- [ ] embeddingText populated for every entry
- [ ] No duplicate entity codes across Tier 1 and Tier 2

## Validation
- **Test**: scripts/validate-doctrine.mjs
- **Method**: Completeness Validation
