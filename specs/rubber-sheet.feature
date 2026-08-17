Feature: Rubber Sheet
  Source: ATAK Civilian Software User Manual · 27 Rubber Sheet

  As a TAK operator
  I need to georeference 2D imagery and 3D models as the Software User Manual describes
  So that non-rectified products sit on the COP and can be exported

  Background:
    Given the TAK application is running
    And the operator selects the Rubber Sheet icon

  Scenario: Import a 2D image onto the current view
    # SUM: "To import a 2D image, pan and zoom the map to the desired location for the imagery. Select the + icon, select the desired image file to import, then select OK. The image will be displayed on the current map view and listed in the Rubber Sheets section of Overlay Manager."
    Given the map is panned to the target location
    When the operator selects + and confirms an image with OK
    Then intent "com.atakmap.android.importfiles.IMPORT_FILE" should add the sheet
    And MapOverlay should display the image on the current view
    And ListView in Overlay Manager should list it under Rubber Sheets

  Scenario: Edit a 2D rubber sheet like a rectangle
    # SUM: "Select Edit to adjust the size, rotation, and location of the imagery. The controls are the same as for editing Drawing Tools rectangles."
    Given a 2D rubber sheet is selected
    When the operator selects Edit and drags a corner
    Then intent "com.atakmap.android.maps.DRAWING_EDIT" should resize the rectangle
    And RadialMenu should offer End Editing
    And a CoT type "u-d-r" rectangle handle should match the image bounds

  Scenario: Import a 3D model with projection options
    # SUM: "If the model is not geo-rectified, projection options are presented. Choose between ENU (East North Up), with the option to Flip Y/Z, or LLA (Lat, Lon, Alt), then select Import."
    Given the operator chose a non-rectified 3D model
    When the operator selects ENU and Import
    Then MapOverlay should place the model
    And intent "com.atakmap.android.model.SHOW_DETAILS" should open from the model radial
    And preference "prefs_dted_visible" should still provide terrain under the model

  Scenario: Export a rubber sheet as KMZ
    # SUM: "Select Export from the Rubber Sheets’ Details, or Rubber Sheet category in Overlay Manager to export the rubber sheet image as a KMZ file. The exported result is placed in the atak/tools/rubbersheet folder."
    Given a 2D rubber sheet has been georeferenced
    When the operator selects Export
    Then intent "com.atakmap.android.missionpackage.MISSIONPACKAGE_SAVE" should not be required for KMZ
    And ProgressBar should complete the write to rubbersheet
    And DialogPanel should offer to import the KMZ as an image overlay
