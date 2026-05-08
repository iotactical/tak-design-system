# REQ-CMP-012: UserList

## Description
The UserList component displays a team roster of TAK users (contacts) with their current status, team color, role, and last-known position. In ATAK this is the Contacts list showing callsigns with colored team indicators, online/offline/stale state, and quick actions. Cross-platform consistency ensures that team awareness is presented identically so commanders and operators can assess force posture on any TAK client.

## Acceptance Criteria
- [ ] Renders a scrollable list of user entries sorted by team then callsign
- [ ] Each entry shows: callsign, team color indicator, status icon (online/offline/stale)
- [ ] Team color is rendered as a left-edge bar or dot using the CoT team color values
- [ ] Online/offline is determined by CoT staleness (configurable threshold, default 5 minutes)
- [ ] Stale users are visually dimmed but remain in the list
- [ ] Tapping a user entry opens their MarkerDetail or centers the map on their position
- [ ] Supports filtering by: team, status (online/offline/all), text search on callsign
- [ ] Displays total count and online count in the list header (e.g., "12 contacts, 8 online")
- [ ] Supports multi-select mode for bulk actions (send message, create group)
- [ ] Role/type badge (e.g., HQ, medic, UAV operator) shown when available from CoT
- [ ] Applies design tokens: surface.list, text.callsign, text.secondary, color.team.*, icon.status.*
- [ ] Empty state displays a message when no contacts are available
- [ ] List updates reactively as CoT SA messages arrive or expire

## Validation
- **Test**: tests/components/test_user_list.mjs::renders_sorted_by_team_and_callsign
- **Test**: tests/components/test_user_list.mjs::team_color_indicator
- **Test**: tests/components/test_user_list.mjs::stale_users_dimmed
- **Test**: tests/components/test_user_list.mjs::filter_by_team_and_search
- **Test**: tests/components/test_user_list.mjs::multi_select_mode
- **Test**: tests/components/test_user_list.mjs::reactive_update_on_cot
- **Method**: Unit Test, Integration Test
