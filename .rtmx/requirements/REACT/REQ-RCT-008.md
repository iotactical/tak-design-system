# REQ-RCT-008: TakIcon Component

## Description
A React component in the `@iotactical/tak-react` package that renders any ATAK drawable by name. `TakIcon` accepts a `name` prop corresponding to a drawable name from `data/atak-drawable-catalog.json` and resolves the drawable type at runtime to select the correct rendering strategy: SVG `<img>` for vectors, CSS-styled `<div>` for shapes, resolved default-state preview for selectors, composited layers for layer-lists, or PNG `<img>` for bitmaps and nine-patches. The component lazy-loads its catalog data to avoid bundling all 1,317 entries into the consumer's application. It works as a standalone component without requiring `TakThemeProvider` as a parent, while optionally integrating with the theme context when available.

## Acceptance Criteria
- [ ] `TakIcon` is exported from `@iotactical/tak-react` package index.
- [ ] Props interface: `name` (string, required), `size` (`'sm' | 'md' | 'lg' | 'xl'`, default `'md'`), `className` (optional), `style` (optional), `alt` (optional), `fallback` (ReactNode, optional).
- [ ] Renders vector drawables as `<img>` with SVG source and lazy loading.
- [ ] Renders PNG/nine-patch drawables as `<img>` with PNG source and lazy loading.
- [ ] Renders shape drawables via ShapeRenderer (REQ-RCT-009).
- [ ] Renders selector drawables via SelectorRenderer (REQ-RCT-010).
- [ ] Renders layer-list drawables via LayerListRenderer (REQ-RCT-011).
- [ ] Displays `fallback` content when the drawable name is not found in the catalog.
- [ ] Catalog data is loaded lazily via dynamic `import()`.
- [ ] Renders correctly without `TakThemeProvider` in the tree.
- [ ] Tree-shakeable: importing `TakIcon` alone does not pull in unrelated components.
- [ ] TypeScript types exported: `TakIconProps`, `TakIconSize`.

## Validation
- **Test**: tests/react/test_tak_icon.mjs::test_tak_icon_renders_vector
- **Test**: tests/react/test_tak_icon.mjs::test_tak_icon_renders_shape
- **Test**: tests/react/test_tak_icon.mjs::test_tak_icon_renders_selector
- **Test**: tests/react/test_tak_icon.mjs::test_tak_icon_renders_png
- **Test**: tests/react/test_tak_icon.mjs::test_tak_icon_fallback
- **Test**: tests/react/test_tak_icon.mjs::test_tak_icon_no_theme_provider
- **Test**: tests/react/test_tak_icon.mjs::test_tak_icon_exported
- **Method**: Unit Test
