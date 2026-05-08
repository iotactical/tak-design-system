# REQ-CMP-008: NineLineForm

## Description
The NineLineForm component renders structured military form templates used in ATAK for close air support (CAS 9-line), MEDEVAC (9-line), and similar standardized reports. These forms have a fixed sequence of numbered fields with specific data types (coordinates, frequencies, descriptions, enumerations). Cross-platform consistency is critical because these forms are used in life-safety operations; field order, validation rules, and data formatting must be identical on every TAK client to prevent misinterpretation.

## Acceptance Criteria
- [ ] Renders a numbered form with sequential labeled fields matching the selected template
- [ ] Supports at minimum: CAS 9-Line, MEDEVAC 9-Line, UXO/IED Report, SALUTE Report
- [ ] Each field has a defined input type: text, coordinate, frequency, enumeration, numeric
- [ ] Coordinate fields use the CoordinateDisplay format and provide map-tap input
- [ ] Enumeration fields render as dropdowns with MIL-STD option sets
- [ ] Validates required fields and highlights incomplete entries before submission
- [ ] Supports save-as-draft and resume editing
- [ ] Generates a CoT message payload from completed form data
- [ ] Displays a read-only review mode before final submission
- [ ] Form template definitions are data-driven (JSON schema) for extensibility
- [ ] Applies design tokens: surface.form, text.label, text.input, border.field, color.error
- [ ] Line numbers are prominently displayed in a left gutter matching ATAK layout
- [ ] Tab/Enter advances to the next field; Shift+Tab goes back

## Validation
- **Test**: tests/components/test_nine_line_form.mjs::renders_cas_nine_line
- **Test**: tests/components/test_nine_line_form.mjs::renders_medevac_nine_line
- **Test**: tests/components/test_nine_line_form.mjs::validates_required_fields
- **Test**: tests/components/test_nine_line_form.mjs::coordinate_field_map_tap
- **Test**: tests/components/test_nine_line_form.mjs::generates_cot_payload
- **Test**: tests/components/test_nine_line_form.mjs::save_and_resume_draft
- **Method**: Unit Test, Schema Validation Test
