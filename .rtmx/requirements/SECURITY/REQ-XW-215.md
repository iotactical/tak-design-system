# REQ-XW-215: Self-Hosted Fonts (Eliminate External Font Dependency)

## Description

The site currently loads fonts (Nunito, Digital-7, Roboto Mono, Roboto Condensed) from Google Fonts via external `<link>` tags in `index.html`. This creates an external dependency that introduces privacy concerns (Google receives visitor IP addresses), a performance penalty (extra DNS lookup and TLS handshake), and makes Subresource Integrity (SRI) impractical because Google Fonts returns different CSS content based on the requesting user-agent.

Self-host all font files by downloading the WOFF2 variants to `site/public/fonts/` and updating `index.html` to reference local paths via `@font-face` declarations. This eliminates the external dependency entirely.

## Acceptance Criteria

1. WOFF2 font files for all weights/styles currently used exist in `site/public/fonts/`:
   - Nunito (weights: 400, 600, 700 at minimum)
   - Digital-7 (or equivalent digital/segment display font)
   - Roboto Mono (weights: 400, 700 at minimum)
   - Roboto Condensed (weights: 400, 700 at minimum)
2. The `<link>` tags referencing `https://fonts.googleapis.com` and `https://fonts.gstatic.com` are removed from `site/index.html`.
3. `site/index.html` (or a linked local CSS file) contains `@font-face` declarations for each font family, referencing the local WOFF2 files.
4. The `@font-face` declarations include `font-display: swap` to prevent invisible text during font loading.
5. All text throughout the site renders in the correct font (visually identical to the current Google Fonts rendering).
6. The CSP `font-src` directive (REQ-XW-212) is updated to `'self'` (no external font origins needed).
7. The CSP `style-src` directive no longer needs `https://fonts.googleapis.com`.
8. No network requests to `fonts.googleapis.com` or `fonts.gstatic.com` occur during site usage.

## Test Approach

- **Static analysis**: Verify WOFF2 files exist in `site/public/fonts/` for each font family.
- **Static analysis**: Verify `site/index.html` does not contain any references to `fonts.googleapis.com` or `fonts.gstatic.com`.
- **Static analysis**: Verify `@font-face` declarations exist referencing local `/fonts/*.woff2` paths.
- **Build verification**: Run `vite build` and confirm font files appear in `dist/fonts/`.
- **Manual test**: Open the site, inspect rendered fonts in DevTools (Computed Styles), and confirm each text element uses the expected font family.
- **Network test**: Open DevTools Network tab, filter by Font, and confirm all font requests are to the local origin (no external requests).
- **Visual regression test**: Screenshot key pages before and after the change and compare.

## Implementation Notes

- Download fonts from Google Fonts using the `google-webfonts-helper` tool (https://gwfh.mranftl.com/fonts) which provides WOFF2 files and ready-made `@font-face` CSS.
- Alternatively, download directly from `fonts.gstatic.com` URLs found in the Google Fonts CSS response.
- Only include WOFF2 format; it has 95%+ browser support and the best compression. WOFF1 fallback is unnecessary for modern browsers.
- Place `@font-face` declarations in a dedicated `site/public/fonts/fonts.css` or inline them in `index.html`. If using a separate CSS file, add `<link rel="stylesheet" href="/fonts/fonts.css">` to `index.html`.
- Ensure the `font-family` names in `@font-face` match exactly what is used in the site's CSS/styled-components (e.g., `'Nunito'`, `'Roboto Mono'`, `'Roboto Condensed'`).
- Font licensing: Google Fonts are open-source (mostly OFL/Apache 2.0). Include the license files in the `fonts/` directory or a `LICENSES` file.
- This requirement has a dependency interaction with REQ-XW-212 (CSP Headers): if both are implemented, the CSP should reference `'self'` for fonts instead of Google origins.

## Effort Estimate

0.25 weeks
