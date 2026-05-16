# REQ-SYM-008: Safety Constraint Taxonomy

## Description
Formalize the vocabulary for riskLevel, proximityRules, mutualExclusions,
and hierarchyRules used in doctrinal safety constraints. This controlled
vocabulary ensures consistent machine-readable safety metadata across all
doctrine data files.

## Approach
- Define controlled vocabulary for riskLevel: low, medium, high, critical
- Standardize proximity rule patterns (minDistance, unit, referenceType)
- Enumerate mutual exclusion pairs (e.g., NFA cannot overlap kill box)
- Define hierarchy levels matching NATO/US echelon terminology
- Document in taxonomy reference file (schemas/safety-taxonomy.json)
- CI validation checks terminology compliance across all doctrine files

## Acceptance Criteria
- [ ] Taxonomy document published as schemas/safety-taxonomy.json
- [ ] All Tier 1 entities use only standardized vocabulary terms
- [ ] riskLevel values restricted to low/medium/high/critical
- [ ] proximityRules follow standardized pattern structure
- [ ] CI validation checks terminology compliance on every build

## Validation
- **Test**: Manual review + CI vocabulary check
- **Method**: Manual Review + CI Integration
