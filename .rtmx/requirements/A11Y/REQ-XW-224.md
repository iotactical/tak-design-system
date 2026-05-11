# REQ-XW-224: aria-live Regions for Dynamic Content

## Description

Several components display dynamically updated counts and results that are invisible to screen readers because they lack `aria-live` regions. Add `aria-live="polite"` to the elements that show: the search result count in `GlobalSearch.tsx`, the entity count in the Explorer Browse panel, the filter count in the Palettes Markers panel, and the intent count in the Interfaces view. This ensures assistive technologies announce updates when these values change without interrupting the user's current focus.

## Acceptance Criteria

1. In `GlobalSearch.tsx`, the element displaying the search result count (e.g., "42 results") has `aria-live="polite"`.
2. In the Explorer Browse panel, the element displaying the entity count has `aria-live="polite"`.
3. In the Palettes Markers panel, the element displaying the filter/marker count has `aria-live="polite"`.
4. In the Interfaces view, the element displaying the intent count has `aria-live="polite"`.
5. The `aria-live` attribute is set to `"polite"` (not `"assertive"`) so updates do not interrupt current screen reader output.
6. The live regions are present in the DOM at all times (not conditionally rendered), so the browser registers them as live regions before content changes.

## Test Approach

- **Static analysis**: Search for `aria-live="polite"` in `GlobalSearch.tsx`, the Explorer Browse panel component, the Palettes Markers panel component, and the Interfaces component. Assert each contains at least one match.
- **Unit test**: Render `GlobalSearch.tsx`, perform a search, and assert the result count container has `aria-live="polite"`.
- **Unit test**: Render the Explorer Browse panel and assert the entity count element has `aria-live="polite"`.
- **Screen reader test**: Use VoiceOver or NVDA to verify that changing a search query or applying a filter causes the updated count to be announced.

## Implementation Notes

- The `aria-live="polite"` attribute should be placed on a wrapper element that is always in the DOM, not on a conditionally rendered element. If the count element is conditionally rendered, wrap it in a persistent container that carries the `aria-live` attribute.
- Avoid using `aria-live="assertive"` as it interrupts the current announcement, which is disruptive for frequently changing counts.
- Consider also adding `aria-atomic="true"` so the entire content of the live region is announced on each update, not just the changed portion.
- If counts are debounced or throttled (e.g., during typing), the live region will naturally only announce the final value, which is the desired behavior.

## Effort Estimate

0.25 weeks
