# REQ-AST-003: MIL-STD-2525 Symbol Mapping

## Description
MIL-STD-2525 symbol mapping CSV must be valid and provide bidirectional code lookups.

## Acceptance Criteria
- [ ] data/mil-std-2525/ms2525cd-mapping.csv is valid CSV
- [ ] Maps SUAML codes to 11-digit D-codes
- [ ] Covers units, equipment, special operations, environmental indicators

## Validation
- **Test**: tests/assets/test_milstd_csv.mjs::test_milstd_csv_valid
- **Method**: Unit Test
