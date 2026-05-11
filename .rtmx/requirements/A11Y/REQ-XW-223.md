# REQ-XW-223: ARIA Tab Pattern for Tab Bars

## Description

The tab bar UI pattern in `Palettes.tsx`, `Explorer.tsx`, and `Interfaces.tsx` currently uses generic `<div>` and `<button>` elements without ARIA roles, making it opaque to screen readers. Implement the WAI-ARIA Tabs pattern: the container gets `role="tablist"`, each tab button gets `role="tab"` with `aria-selected` reflecting its active state, and the associated content panel gets `role="tabpanel"` with `aria-labelledby` pointing to the active tab's ID. Each tab must have a unique `id` attribute for the `aria-labelledby` linkage.

## Acceptance Criteria

1. In `Palettes.tsx`, the outer tab container has `role="tablist"`.
2. In `Palettes.tsx`, each tab button has `role="tab"`, a unique `id` attribute, and `aria-selected` set to `true` when active and `false` when inactive.
3. In `Palettes.tsx`, the content area below the tabs has `role="tabpanel"` and `aria-labelledby` referencing the `id` of the currently active tab.
4. In `Explorer.tsx`, the same ARIA attributes are applied: `role="tablist"` on the container, `role="tab"` with `aria-selected` and unique `id` on each tab button, and `role="tabpanel"` with `aria-labelledby` on the content area.
5. In `Interfaces.tsx`, the same ARIA attributes are applied: `role="tablist"` on the container, `role="tab"` with `aria-selected` and unique `id` on each tab button, and `role="tabpanel"` with `aria-labelledby` on the content area.
6. The `id` values are stable and unique across the page (e.g., `palettes-tab-markers`, `explorer-tab-browse`).
7. Screen readers announce tab selection changes correctly when navigating between tabs.

## Test Approach

- **Static analysis**: Parse JSX in `Palettes.tsx`, `Explorer.tsx`, and `Interfaces.tsx` and verify the presence of `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, and `aria-labelledby` attributes.
- **Unit test**: Render each component and assert that exactly one tab has `aria-selected="true"` and the rest have `aria-selected="false"`.
- **Unit test**: Click a different tab and assert `aria-selected` values update correctly.
- **Unit test**: Assert the `tabpanel` element's `aria-labelledby` matches the `id` of the active tab.
- **Accessibility audit**: Run axe-core on rendered components and verify no ARIA-related violations.

## Implementation Notes

- Follow the WAI-ARIA Authoring Practices 1.2 Tabs pattern: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
- Tab IDs should follow a namespaced convention to avoid collisions, e.g., `palettes-tab-{name}`, `explorer-tab-{name}`, `interfaces-tab-{name}`.
- The `tabpanel` should also have `tabindex="0"` if it does not contain a focusable element, so keyboard users can navigate to the panel content.
- Consider extracting a shared `TabBar` component if the pattern is identical across all three files, to reduce duplication and ensure consistent ARIA behavior.
- Arrow key navigation between tabs (left/right) is recommended by the ARIA pattern but is not required for this ticket; it can be a follow-up.

## Effort Estimate

0.5 weeks
