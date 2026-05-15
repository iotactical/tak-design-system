# REQ-RCT-012: TakIcon Size and Theme Integration

## Description
TakIcon supports standardized size presets and optional theme integration. The `size` prop accepts `'sm'`, `'md'`, `'lg'`, or `'xl'` and maps to consistent pixel dimensions across all renderer sub-types (24px, 32px, 40px, 48px respectively). When a `TakThemeProvider` is present in the ancestor tree, TakIcon reads the current theme mode and adjusts icon rendering: SVG icons using `currentColor` inherit the theme's foreground color; shape backgrounds that reference theme-dependent colors adapt accordingly. When a `DensityProvider` is present, the `size` prop values are scaled by the density multiplier (mobile density uses 1.25x, desktop uses 1.0x). The component degrades gracefully when neither provider is present.

## Acceptance Criteria
- [ ] `size="sm"` renders at 24x24px, `size="md"` at 32x32px, `size="lg"` at 40x40px, `size="xl"` at 48x48px.
- [ ] Size dimensions are applied consistently across all renderer types (SVG, shape, layer-list, selector).
- [ ] When `TakThemeProvider` sets dark mode, SVG icons with `currentColor` fill render in the dark-mode foreground color.
- [ ] When `TakThemeProvider` sets light mode, SVG icons render in the light-mode foreground color.
- [ ] When `DensityProvider` is present with mobile density, size values are multiplied by 1.25x: sm=30, md=40, lg=50, xl=60.
- [ ] When no `TakThemeProvider` is present, the component renders with dark theme defaults.
- [ ] When no `DensityProvider` is present, the component uses 1.0x scale.
- [ ] The `className` and `style` props allow consumer overrides of dimensions and colors.

## Validation
- **Test**: tests/react/test_tak_icon.mjs::test_icon_size_sm
- **Test**: tests/react/test_tak_icon.mjs::test_icon_size_xl
- **Test**: tests/react/test_tak_icon.mjs::test_icon_theme_dark
- **Test**: tests/react/test_tak_icon.mjs::test_icon_theme_light
- **Test**: tests/react/test_tak_icon.mjs::test_icon_density_mobile
- **Test**: tests/react/test_tak_icon.mjs::test_icon_no_providers
- **Method**: Unit Test
