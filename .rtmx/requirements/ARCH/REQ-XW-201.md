# REQ-XW-201: Lazy Routes via React.lazy and Suspense

## Description

Currently `site/src/App.tsx` imports all page components at the top level, meaning the entire application is bundled into a single chunk. This increases initial load time and wastes bandwidth for users who only visit one or two pages. Convert all page-level route components to use `React.lazy()` with dynamic `import()` so Vite produces a separate chunk per page. Wrap the route outlet in `<Suspense>` with an appropriate fallback.

## Acceptance Criteria

1. `site/src/App.tsx` uses `React.lazy()` for every page-level route component: Explorer, Palettes, Interfaces, Components, Icons, Platforms, Colors, Typography, and Spacing.
2. No page component is statically imported at the top of `App.tsx`; all page imports use the `() => import(...)` pattern.
3. A `<Suspense>` boundary wraps the route outlet (or all `<Route>` elements) with a visible loading fallback (e.g., a spinner or "Loading..." text).
4. Each lazy-loaded page produces a separate JavaScript chunk in the Vite build output (verifiable via `vite build` output or `dist/assets/` file listing).
5. Navigation between routes works without full page reload; the lazy chunk loads on first visit to that route.
6. The fallback UI is visually consistent with the site design (uses the design system's colors/typography).
7. No TypeScript or ESLint errors are introduced.

## Test Approach

- **Static analysis**: Grep `App.tsx` for `React.lazy` and confirm all nine page components use it. Confirm no static page imports remain.
- **Static analysis**: Confirm `<Suspense` appears in `App.tsx` with a `fallback` prop.
- **Build verification**: Run `vite build` and verify the output contains multiple chunk files corresponding to the lazy-loaded pages (more than one JS file in `dist/assets/`).
- **Manual test**: Open the site, observe network tab to confirm page chunks load on navigation rather than on initial load.
- **Error boundary test**: Simulate a chunk load failure (e.g., offline after initial load) and verify the app does not crash with an unhandled error.

## Implementation Notes

- Use named chunk hints in the dynamic imports for readable filenames: `React.lazy(() => import(/* webpackChunkName: "explorer" */ './pages/Explorer'))`. Vite respects these comments.
- Consider adding an error boundary around `<Suspense>` to handle chunk load failures gracefully (e.g., retry or show a "failed to load" message). This is optional for the initial implementation but recommended.
- The `Suspense` fallback should be lightweight (not itself a lazy-loaded component) to avoid a loading-inception scenario.
- If any page re-exports types that other modules depend on, those type imports must be separated from the runtime imports to avoid breaking the lazy boundary.

## Effort Estimate

0.5 weeks
