# REQ-CMP-001: NavBar/ActionBar

## Description
The NavBar/ActionBar is the primary toolbar in ATAK, anchored to the top of the screen. It contains the hamburger menu toggle, search field, layer selector, tools menu, and notification area. In ATAK Android this maps to `ATAKActionBar`, `ActionMenuView`, and related styles. Cross-platform consistency requires that every TAK client renders the same toolbar layout, icon placement, overflow behavior, and touch targets so operators moving between devices experience zero relearning cost.

## Acceptance Criteria
- [ ] Renders a fixed-position horizontal bar at the top of the viewport
- [ ] Contains slots for: leading menu toggle, search input, trailing action icons, and overflow menu
- [ ] Menu toggle emits an event to open/close the navigation drawer
- [ ] Search input expands inline on activation and collapses on blur or cancel
- [ ] Action icons accept an icon token, label, onPress handler, and optional badge count
- [ ] Overflow menu collects actions that do not fit the available width
- [ ] Supports a subtitle/secondary text line below the title (matches ATAK two-line action bar)
- [ ] Applies design tokens: surface.toolbar background, text.primary foreground, spacing.md padding
- [ ] Touch targets meet 48dp minimum per ATAK accessibility guidelines
- [ ] Renders identically on Android, iOS, and Web targets at 360dp, 768dp, and 1024dp widths
- [ ] Supports dark theme only (ATAK default) with correct token mapping
- [ ] Keyboard navigation works on desktop/web: Tab moves between actions, Enter activates

## Validation
- **Test**: tests/components/test_navbar.mjs::renders_default_navbar
- **Test**: tests/components/test_navbar.mjs::search_expands_and_collapses
- **Test**: tests/components/test_navbar.mjs::overflow_menu_collects_excess_actions
- **Test**: tests/components/test_navbar.mjs::badge_count_displays_on_action_icon
- **Test**: tests/components/test_navbar.mjs::responsive_layout_breakpoints
- **Method**: Unit Test, Visual Regression Test
