# REQ-SYM-005: Doctrine Schema Definition

## Description
JSON Schema for `mil-std-2525-doctrine.schema.json` defining per-symbol
doctrinal definitions, usage guidance, safety constraints, and embedding text.
The schema provides the structural contract for all downstream doctrine data
files and enables automated validation in CI.

## Approach
- Draft 2020-12 JSON Schema with strict additionalProperties: false
- Version-keyed definitions object (b/c/d/e) allowing null for absent versions
- Structured safety constraints with machine-readable aiValidation block
- UsageGuidance object with establishedBy, requiredModifiers, doctrinalRules
- Pre-flattened embeddingText field for deterministic vector embedding generation
- Schema published as part of @iotactical/tak-data package exports

## Acceptance Criteria
- [ ] Schema validates sample doctrine entries without errors
- [ ] Covers VersionDefinitions with nullable per-version definition strings
- [ ] Covers UsageGuidance with establishedBy, requiredModifiers, doctrinalRules
- [ ] Covers SafetyConstraints with riskLevel, proximityRules, mutualExclusions
- [ ] Covers AIValidation with machine-readable constraint references
- [ ] Published via @iotactical/tak-data schemas export path

## Validation
- **Test**: scripts/validate-doctrine.mjs
- **Method**: Schema Validation
