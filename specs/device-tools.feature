Feature: Brightness, Night Vision, and globe rendering
  Source: ATAK Civilian Software User Manual · 1 Overview · Additional Tools · Display Preferences

  As a TAK operator
  I need Additional Tools for brightness and night vision plus globe rendering as Settings describes
  So that the map remains usable at night and at planetary zoom

  Background:
    Given the TAK application is running

  Scenario: Open Brightness from Additional Tools
    # SUM: "The three bars to the left of the toolbar (or to the right when using the legacy toolbar option) provide access to all ATAK tools and plug-ins."
    Given Additional Tools is open
    When the operator selects Brightness
    Then intent "com.atakmap.android.brightness.BrightnessComponent.SHOW_TOOL" should open DockPane
    And preference "generalDisplayPref" should still reach Display Preferences
    And a CoT type "a-f-G-U-C" self SA event should continue

  Scenario: Enable Night Vision controls inside ATAK
    # SUM: "The three bars to the left of the toolbar (or to the right when using the legacy toolbar option) provide access to all ATAK tools and plug-ins."
    Given preference "night_vision_widget" is disabled
    When the operator enables Night Vision control inside ATAK
    Then preference "night_vision_widget" should be true
    And intent "adjust_night_vision_value" should dim MapOverlay
    And ToolBar should keep the rest of the chrome readable

  Scenario: Compass ring from the map compass
    # SUM: "The Compass appears in the upper left and is used to control map orientation."
    Given the Self-Marker is on screen
    When the operator enables the compass ring
    Then intent "com.atakmap.android.maps.COMPASS" should draw the ring on MapOverlay
    And CoordinateDisplay should still show heading
    And a CoT type "a-f-G-U-C" self SA event should be unchanged

  Scenario: Globe rendering when zoomed out
    # SUM: "The rendering of stars when zooming out to see the globe, and toggling Sun/Moon Illumination"
    Given preference "atakGlobeModeEnabled" is true
    When the operator zooms out to the globe
    Then MapOverlay should render globe mode
    And preference "3DRendering" should still open 3D rendering options
    And SkittleMarker should remain at the Self-Marker
