# REQ-XW-210: SVG Sanitization with DOMPurify

## Description

`MilSymRendererLive.tsx` renders SVG output from a Web Worker using `dangerouslySetInnerHTML`. This is a potential XSS vector if the Worker output is ever tampered with, if a malicious symbol code is crafted to produce script-bearing SVG, or if a future change introduces unsanitized data into the SVG pipeline. Install DOMPurify and sanitize all SVG strings before they are passed to `dangerouslySetInnerHTML`.

## Acceptance Criteria

1. `dompurify` (or `isomorphic-dompurify`) is listed as a dependency in the relevant `package.json`.
2. `MilSymRendererLive.tsx` imports DOMPurify.
3. Every SVG string received from the Worker is passed through `DOMPurify.sanitize()` before being set via `dangerouslySetInnerHTML`.
4. DOMPurify is configured to allow standard SVG elements and attributes (`svg`, `g`, `path`, `rect`, `circle`, `ellipse`, `line`, `polyline`, `polygon`, `text`, `tspan`, `defs`, `use`, `clipPath`, `mask`, `filter`, `linearGradient`, `radialGradient`, `stop`, `pattern`, `image`, `symbol`, `marker`, `title`, `desc`, `metadata`, `style`, `foreignObject`, etc.) but strip all of: `<script>`, event handlers (`onload`, `onerror`, `onclick`, `onmouseover`, etc.), `javascript:` URIs, and `<iframe>`.
5. The sanitized SVG renders identically to the unsanitized version for all valid mil-sym symbol outputs (no visual regression).
6. No TypeScript errors are introduced by the change.

## Test Approach

- **Static analysis**: Verify `dompurify` appears in `package.json` dependencies.
- **Static analysis**: Verify `MilSymRendererLive.tsx` imports `DOMPurify` and calls `DOMPurify.sanitize()` on the SVG string before it reaches `dangerouslySetInnerHTML`.
- **Unit test**: Pass a known-malicious SVG string (e.g., `<svg><script>alert(1)</script></svg>`) through the sanitize function and assert the `<script>` tag is removed.
- **Unit test**: Pass a valid mil-sym SVG output through the sanitize function and assert the output matches the input (no elements stripped).
- **Visual regression test**: Render a sample set of symbols with and without sanitization and compare outputs.

## Implementation Notes

- Use `DOMPurify.sanitize(svgString, { USE_PROFILES: { svg: true, svgFilters: true } })` for a sensible default SVG configuration.
- Alternatively, use `ALLOWED_TAGS` and `ALLOWED_ATTR` for fine-grained control if the profile-based approach strips needed elements.
- DOMPurify works in both browser and worker contexts. Since sanitization happens in the React component (not the worker), the browser version is sufficient.
- The `@types/dompurify` package provides TypeScript definitions.
- This is a defense-in-depth measure. Even though the Worker is same-origin, sanitizing untrusted HTML/SVG before `dangerouslySetInnerHTML` is a security best practice.

## Effort Estimate

0.25 weeks
