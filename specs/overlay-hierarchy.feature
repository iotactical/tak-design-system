Feature: Overlay Manager
  Source: ATAK Civilian Software User Manual · Overlay Manager

  As a TAK operator
  I need Overlay Manager categories, visibility circles, and search as the Software User Manual describes
  So that Teams, Alerts, Markers, Data Packages, Navigation, and Shapes can be shown or hidden

  Background:
    Given the TAK application is running
    And the operator selects the [Overlay Manager] icon

  Scenario: Visibility radio buttons fill green, half, or hollow
    # SUM: "Users may turn visibility of any category on and off through the circular radio buttons. When the circle appears green, the corresponding layer objects are visible. A half-filled circle indicates that the subcategory has some, but not all, objects visible. A hollow circle corresponds to layer that is not visible."
    Given category Markers contains 4 visible items
    When the operator hides category Markers
    Then MapOverlay should stop rendering those markers
    And intent "com.atakmap.android.maps.REFRESH_HIERARCHY" should update the list
    And CoT type "a-f-G-U-C" items in that category should remain in the database

  Scenario: Selecting an item pans the map and opens its radial
    # SUM: "When a displayed item in a specific category is selected, the map view will pan to that item and its radial will display."
    Given Markers lists "RP BRAVO"
    When the operator selects "RP BRAVO"
    Then intent "com.atakmap.android.maps.FOCUS" should pan to that item
    And RadialMenu should open
    And MarkerDetail should be reachable from Details

  Scenario: Show All filters by current map view
    # SUM: "If the [Show All] checkbox is left unchecked, Overlay Manager will filter map items listed based on the current map view."
    Given Show All is unchecked
    When the operator pans so that a marker leaves the viewport
    Then ListView should omit that marker from Overlay Manager
    And preference "overlay_manager_width_height" should still size the dropdown

  Scenario: Multi-select delete does not remove the Self-Marker
    # SUM: "To delete an existing overlay item, select the [Multi-Select] icon. Items may be selected as a category (Markers, Shapes, File Overlays, etc.) or individually (specific neutral marker, for instance)."
    Given the operator multi-selects Markers
    When the operator selects [Delete]
    Then intent "com.atakmap.android.maps.CLEAR_HIERARCHY" should not remove the Self-Marker
    And a CoT type "a-f-G-U-C" self SA event should continue
    And intent "com.atakmap.android.maps.CLOSE_HIERARCHY" should close the manager if the operator dismisses it

  Scenario: COP Refresh removes temporary map items
    # SUM: "The COP Refresh removes any temporary map items from the map. These include Self-Markers from other users, SPI's from other users and ADSB Aircraft Tracks."
    Given remote Self-Markers and SPI markers are displayed
    When the operator confirms COP Refresh
    Then MapOverlay should drop those temporary items
    And intent "com.atakmap.android.maps.REFRESH_HIERARCHY" should update Overlay Manager
    And a CoT type "a-f-G-U-C" local self SA marker should remain

  Scenario: Add a hashtag from Overlay Manager
    # SUM: "Hashtags can be added to map items in the Remarks field of the Details window or by selecting the Hashtags icon in Overlay Manager. Select + to open the New Hashtag dialog. Enter a Hashtag and select Done."
    Given Overlay Manager is open
    When the operator creates hashtag "sector-north" and adds it via Map Select
    Then ListView should list the hashtag with tagged items
    And MarkerDetail remarks should include that hashtag
    And preference "overlay_manager_width_height" should still size the dropdown

  Scenario: Disable streaming elevation data
    # SUM: "By default, ATAK will stream in elevation data (DTED, SRTM, etc.) if the device was not previously provisioned with its own data. To disable this default preference, navigate to Settings > Tool Preferences > Specific Tool Preferences > Elevation Overlays Preferences and uncheck Stream Elevation Data."
    Given Stream Elevation Data is checked
    When the operator unchecks it in Elevation Overlays Preferences
    Then preference "prefs_dted_visible" should still allow local DTED to render
    And ListView in Elevation Manager should show cached layers only when Offline is selected
    And MapOverlay should not fetch a new stream for the current view

  Scenario: Other Overlays toggles grid lines
    # SUM: "Grid Lines controls the visibility of MGRS grid lines laid over the map surface. These grid lines will automatically adjust based on the current zoom level."
    Given Other Overlays is expanded
    When the operator toggles Grid Lines on
    Then MapOverlay should draw MGRS grids that adjust with zoom
    And intent "com.atakmap.android.maps.MANAGE_HIERARCHY" should keep Other Overlays listed
    And CoordinateDisplay should still show MGRS for the Self-Marker

  Scenario: Edit file overlay color and thickness
    # SUM: "The color and thickness of file overlays (Shapefiles, KMZ, DRW, etc.) can be edited by selecting Edit (pencil icon) from the listing."
    Given Overlay Manager lists a KMZ file overlay
    When the operator selects Edit on that listing
    Then intent "com.atakmap.android.maps.DRAWING_EDIT" should apply color and thickness
    And MapOverlay should redraw the file overlay
    And preference "overlayStylePreference" should keep overlay styling defaults

  Scenario: Map Controls adjust imagery transparency
    # SUM: "Different aspects of the map can be controlled by using Map Controls in the Overlay Manager. Options include: Displaying shape labels for File Overlays shapes, The ability to enhance visualization of depth when looking straight down in 2D mode with the Enhanced Depth Perception option, Adjusting the scaling of map imagery, The ability to use a slider to change the Map Imagery Transparency, The rendering of stars when zooming out to see the globe, and toggling Sun/Moon Illumination."
    Given Map Controls is open in Overlay Manager
    When the operator moves the Map Imagery Transparency slider
    Then intent "com.atakmap.android.grg.TRANSPARENCY" should fade MapOverlay imagery
    And preference "relativeOverlaysScalingRadioList" should still scale overlays
    And a CoT type "a-f-G-U-C" self SA marker should stay fully opaque

  Scenario: Center Designator reports coordinates and elevation
    # SUM: "Center Designator can be used to pinpoint a location’s coordinates and elevation data."
    Given Other Overlays is expanded
    When the operator enables Center Designator
    Then CoordinateDisplay should show the map-center coordinate and elevation
    And preference "coord_display_pref" should govern the format
    And a CoT type "b-m-p-s-p-loc" waypoint should not be created unless the operator drops one

  Scenario: Off-Screen Indicators for nearby markers
    # SUM: "Offscreen indicators appear for newly placed/received markers that are no longer in the current map view but are nearby (zoom level dependent)."
    Given a newly received marker is just outside the viewport
    When Off-Screen Indicator visibility is on
    Then MapOverlay should draw an off-screen indicator
    And intent "com.atakmap.android.maps.FOCUS" should pan to that marker when selected
    And a CoT type "a-f-G-U-C" remote SA event should remain in Overlay Manager
