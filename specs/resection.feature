Feature: Resection Tool
  Source: ATAK Civilian Software User Manual · 24 Resection Tool

  As a TAK operator
  I need estimated self location from landmarks as the Software User Manual describes
  So that a GPS-denied team still broadcasts an SA position

  Background:
    Given the TAK application is running
    And GPS is not providing a valid fix

  Scenario: Place landmarks and adjust bearing
    # SUM: "From their position, the user identifies and places a series of landmark points on the map. As each landmark point is placed via the point dropper icon, a compass is displayed allowing the user to adjust the bearing from their position to the landmark."
    Given the operator opened Resection
    When the operator places a landmark with the point dropper
    Then intent "com.atakmap.android.resection.SET_LANDMARK" should record the point
    And intent "com.atakmap.android.resection.SET_BEARING" should accept the compass bearing
    And GPSStatus should still show no fix

  Scenario: Plot intersection after two landmarks
    # SUM: "When two or more landmark points have been placed, an intersection point is computed and displayed in the intersection field. Select the Plot Intersection icon to place a marker on the map at the current intersection point."
    Given two landmarks have bearings
    When the operator selects Plot Intersection
    Then a marker labeled with the device callsign should appear at the intersection
    And intent "com.atakmap.android.resection.SHOW_DROPDOWN" should keep the Resection panel open
    And MarkerDetail should show that intersection

  Scenario: Clear all landmarks
    # SUM: "To delete all landmark points that have been placed on the map, select the Clear Landmarks icon and confirm the deletion of all landmark points."
    Given three landmarks are on the map
    When the operator selects Clear Landmarks and confirms
    Then the intersection field should be empty
    And RadialMenu Delete on one landmark should no longer be needed
    And preference "locationCallsign" should still caption a later plotted marker

  Scenario: Update Self-Marker from the resection estimate
    # SUM: "When finished estimating a new location, select the Back button to exit the tool. A dialog will appear with the option to update the Self-Marker location. Select Yes to update the Self-Marker to the new resection estimate and have that location broadcast in a SA message to other users on the network."
    Given an intersection marker has been plotted
    When the operator selects Back and Yes
    Then intent "com.atakmap.andrdoid.resection.RESECTION_WORFLOW" should complete
    And a CoT type "a-f-G-U-C" SA message should broadcast the new location
    And SkittleMarker should move to that estimate
