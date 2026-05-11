# REQ-XW-220: Contrast Fix for Tertiary Text Colors

## Description

Several CSS module files and TSX files in `site/src/` use the hex color `#585858` (and possibly `#5A5A5A`) for tertiary text elements such as SIDCs, entity codes, timestamps, and section counts. On the dark background `#1A1A1A`, these colors yield a contrast ratio below the WCAG 2.1 AA minimum of 4.5:1 for normal text. Replace all instances of `#585858` and `#5A5A5A` with `#787878`, which provides a contrast ratio of 4.56:1 against `#1A1A1A` and passes AA.

## Acceptance Criteria

1. All occurrences of `#585858` (case-insensitive) in `.tsx` and `.module.css` files under `site/src/` are replaced with `#787878`.
2. All occurrences of `#5A5A5A` (case-insensitive) in `.tsx` and `.module.css` files under `site/src/` are replaced with `#787878`.
3. Running `grep -ri '#585858' site/src/` returns zero matches.
4. Running `grep -ri '#5A5A5A' site/src/` returns zero matches.
5. The replacement color `#787878` achieves a minimum contrast ratio of 4.5:1 against `#1A1A1A` per WCAG 2.1 AA for normal text.
6. Visual appearance of tertiary text remains consistent across all affected components (SIDCs, entity codes, timestamps, section counts).
7. No other colors or non-tertiary-text elements are inadvertently modified.

## Test Approach

- **Automated grep**: Run `grep -ri '#585858' site/src/` and `grep -ri '#5A5A5A' site/src/` and assert zero matches for both.
- **Contrast verification**: Confirm the computed contrast ratio of `#787878` on `#1A1A1A` is >= 4.5:1 using a WCAG contrast calculator.
- **Visual regression**: Compare screenshots of affected components before and after the change to verify no layout or readability regressions.

## Implementation Notes

- Search all `.tsx` and `.module.css` files under `site/src/`. The color may appear in inline styles in TSX files as well as CSS custom properties or direct color declarations in CSS modules.
- The replacement is a straightforward find-and-replace; no logic changes are needed.
- Consider adding the corrected color as a design token (e.g., `--color-text-tertiary: #787878`) to prevent future drift.

## Effort Estimate

0.25 weeks
