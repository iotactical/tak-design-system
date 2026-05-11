# REQ-XW-200: SPA Fallback for GitHub Pages

## Description

GitHub Pages does not natively support single-page application (SPA) routing. When a user navigates directly to a deep route (e.g., `/palettes/markers`, `/explorer/build`), GitHub Pages returns a 404 because no corresponding HTML file exists on disk. The standard workaround is a custom `404.html` that captures the attempted URL via `sessionStorage`, redirects to `index.html`, and a script in `index.html` restores the original route.

Create `site/public/404.html` implementing this pattern, and add the corresponding restore script to `site/index.html`.

## Acceptance Criteria

1. A file `site/public/404.html` exists and is a valid HTML document.
2. `404.html` reads `window.location` and stores the full path plus query string and hash in `sessionStorage` under the key `redirect`.
3. `404.html` redirects the browser to `/` (the site root) using `window.location.replace`.
4. `site/index.html` contains an inline script (before the app mount point) that checks `sessionStorage.redirect`, and if present, calls `history.replaceState` to restore the original route, then removes the key from `sessionStorage`.
5. The pattern works for all known routes including but not limited to: `/palettes/markers`, `/explorer/build`, `/interfaces`, `/components`, `/icons`, `/platforms`, `/colors`, `/typography`, `/spacing`.
6. The `404.html` file is small (under 1 KB) and contains no external dependencies.
7. The restore script in `index.html` executes synchronously before React hydrates, so React Router sees the correct URL on first render.

## Test Approach

- **Static analysis**: Verify `site/public/404.html` exists, contains `sessionStorage.redirect` (or equivalent key), and performs a redirect to `/`.
- **Static analysis**: Verify `site/index.html` contains a script block that reads `sessionStorage.redirect` and calls `history.replaceState`.
- **Integration test**: Deploy to a test GitHub Pages instance, navigate directly to `/explorer/build`, and confirm the app loads at the correct route without a visible 404 page.
- **Unit test**: In a JSDOM environment, mock `sessionStorage` and `window.location`, source the 404 script, and assert `sessionStorage.setItem` is called with the correct path.

## Implementation Notes

- This is a well-established pattern documented at https://github.com/rafgraph/spa-github-pages.
- The `404.html` must handle the GitHub Pages base path if the site is deployed under a subpath (e.g., `/tak-design-system/`). Use a segment count variable to strip the correct number of path segments.
- Vite copies files from `public/` to the build output root, so `site/public/404.html` will appear as `404.html` in the deployed site.
- Do not use `<meta http-equiv="refresh">` as it does not preserve the fragment/hash and causes a visible page flash. Use JavaScript `window.location.replace`.

## Effort Estimate

0.25 weeks
