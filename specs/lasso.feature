Feature: Lasso Select
  Source: ATAK Civilian Software User Manual · 19 Lasso Select

  As a TAK operator
  I need to circle map items then export or delete them as the Software User Manual describes
  So that a region of the COP can be shared or cleared without multi-select in Overlay Manager

  Background:
    Given the TAK application is running
    And map items exist in the current view

  Scenario: Draw a circle to list map items
    # SUM: "When the tool is launched, onscreen directions are displayed in green, providing instructions how to use the tool. Draw a circle around the area of interest to display a list of all the map items in the area."
    Given the operator launched Lasso from ToolBar
    When the operator draws a circle around the area of interest
    Then ListView should list the map items in that area
    And DialogPanel should show the green onscreen directions until the lasso is drawn
    And a CoT type "a-f-G-U-C" self SA marker should remain listed if it is inside the circle

  Scenario: Export lassoed items as a Data Package
    # SUM: "Selecting Export displays the Select Export Format Screen. The available formats are Attachments, Data Package, GPX, KML, KMZ, Shapefile or Video."
    Given items are selected in the lasso list
    When the operator chooses Export and Data Package
    Then intent "com.atakmap.android.missionpackage.MISSIONPACKAGE_SAVE" should write the package
    And ProgressBar should report export completion
    And preference "missionpackagePreference" should apply size and send options

  Scenario: Delete lassoed items after confirmation
    # SUM: "Select Delete and verify by selecting OK on the confirmation screen. This will remove the selected items from the map."
    Given items are selected in the lasso list
    When the operator chooses Delete and confirms OK
    Then intent "com.atakmap.android.importexport.DELETE_DATA" should remove those items
    And MapOverlay should no longer render them
    And a CoT type "a-f-G-U-C" self marker should not be deleted

  Scenario: Empty lasso does not delete the COP
    # SUM: "Tap Select when all individual items have been chosen."
    Given the lasso circle contains no items
    When the operator taps Select
    Then ListView should show an empty selection
    And intent "com.atakmap.android.importexport.DELETE_DATA" should not run
    And RadialMenu should not open for a missing item
