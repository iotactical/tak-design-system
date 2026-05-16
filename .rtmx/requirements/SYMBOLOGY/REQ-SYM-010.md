# REQ-SYM-010: CI Validation for Doctrine Data

## Description
Automated CI validation for doctrine data files including schema validation,
completeness checks, cross-reference integrity, and safety constraint
completeness. Ensures doctrine data quality is maintained on every commit.

## Approach
- Node.js script (scripts/validate-doctrine.mjs)
- Validates against JSON Schema via ajv (Draft 2020-12 support)
- Checks every Tier 1 entityCode exists in b2d.json or msd.json
- Verifies embeddingText non-empty for all entries
- Ensures critical/high risk entities have all safety fields populated
- Integrated into build-and-release workflow with exit code 1 on failure

## Acceptance Criteria
- [ ] Validation script runs in CI (build-and-release workflow)
- [ ] Catches schema violations with descriptive error messages
- [ ] Catches missing entity codes not present in crosswalk data
- [ ] Catches empty embeddingText fields
- [ ] Exit code 1 on any validation failure

## Validation
- **Test**: scripts/validate-doctrine.mjs
- **Method**: CI Integration Test
