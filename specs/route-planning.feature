Feature: Route Planning and Navigation
  As a TAK operator
  I need to plan routes with waypoints and calculate distances
  So that I can navigate and share movement plans with my team

  Background:
    Given the TAK application is running
    And the operator is authenticated with callsign "NAV-01"
    And the route planning tool is selected

  Scenario: Create a route with waypoints
    Given the map view is displayed
    When the operator taps on the map at "38.8977 N, 77.0365 W" to place waypoint "WP-1"
    And the operator taps on the map at "38.9072 N, 77.0369 W" to place waypoint "WP-2"
    And the operator taps on the map at "38.9200 N, 77.0450 W" to place waypoint "WP-3"
    And the operator confirms the route with name "ROUTE-ALPHA"
    Then the route "ROUTE-ALPHA" should appear on the map
    And the route should contain 3 waypoints
    And route segments should be drawn between consecutive waypoints

  Scenario: Calculate total route distance
    Given route "ROUTE-ALPHA" exists with the following waypoints:
      | waypoint | latitude | longitude |
      | WP-1     | 38.8977  | -77.0365  |
      | WP-2     | 38.9072  | -77.0369  |
      | WP-3     | 38.9200  | -77.0450  |
    When the operator opens the route detail panel for "ROUTE-ALPHA"
    Then the total distance should be calculated and displayed in meters
    And each segment distance should be listed individually
    And the total distance should equal the sum of all segment distances

  Scenario: Reorder waypoints in a route
    Given route "ROUTE-ALPHA" has waypoints in order "WP-1, WP-2, WP-3"
    When the operator opens the waypoint list for "ROUTE-ALPHA"
    And the operator drags waypoint "WP-3" to position 1
    Then the waypoint order should update to "WP-3, WP-1, WP-2"
    And the route line on the map should redraw to reflect the new order
    And the total distance should recalculate

  Scenario: Remove a waypoint from a route
    Given route "ROUTE-ALPHA" has 3 waypoints
    When the operator selects waypoint "WP-2" in the waypoint list
    And the operator taps "Remove Waypoint"
    Then the route should contain 2 waypoints
    And waypoint "WP-2" should no longer appear on the map
    And the route line should connect the remaining waypoints directly

  Scenario: Export route as a CoT message
    Given route "ROUTE-ALPHA" exists with 3 waypoints
    When the operator taps "Share Route" on the route detail panel
    And the operator selects destination "TAK Server"
    Then a CoT route message should be transmitted to the TAK Server
    And the CoT message should contain a route element with all waypoint coordinates
    And each waypoint should include its name and sequence number

  Scenario: Estimate travel time for a route
    Given route "ROUTE-ALPHA" has a total distance of 2500 meters
    When the operator sets movement speed to "Foot (5 km/h)"
    Then the estimated travel time should be approximately 30 minutes
    When the operator changes movement speed to "Vehicle (40 km/h)"
    Then the estimated travel time should update to approximately 4 minutes
    And the travel time should display in the route detail panel
