# REQ-STY-011: ATAK Custom Attribute Definitions

## Description
All 32 custom attributes defined in ATAK's `attrs.xml` must be mapped to W3C component token interfaces. ATAK defines custom view attributes (via `<declare-styleable>`) that allow XML layouts to configure component behavior and appearance beyond standard Android attributes. These custom attributes represent the component API surface -- they define what is configurable on each custom ATAK widget. Mapping them to token interfaces ensures that every platform implementation exposes the same configuration surface, preventing feature drift between WinTAK, WebTAK, and TAKX.

Custom attribute categories include:
- **Color attributes**: custom tint colors, indicator colors, state colors for custom views
- **Dimension attributes**: custom sizes, thicknesses, offsets not covered by standard Android attrs
- **Enum/flag attributes**: mode selectors, alignment flags, state enumerations
- **Boolean attributes**: feature toggles, visibility flags, behavior switches
- **Reference attributes**: drawable references, style references, layout references
- **String attributes**: format strings, label templates

Each attribute must be documented with its name, format/type, default value (if any), and the styleable group it belongs to.

## Acceptance Criteria
- [ ] A `component/custom-attrs` group exists in `tokens/w3c/component.json` listing all 32 custom attributes.
- [ ] Each attribute token entry includes: `$type` matching the attribute format (color, dimension, number, string, boolean), `$value` set to the default, and `$description` explaining the attribute's purpose.
- [ ] Color-format attributes use `$type: "color"` and reference core palette tokens as defaults.
- [ ] Dimension-format attributes use `$type: "dimension"` and reference core dimension tokens as defaults.
- [ ] Enum-format attributes include a `$extensions` block listing valid enum values and their numeric mappings.
- [ ] Boolean-format attributes use `$type: "boolean"` with a documented default of `true` or `false`.
- [ ] Every attribute is associated with its parent `<declare-styleable>` group via a metadata field or naming convention (e.g., `custom-attrs/NavButton/iconTint`).
- [ ] The count of custom attribute tokens is >= 32.
- [ ] The token file passes `style-dictionary` validation without errors.

## Validation
- **Test**: tests/styles/test_custom_attrs.mjs::test_all_32_custom_attrs_present
- **Method**: Unit Test
- **Test**: tests/styles/test_custom_attrs.mjs::test_attr_types_match_format
- **Method**: Unit Test
- **Test**: tests/styles/test_custom_attrs.mjs::test_enum_attrs_have_valid_values
- **Method**: Unit Test
- **Test**: tests/styles/test_custom_attrs.mjs::test_color_attrs_reference_core_palette
- **Method**: Unit Test
