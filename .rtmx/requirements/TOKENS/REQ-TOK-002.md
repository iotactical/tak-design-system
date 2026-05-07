# REQ-TOK-002: Semantic Token References

## Description
Semantic tokens must correctly reference core tokens. All token references must resolve without errors.

## Acceptance Criteria
- [ ] Affiliation colors (friendly, hostile, neutral, unknown, suspect, pending) defined
- [ ] Status colors (success, warning, error, info) defined
- [ ] Surface colors (dark/light variants) defined
- [ ] Text colors with accessibility contrast defined
- [ ] Map-specific tokens (route, danger zone, safe zone, selection) defined
- [ ] Team palette (15 ATAK standard colors) defined
- [ ] All token references resolve to valid core tokens

## Validation
- **Test**: tests/tokens/test_semantic.mjs::test_semantic_refs_resolve
- **Method**: Unit Test
