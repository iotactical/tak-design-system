# REQ-CMP-006: ChatPanel

## Description
The ChatPanel provides tactical messaging within TAK, supporting individual and group chat channels tied to CoT (Cursor on Target) groups. ATAK renders messages as bubbles with callsign, timestamp, and read/unread indicators. The chat panel typically lives in a DockPane. Cross-platform consistency means message layout, timestamp formatting, unread badges, and notification behavior must be identical so team communication is seamless regardless of which TAK client each operator uses.

## Acceptance Criteria
- [ ] Renders a scrollable message list with newest messages at the bottom
- [ ] Each message bubble shows: sender callsign, message text, timestamp
- [ ] Outgoing messages align right; incoming messages align left
- [ ] Supports channel/group selector in the header area
- [ ] Unread badge on channel tabs shows count of unseen messages
- [ ] Timestamp format matches ATAK default: HH:mm:ss (24-hour, local timezone)
- [ ] Text input area at the bottom with send button
- [ ] Supports GeoChat message type with embedded coordinate links (tappable to pan map)
- [ ] Auto-scrolls to newest message on arrival unless user has scrolled up
- [ ] Shows a "new messages" indicator when scrolled up and new messages arrive
- [ ] Applies design tokens: surface.chat.bg, surface.bubble.self, surface.bubble.other, text.chat, text.timestamp
- [ ] Callsign text uses the team color of the sender when available
- [ ] Empty state shows instructional text when no messages exist in a channel

## Validation
- **Test**: tests/components/test_chat_panel.mjs::renders_message_list
- **Test**: tests/components/test_chat_panel.mjs::outgoing_incoming_alignment
- **Test**: tests/components/test_chat_panel.mjs::unread_badge_count
- **Test**: tests/components/test_chat_panel.mjs::geochat_coordinate_link
- **Test**: tests/components/test_chat_panel.mjs::auto_scroll_behavior
- **Method**: Unit Test, Integration Test
