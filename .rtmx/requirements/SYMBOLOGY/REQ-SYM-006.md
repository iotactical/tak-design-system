# REQ-SYM-006: SS25 Tier 1 Doctrinal Definitions (40 High-Risk Entities)

## Description
Populate doctrinal definitions for 40 highest-risk Symbol Set 25 control
measures (fire support, kill boxes, NFAs, boundaries, etc.) seeded from
multipoint-examples.ts. These entities carry critical safety implications
and require complete doctrinal coverage before any AI-assisted placement.

## Approach
- One JSON file per symbol set (ss25-control-measures.json)
- Seed from existing descriptions in multipoint-examples.ts
- Version-specific definitions (b/c/d/e with null for absent versions)
- Structured usage guidance with establishedBy, requiredModifiers, doctrinalRules
- Safety constraints with riskLevel, proximityRules, mutualExclusions
- Pre-generated embeddingText concatenated from structured fields

## Acceptance Criteria
- [ ] 40 entities populated in ss25-control-measures.json
- [ ] Every entity has at least one non-null version definition
- [ ] All critical/high risk entities have complete safety constraints
- [ ] embeddingText non-empty for all 40 entries
- [ ] Passes schema validation against mil-std-2525-doctrine.schema.json

## Validation
- **Test**: scripts/validate-doctrine.mjs
- **Method**: Schema + Completeness Validation
