Feature: Elevation Tools and Viewshed
  Source: ATAK Civilian Software User Manual · Elevation Tools · Viewshed

  As a TAK operator
  I need Heatmap, Viewshed, and Contour Lines as the Software User Manual describes
  So that visibility from a point uses installed DTED

  Background:
    Given the TAK application is running
    And the operator selects the [Elevation Tools] icon

  Scenario: Compute a viewshed from a map tap
    # SUM: "Select the [Eye View] icon and then tap a location on the map or a map marker. An Eye marker will appear on the map interface. A radius will display... with green representing areas visible to the viewer and red representing areas that are obstructed from view."
    Given DTED covers the current viewport
    When the operator taps [Eye View] then a map point
    Then intent "com.atakmap.android.elev.ViewShedReceiver.SHOW_VIEWSHED" should render green and red cells
    And MapOverlay should show the Eye marker
    And a CoT type "a-f-G-U-C" self SA event should be unchanged

  Scenario: Adjust height above marker and intensity
    # SUM: "The Height Above Marker can be altered to reflect how far above ground level the viewshed should calculate. Intensity can be increased or decreased using the slide bar or entering a numeric value."
    Given a viewshed exists
    When the operator changes height and intensity
    Then intent "com.atakmap.android.elev.ViewShedReceiver.UPDATE_VIEWSHED_INTENSITY" should refresh the overlay
    And preference "prefs_dted_visible" should still control elevation overlay visibility

  Scenario: Remove viewshed
    # SUM: "Select [Remove Viewshed] to delete the viewshed from the map."
    Given a viewshed is displayed
    When the operator selects [Remove Viewshed]
    Then intent "com.atakmap.android.elev.ViewShedReceiver.DISMISS_VIEWSHED" should clear the overlay
    And intent "com.atakmap.viewshed.VIEWSHED_TOOL" should no longer be active

  Scenario: Missing DTED does not paint a false mask
    # SUM: "Note: If zoomed out too far, the user will only see the Eye View icon and will need to zoom in further to see the viewshed."
    Given no DTED is installed for the tap
    When the operator selects [Eye View]
    Then intent "com.atakmap.android.elev.ViewShedReceiver.SHOW_VIEWSHED" should not invent coverage
    And DialogPanel should report that elevation data is required
    And CoordinateDisplay should still show the tap coordinate

  Scenario: Heatmap colors elevation from blue to red
    # SUM: "The Heatmap Tool displays elevation data on a color scale with lower elevations represented by blue and higher elevations by red. The Intensity, Saturation, and Value can be modified for user preference."
    Given DTED covers the current viewport
    When the operator enables Heatmap
    Then MapOverlay should paint low elevations blue and high elevations red
    And preference "prefs_dted_visible" should still require elevation data
    And a CoT type "a-f-G-U-C" self SA event should be unchanged

  Scenario: Terrain Slope from the Heatmap control
    # SUM: "Terrain Slope can be viewed by selecting the Heatmap box and changing the selection to Terrain Slope. The slope of the elevation data is a color scale with smaller slopes depicted as yellow and higher slope values as black."
    Given Heatmap is active
    When the operator changes the selection to Terrain Slope
    Then MapOverlay should paint small slopes yellow and steep slopes black
    And intent "com.atakmap.viewshed.VIEWSHED_TOOL" should not be required for slope
    And preference "unitPreferences" should still label elevation units
