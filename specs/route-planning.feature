Feature: Route Planning and Navigation
  Source: ATAK Civilian Software User Manual · Route Planning and Navigation

  As a TAK operator
  I need Routes list, create, checkpoints, GO, cues, and export as the Software User Manual describes
  So that Navigation appears under Overlay Manager and files land in /atak/export

  Background:
    Given the TAK application is running
    And preference "locationCallsign" is "NAV-01"
    And the operator selects the [Routes] icon

  Scenario: Create a route with map taps and End
    # SUM: "To create a new route, tap on [+], select the route type, and follow the on screen instructions. Select a location on the map to make it part of the route or long press to create Check Points along the route. Select [Undo] to reverse any changes and [End] to complete the Route."
    Given the operator selects [+]
    When the operator taps three map locations and selects [End]
    Then intent "com.atakmap.android.maps.route.EDIT_ROUTE" should finish the route
    And RoutePlanner should list the checkpoints
    And a CoT type "b-m-r" route should appear
    And Overlay Manager should list it under Navigation

  Scenario: Route details GO starts navigation
    # SUM: "Once the [End] button is selected, the route details window opens. Within the Details window, the user can choose to navigate to the route by selecting the [GO] button"
    Given route "ROUTE-ALPHA" exists
    When the operator selects [GO]
    Then intent "com.atakmap.android.maps.START_NAV" should begin navigation
    And RangeBearing-style ETA to the next checkpoint should appear
    And preference "useRouteVoiceCues" should control audible cues

  Scenario: Show All lists only on-screen routes
    # SUM: "If the [Show All] box in the lower right is unchecked, only routes that are visible in the current map screen will be listed."
    Given two routes exist and one is off-screen
    When Show All is unchecked
    Then ListView should omit the off-screen route
    And preference "defaultRouteColor" should still color remaining routes

  Scenario: Export KML or GPX
    # SUM: "The route can be exported to a file in either KML or GPX format. This file will be located in the “/atak/export” folder."
    Given route "ROUTE-ALPHA" exists
    When the operator selects Export as GPX
    Then intent "com.atakmap.android.maps.ROUTE_EXPORT" should write /atak/export
    And the CoT type "b-m-r" waypoints should round-trip

  Scenario: Import from file
    # SUM: "Select the [Import] icon to import a route in one of two ways: either from a file or from a line on the map. Select [Import From File] to navigate to the location of the saved routes (in KML or GPX format)"
    Given a GPX file exists
    When the operator Import From File
    Then intent "com.atakmap.android.maps.ROUTE_IMPORT" should load it
    And Overlay Manager Navigation should list it

  Scenario: End navigation with x
    # SUM: "Selecting the [x] will end navigation."
    Given navigation is active
    When the operator selects [x]
    Then intent "com.atakmap.android.maps.END_NAV" should stop navigation
    And the CoT type "b-m-r" route should remain on the map
