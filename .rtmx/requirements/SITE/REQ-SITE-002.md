# REQ-SITE-002: Component Gallery

## Description
Interactive gallery of all React components rendered live on the preview site.
Each component shows usage examples, available props, variants, and states.

## Acceptance Criteria
- [ ] Every exported React component has a gallery entry
- [ ] Each entry shows: live render, prop table, code snippet
- [ ] Variant selector for components with variants (Button, DialogPanel, etc.)
- [ ] State visualization (hover, pressed, disabled, error)
- [ ] Components render with actual TAK design tokens applied

## Validation
- **Test**: tests/site/test_component_gallery.mjs::test_gallery_pages
- **Method**: Integration Test
