# REQ-XW-226: Skip Navigation Link

## Description

Users who navigate with a keyboard or screen reader must currently tab through the entire header, navigation, and sidebar before reaching the main content area. Add a visually hidden "Skip to main content" link as the very first focusable element in `App.tsx`. The link targets `#main-content`, and the main content area receives `id="main-content"`. The skip link becomes visible when focused, appearing as a fixed-position bar at the top of the viewport with the TAK gold accent color.

## Acceptance Criteria

1. `App.tsx` renders an `<a href="#main-content">` element as the first child inside the top-level container.
2. The link text is "Skip to main content".
3. The link has `className={styles.skipLink}` referencing a class in `App.module.css`.
4. The main content area in `App.tsx` has `id="main-content"`.
5. The `.skipLink` CSS class positions the link off-screen by default: `position: absolute; left: -10000px; top: auto; width: 1px; height: 1px; overflow: hidden;`.
6. The `.skipLink:focus` CSS rule makes the link visible: `position: fixed; top: 0; left: 0; width: auto; height: auto; padding: 8px 16px; background: #c8a951; color: #000; z-index: 9999;`.
7. Pressing Tab on page load focuses the skip link, making it visible.
8. Activating the skip link (Enter) scrolls or jumps focus to the main content area.

## Test Approach

- **Static analysis**: Verify `App.tsx` contains `<a href="#main-content"` with text "Skip to main content".
- **Static analysis**: Verify `App.tsx` contains an element with `id="main-content"`.
- **CSS analysis**: Verify `App.module.css` contains `.skipLink` with off-screen positioning and `.skipLink:focus` with visible positioning.
- **Keyboard test**: Load the site, press Tab once, and verify the skip link appears at the top of the viewport with gold background.
- **Keyboard test**: Press Enter on the focused skip link and verify focus moves to the main content area.

## Implementation Notes

- The skip link must be the very first focusable element in the DOM, before any navigation or header elements.
- The `#main-content` target element should have `tabindex="-1"` if it is not natively focusable (e.g., a `<div>` or `<main>`), so that activating the skip link moves focus to it.
- Using `<main id="main-content">` is preferred over a `<div>` for semantic correctness.
- The gold background `#c8a951` on black text `#000` provides a contrast ratio of approximately 8.5:1, well above AA requirements.
- This is a standard accessibility pattern recommended by WCAG 2.4.1 (Bypass Blocks).

## Effort Estimate

0.25 weeks
