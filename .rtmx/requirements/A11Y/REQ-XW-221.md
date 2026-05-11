# REQ-XW-221: Reduced Motion Support

## Description

Users who enable the `prefers-reduced-motion: reduce` OS-level preference expect animations and transitions to be minimized or eliminated. All CSS module files under `site/src/` that contain `transition` or `animation` declarations must include a `@media (prefers-reduced-motion: reduce)` block that disables or significantly reduces those effects. Additionally, the `ModelViewer.tsx` component's `autoRotate` feature must check this preference at runtime and disable auto-rotation when reduced motion is preferred. The highlight pulse animation in `App.module.css` must also be disabled under reduced motion.

## Acceptance Criteria

1. Every `.module.css` file under `site/src/` that contains a `transition` or `animation` property also contains a `@media (prefers-reduced-motion: reduce)` media query that sets `transition: none` and/or `animation: none` for the affected selectors.
2. `ModelViewer.tsx` checks `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and sets `autoRotate` to `false` when the preference is active.
3. `App.module.css` disables the highlight pulse animation inside a `@media (prefers-reduced-motion: reduce)` block.
4. The reduced-motion media queries do not break any existing styles when the preference is not active.
5. No CSS module file with transitions or animations is left without a reduced-motion override.

## Test Approach

- **Static analysis**: For each `.module.css` file under `site/src/`, parse for `transition` or `animation` declarations. Assert that any file containing these also contains `prefers-reduced-motion: reduce`.
- **Unit test (ModelViewer)**: Mock `window.matchMedia` to return `matches: true` for `(prefers-reduced-motion: reduce)` and assert that the `autoRotate` prop/state is `false`.
- **Unit test (ModelViewer)**: Mock `window.matchMedia` to return `matches: false` and assert that `autoRotate` retains its default behavior.
- **Visual test**: Enable reduced-motion in the browser dev tools and verify that no transitions or animations play on the site.

## Implementation Notes

- A common pattern is to add at the end of each CSS module:
  ```css
  @media (prefers-reduced-motion: reduce) {
    .animatedClass {
      animation: none;
      transition: none;
    }
  }
  ```
- In `ModelViewer.tsx`, the check should run in a `useEffect` or during initialization, before the 3D viewer starts. If using a library like `@google/model-viewer`, set the `auto-rotate` attribute conditionally.
- Consider listening for changes to the media query via `matchMedia.addEventListener('change', ...)` so the preference is respected if toggled while the page is open.

## Effort Estimate

0.25 weeks
