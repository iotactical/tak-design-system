Feature: Vehicle Models and sensor FOV
  Source: ATAK Civilian Software User Manual · 2 Placement · Point Dropper · Vehicle Models

  As a TAK operator
  I need to-scale vehicle models and optional sensor FOV as the Software User Manual describes
  So that 3D objects and camera cones match Rubber Sheet editing

  Background:
    Given the TAK application is running
    And the operator opens Point Dropper

  Scenario: Place a Vehicle Models icon
    # SUM: "The Vehicle Models iconset places to-scale 3D models of the selected icon."
    Given the Vehicle Models iconset is selected
    When the operator places a vehicle on the map
    Then MapOverlay should render a to-scale 3D model
    And intent "com.atakmap.android.maps.ROTATE" should turn the model from RadialMenu
    And a CoT type "a-f-G-U-C" unit marker should publish at that location

  Scenario: Edit a vehicle model like a rubber sheet
    # SUM: "If the Edit option is selected, modifications to the model can be made in the same manner as the Rubber Sheet feature."
    Given a vehicle model is selected
    When the operator selects Edit
    Then intent "com.atakmap.android.maps.DRAWING_EDIT" should resize and rotate it
    And intent "com.atakmap.android.vehicle.overhead.DETAILS" should open overhead details
    And preference "atakControlShowLabels" should still govern the name label

  Scenario: Toggle vehicle labels
    # SUM: "The Free Rotate / 3D View allows the user to quickly access the map rotation and 3D view of the Vehicle Model or other objects on the map."
    Given a vehicle model is on the map
    When the operator toggles the label
    Then intent "com.atakmap.android.maps.TOGGLE_LABEL" should hide or show the caption
    And intent "com.atakmap.android.maps.TOGGLE_3D" should still be available from Free Rotate
    And MarkerDetail should keep the model name

  Scenario: Enable sensor FOV on a non-vehicle marker
    # SUM: "All markers, except for Mission > BP/HA, Spot Map, and Vehicle Models, can place a FOV on the map by setting the sensor switch to Enabled."
    Given a CoT type "a-f-G-U-C" friendly marker is selected
    When the operator sets the sensor switch to Enabled
    Then MapOverlay should draw the field of view
    And MarkerDetail should expose range, direction, and video source
    And preference "video_dropdown_hidden_disconnect" should hide video if the source drops
