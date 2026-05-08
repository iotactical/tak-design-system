# REQ-STY-001: ATAK Color Palette Complete Mapping

## Description
All 55 named colors defined in ATAK's `colors.xml` must be mapped to W3C Design Token Format (DTCG) entries in the core token set. ATAK's color palette is the single source of truth for every TAK-ecosystem UI -- WinTAK, WebTAK, and TAKX all derive their palette from these definitions. Incomplete coverage causes visual inconsistency across platforms and breaks the principle that a single token change propagates everywhere.

The 55 named colors include but are not limited to: `actionbar_background`, `alert`, `atac_beige`, `black_overlay`, `bloodhound_info_widget_text_color`, `callsign_alert`, `callsign_default`, `heading_yellow`, `led_green`, `led_red`, `map_text`, `onyx`, `onyx_85`, `toolbar_tint`, `white`, `black`, `transparent`, `dark_gray`, `light_gray`, `medium_gray`, `holo_blue_light`, `holo_blue_dark`, `tab_selected`, `tab_unselected`, `switch_thumb_on`, `switch_thumb_off`, `switch_track_on`, `switch_track_off`, `nav_button_bg`, `nav_button_pressed`, `compass_bg`, `compass_border`, `list_divider`, `list_item_bg`, `list_item_pressed`, `dialog_bg`, `dialog_title_text`, `dialog_message_text`, `edit_text_bg`, `edit_text_border`, `edit_text_hint`, `spinner_bg`, `checkbox_tint`, `radio_tint`, `progress_bar_bg`, `progress_bar_fill`, `button_primary_bg`, `button_primary_text`, `button_alert_bg`, `button_alert_text`, `button_inverse_bg`, `button_inverse_text`, `button_secondary_bg`, `button_secondary_text`, and `button_marker_bg`.

## Acceptance Criteria
- [ ] Every one of the 55 named colors from ATAK `colors.xml` has a corresponding entry in `tokens/w3c/core.json` under a `color` group.
- [ ] Each token value is expressed as an 8-digit hex string (`#AARRGGBB` Android format converted to `#RRGGBBAA` W3C format) with `$type: "color"`.
- [ ] Token names follow kebab-case and are prefixed `atak-` (e.g., `atak-actionbar-background`).
- [ ] A mapping table exists in `docs/color-mapping.md` that lists every ATAK color name, its original hex value, and the corresponding W3C token path.
- [ ] No ATAK color is omitted; the count of color tokens in `core.json` is >= 55.
- [ ] All 9 color state lists (see REQ-STY-012) reference only colors defined in this palette; no dangling references exist.
- [ ] The token file passes `style-dictionary` validation without errors.

## Validation
- **Test**: tests/styles/test_color_palette.mjs::test_all_55_colors_present
- **Method**: Unit Test
- **Test**: tests/styles/test_color_palette.mjs::test_hex_format_w3c_compliant
- **Method**: Unit Test
- **Test**: tests/styles/test_color_palette.mjs::test_no_dangling_state_list_references
- **Method**: Unit Test
