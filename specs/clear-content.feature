Feature: Clear Content
  Source: ATAK Civilian Software User Manual · 30 Clear Content

  As a TAK operator
  I need a confirmed wipe of ATAK content as the Software User Manual describes
  So that maps can be kept or destroyed and ATAK exits when Clear Now completes

  Background:
    Given the TAK application is running
    And the operator selects the Clear Content icon

  Scenario: Clear Now requires both switches locked
    # SUM: "Lock both switches by swiping them to the right to activate the Clear Now button. Tap Clear Now to remove all content. ATAK will exit after this action has been completed."
    Given both switches start unlocked
    When the operator swipes both switches right and taps Clear Now
    Then intent "com.atakmap.app.CLEAR_CONTENT" should start deletion
    And intent "com.atakmap.app.ZEROIZE_CONFIRMED" should fire as content is removed
    And DialogPanel should not remain after ATAK exits

  Scenario: Optionally clear maps and imagery
    # SUM: "Select the Clear maps & imagery checkbox to clear map and imagery data as well."
    Given the operator will Clear Now
    When the operator checks Clear maps & imagery
    Then intent "com.atakmap.app.ZEROIZE_CONFIRMED" should include map tiles
    And MapOverlay should have no local imagery after restart
    And preference "map_scale_visible" should return to default on next launch

  Scenario: Select Items opens Overlay Manager multi-select
    # SUM: "Select specific items to delete by tapping the Select Items button. This will navigate to the Overlay Manager multi-select tool to choose specific items to delete."
    Given Clear Content is open
    When the operator taps Select Items
    Then intent "com.atakmap.android.maps.MANAGE_HIERARCHY" should open Overlay Manager multi-select
    And ListView should allow choosing categories
    And a CoT type "a-f-G-U-C" self marker should remain protected until confirmed delete

  Scenario: Cancel returns to the map
    # SUM: "Tap Cancel to return to the main ATAK interface."
    Given Clear Content is displayed
    When the operator taps Cancel
    Then intent "com.atakmap.app.CLEAR_CONTENT" should not run
    And ToolBar should return to the map
    And SkittleMarker should still show the Self-Marker
