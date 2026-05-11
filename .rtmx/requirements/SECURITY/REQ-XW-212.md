# REQ-XW-212: Content Security Policy Headers

## Description

Add a Content Security Policy (CSP) to the site via a `<meta>` tag in `site/index.html`. The CSP restricts the origins from which scripts, styles, fonts, images, and workers can be loaded, reducing the attack surface for XSS and data exfiltration. The policy must accommodate Vite's worker bundling (which uses `blob:` URLs) and the existing dependency on Google Fonts.

## Acceptance Criteria

1. `site/index.html` contains a `<meta http-equiv="Content-Security-Policy">` tag inside the `<head>` element.
2. The CSP `content` attribute includes the following directives:
   - `default-src 'self'`
   - `script-src 'self' 'unsafe-inline' blob:` (unsafe-inline needed for Vite HMR in dev and the SPA restore script; blob: for worker bundling)
   - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` (unsafe-inline for styled-components or inline styles)
   - `font-src https://fonts.gstatic.com` (or `'self'` if fonts are self-hosted per REQ-XW-215)
   - `img-src 'self' data: blob:` (data: for inline SVG/base64 images, blob: for canvas exports)
   - `worker-src 'self' blob:` (blob: for Vite-bundled workers)
3. The CSP does not break any existing functionality: pages load, styles render, fonts display, symbols render, workers function.
4. No CSP violation errors appear in the browser console during normal site usage.
5. The CSP tag is present in the production build output (`dist/index.html`).

## Test Approach

- **Static analysis**: Verify `site/index.html` contains a `<meta>` tag with `http-equiv="Content-Security-Policy"` and the specified directives.
- **Build verification**: Run `vite build` and inspect `dist/index.html` to confirm the CSP tag is preserved.
- **Manual test**: Open the site in Chrome, open DevTools Console, navigate through all pages, and verify zero CSP violation errors.
- **Automated test**: Use a headless browser (Playwright) to load each page and assert no `securitypolicyviolation` events fire.

## Implementation Notes

- Place the `<meta>` tag early in `<head>`, before any `<script>` or `<link>` tags, so the policy is active before any resource loads.
- The `'unsafe-inline'` directive for scripts is a known trade-off. Ideally, inline scripts would use nonces, but Vite's HMR injects inline scripts in dev mode, and the SPA fallback restore script (REQ-XW-200) is inline. A nonce-based approach can be pursued in a future hardening pass.
- If REQ-XW-215 (self-hosted fonts) is implemented, update `style-src` to remove `https://fonts.googleapis.com` and `font-src` to use `'self'` instead of `https://fonts.gstatic.com`.
- The `connect-src` directive is not specified and defaults to `'self'`, which is correct for the current site (no external API calls).
- GitHub Pages does not support custom HTTP headers, so the `<meta>` tag approach is the only option for CSP on this hosting platform.

## Effort Estimate

0.25 weeks
