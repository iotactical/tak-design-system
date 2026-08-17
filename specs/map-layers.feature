Feature: Maps and Favorites
  Source: ATAK Civilian Software User Manual · Maps & Favorites

  As a TAK operator
  I need Imagery, Mobile, and Favorites layers as the Software User Manual describes
  So that online, local, and GRG products can be selected without hiding the COP

  Background:
    Given the TAK application is running
    And the operator selects the [Maps & Favorites] icon

  Scenario: Toggle Online versus Local on the Mobile tab
    # SUM: "Select [Online/Local] on the Mobile tab to toggle between using an online map source or locally stored map layers over a desired area."
    Given the Mobile tab is open
    When the operator toggles to Local
    Then intent "com.atakmap.android.maps.SELECT_LAYER" should choose a local tileset
    And MapOverlay should render that imagery
    And preference "map_scale_visible" should keep the map scale widget in view

  Scenario: Save a local copy of a map layer
    # SUM: "To save a local copy of a map layer, choose the MOBILE tab and toggle to [Online]. Select the right arrow to expand the Map Source option, then tap [Select Area] to define a region of interest."
    Given the Mobile tab is Online
    When the operator Select Area as Rectangle and downloads
    Then intent "com.atakmap.android.layers.SCAN_LAYERS_START" should scan the new tileset
    And ProgressBar should show download progress
    And CoT type "b-m-p-s-p-loc" should not be created for the tileset itself

  Scenario: Zoom to a layer
    # SUM: "When the user selects a layer from the list, map source data corresponding to that downloaded layer will be used as the source for map data."
    Given local layer "sector-north" is listed
    When the operator chooses that layer
    Then intent "com.atakmap.android.maps.ZOOM_TO_LAYER" should fit its bounds
    And preference "prefs_layer_grg_map_interaction" should allow GRG interaction when a GRG is selected

  Scenario: Layer scan failure does not drop loaded imagery
    # SUM: "If [Show All] is checked, all the layers are shown. Otherwise, only layers that are visible in the current map screen will be displayed."
    Given a file is not a supported imagery type
    When intent "com.atakmap.android.maps.ERROR_LOADING_LAYERS" is received
    Then that file should not appear as a selectable layer
    And already-loaded MapOverlay layers should stay available
    And a CoT type "a-f-G-U-C" SA marker should be unaffected

  Scenario: Bookmark the current view on FAVS
    # SUM: "To save the current view and displayed imagery, select the FAVS tab and tap Add Current View. A prompt will appear to name the view, which will be saved along with its coordinates and the map source being used."
    Given the FAVS tab is open
    When the operator taps Add Current View and names it "CP NORTH"
    Then ListView should list that favorite
    And CoordinateDisplay should store the coordinates with the map source
    And preference "map_scale_visible" should still show scale after the save

  Scenario: Add WFS imagery from a service URL
    # SUM: "WFS Imagery can be added by selecting the right arrow at the bottom of the Maps & Favorites Mobile tab to expand the Map Source option, selecting + and then entering a WFS Imagery Service URL."
    Given the Mobile tab Map Source is expanded
    When the operator enters a WFS Imagery Service URL and selects services
    Then intent "com.atakmap.android.layers.SCAN_LAYERS_START" should ingest those sets
    And MapOverlay should render the selected WFS imagery
    And intent "com.atakmap.app.ZEROIZE_CONFIRMED" should still be able to delete WFS configs later

  Scenario: Open ATAK Dataset Instructions from Support
    # SUM: "To view the list of supported products, select Settings > Support > ATAK Documents > ATAK Dataset Instructions."
    Given Settings > Support is open
    When the operator opens ATAK Dataset Instructions
    Then DialogPanel should list supported imagery types
    And preference "atakdocs" should reach ATAK Documents
    And MapOverlay should keep current layers loaded

  Scenario: Redeploy WMS sources and smart cache
    # SUM: "Imagery can be imported via the Import Manager tool or placed directly into the atak folder structure for use by the application."
    Given Maps and Favorites is open
    When the operator redeploys WMS sources
    Then preference "redeploywms" should refresh WMS listings
    And preference "prefs_enable_smart_cache" should govern tile caching
    And intent "com.atakmap.android.layers.SCAN_LAYERS_START" should rescan those services
