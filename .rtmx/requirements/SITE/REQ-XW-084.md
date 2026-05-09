# REQ-XW-084: Site Favicon and Page Title

## Description
The site needs a proper favicon and descriptive page title. The favicon
should be recognizable at 16x16 and 32x32 px. The TAK ecosystem uses
a shield motif. The iotactical logo mark exists at
~/Downloads/iotactical-logo-mark-full-color-rgb.svg.

## Options for favicon
1. Use the iotactical logo mark (exists as SVG in Downloads)
2. Generate a simple "TAK" text favicon in the brand colors
3. Use a shield shape filled with TAK Blue (#126DA0)

## Acceptance Criteria
- [ ] site/public/favicon.svg exists (SVG favicon for modern browsers)
- [ ] site/public/favicon-32x32.png exists (fallback)
- [ ] site/index.html references the favicon
- [ ] Page title is "TAK Design System" (already set)
- [ ] Each page updates document.title with section name (e.g. "Colors - TAK Design System")

## Validation
- **Test**: tests/site/test_favicon.mjs::test_favicon_exists
- **Method**: Integration Test
