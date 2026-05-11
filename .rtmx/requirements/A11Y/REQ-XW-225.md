# REQ-XW-225: Descriptive Alt Text for Military Symbol Renderers

## Description

The `MilSymRenderer` and `MilSymRendererLive` components currently render military symbol images with the raw SIDC as alt text, which is not meaningful to screen reader users. Add an optional `label` prop to both components. When `label` is provided, the alt text should be formatted as `"{label} ({sidc})"`, giving users both the human-readable name and the technical identifier. Update all callers that have access to entity labels -- specifically BrowsePanel entity cards, the Compare panel, and Palettes markers -- to pass the label.

## Acceptance Criteria

1. `MilSymRenderer` accepts an optional `label?: string` prop.
2. `MilSymRendererLive` accepts an optional `label?: string` prop.
3. When `label` is provided, the rendered `<img>` element has `alt="{label} ({sidc})"`.
4. When `label` is not provided, the rendered `<img>` element has `alt="{sidc}"` (current behavior preserved).
5. In the BrowsePanel, entity cards pass `entity.label` (or equivalent entity name field) to `MilSymRenderer` or `MilSymRendererLive` as the `label` prop.
6. In the Compare panel, symbols are rendered with the entity label passed as the `label` prop.
7. In the Palettes Markers panel, markers are rendered with their label passed to the renderer.
8. No existing callers that lack label data are broken; the prop is optional and backward compatible.

## Test Approach

- **Unit test**: Render `MilSymRenderer` with `label="Infantry Platoon"` and `sidc="10031000161211000000"` and assert `alt` equals `"Infantry Platoon (10031000161211000000)"`.
- **Unit test**: Render `MilSymRenderer` with only `sidc` and assert `alt` equals the SIDC string.
- **Unit test**: Render `MilSymRendererLive` with and without `label` and assert the same alt text behavior.
- **Static analysis**: Grep BrowsePanel for `label={entity.label}` or equivalent prop passing to the renderer.
- **Accessibility audit**: Run axe-core on rendered pages and verify no missing-alt violations on symbol images.

## Implementation Notes

- The `label` prop should be typed as `label?: string` in the component's props interface.
- Alt text template: `` alt={label ? `${label} (${sidc})` : sidc} ``
- In BrowsePanel, the entity data structure likely has a `label`, `name`, or `designation` field. Use whichever is the human-readable name.
- If some callers do not have a meaningful label available, they should simply not pass the prop, preserving current behavior.
- This change is backward compatible and requires no migration.

## Effort Estimate

0.25 weeks
