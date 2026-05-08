# REQ-CMP-014: ListView

## Description
The ListView component renders scrollable, multi-tier lists used throughout ATAK for data browsers, layer managers, file lists, and search results. ATAK lists feature multiple title tiers (primary title, subtitle, meta text), leading icons or thumbnails, trailing action buttons, and section headers. Cross-platform consistency ensures that dense information lists are equally readable and navigable on every TAK client.

## Acceptance Criteria
- [ ] Renders a scrollable vertical list of items
- [ ] Each item supports up to three text tiers: title (text.primary), subtitle (text.secondary), meta (text.tertiary)
- [ ] Leading slot accepts an icon, avatar, thumbnail, or military symbol
- [ ] Trailing slot accepts action icons (e.g., chevron, overflow, toggle)
- [ ] Supports section headers with sticky behavior (remain visible during scroll)
- [ ] Supports dividers between items (configurable: full-width, inset, or none)
- [ ] Single-tap selects/activates an item; long-press enters multi-select mode
- [ ] Multi-select mode shows checkboxes in the leading slot and a selection count header
- [ ] Empty state displays a configurable message and optional action button
- [ ] Supports pull-to-refresh gesture with a loading indicator
- [ ] Virtualized rendering for lists exceeding 100 items (maintains 60fps scroll)
- [ ] Applies design tokens: surface.list, surface.list.item, border.divider, text.primary, text.secondary, text.tertiary
- [ ] Keyboard navigation: arrow keys move focus, Enter activates, Space toggles selection

## Validation
- **Test**: tests/components/test_list_view.mjs::renders_multi_tier_items
- **Test**: tests/components/test_list_view.mjs::sticky_section_headers
- **Test**: tests/components/test_list_view.mjs::multi_select_mode
- **Test**: tests/components/test_list_view.mjs::empty_state
- **Test**: tests/components/test_list_view.mjs::pull_to_refresh
- **Test**: tests/components/test_list_view.mjs::virtualized_performance
- **Method**: Unit Test, Performance Test
