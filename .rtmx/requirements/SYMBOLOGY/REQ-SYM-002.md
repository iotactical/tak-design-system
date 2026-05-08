# REQ-SYM-002: Design Token to Renderer Affiliation Color Bridge

## Description
Bridge TAK design system affiliation color tokens to the color input
APIs used by mil-sym renderers (mil-sym-ts, mil-sym-java, mil-sym-android).
The renderers hardcode affiliation colors internally; this bridge allows
the design system to be the single source of truth for those values.

## Approach
- Map takTokens.affiliation.{friendly,hostile,neutral,unknown,suspect,pending}
  to the AffiliationColors configuration in each mil-sym renderer
- Produce platform-specific config: JS object for mil-sym-ts, Java properties
  for mil-sym-java, XML for mil-sym-android
- Build step generates bridge files from W3C semantic tokens

## Acceptance Criteria
- [ ] Bridge config generated for mil-sym-ts (JS/JSON)
- [ ] Bridge config generated for mil-sym-java (properties or constants)
- [ ] Bridge config generated for mil-sym-android (XML resources)
- [ ] Colors match semantic.affiliation token values exactly
- [ ] Build pipeline produces bridge files alongside platform outputs

## Validation
- **Test**: tests/symbology/test_color_bridge.mjs::test_affiliation_color_bridge
- **Method**: Unit Test
