# REQ-XW-222: Focus Indicators for Interactive Elements

## Description

Interactive elements in the site lack visible focus indicators, making keyboard navigation difficult for users who rely on it. Add `:focus-visible` styles to all `.tab` class selectors across CSS modules (`Palettes.module.css`, `Explorer.module.css`, `Interfaces.module.css`), as well as to `.entityCard`, affiliation buttons, and version toggle buttons. The focus style should be a 2px solid `#c8a951` outline with a 2px offset, consistent with the TAK Design System's gold accent color.

## Acceptance Criteria

1. `Palettes.module.css` contains a `.tab:focus-visible` rule with `outline: 2px solid #c8a951; outline-offset: 2px;`.
2. `Explorer.module.css` contains a `.tab:focus-visible` rule with `outline: 2px solid #c8a951; outline-offset: 2px;`.
3. `Interfaces.module.css` contains a `.tab:focus-visible` rule with `outline: 2px solid #c8a951; outline-offset: 2px;`.
4. `.entityCard:focus-visible` is defined with the same outline style in the relevant CSS module(s).
5. Affiliation button elements have `:focus-visible` styles with the same outline.
6. Version toggle button elements have `:focus-visible` styles with the same outline.
7. The focus indicator is not visible on mouse click (`:focus-visible` ensures it only shows on keyboard focus).
8. The focus styles do not cause layout shifts (outline does not affect element dimensions).

## Test Approach

- **Static analysis**: Parse `Palettes.module.css`, `Explorer.module.css`, and `Interfaces.module.css` and assert each contains a `.tab:focus-visible` rule with the specified outline properties.
- **Static analysis**: Assert `.entityCard:focus-visible` exists in the appropriate CSS module.
- **Manual keyboard test**: Tab through the site and verify that every interactive element (tabs, entity cards, affiliation buttons, version toggles) shows the gold outline when focused via keyboard.
- **Visual regression**: Compare screenshots of focused elements to ensure the outline appears correctly and does not overlap or clip adjacent elements.

## Implementation Notes

- Use `:focus-visible` rather than `:focus` to avoid showing the outline on mouse clicks. All modern browsers support `:focus-visible`.
- The outline color `#c8a951` is the TAK Design System gold accent. Consider referencing a CSS custom property if one exists (e.g., `var(--color-accent)`).
- `outline-offset: 2px` provides spacing between the element border and the focus ring, improving visibility on dark backgrounds.
- If affiliation buttons or version toggles use a shared CSS module, the rule may only need to be added once.

## Effort Estimate

0.25 weeks
