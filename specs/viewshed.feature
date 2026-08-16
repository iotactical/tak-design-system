Feature: Viewshed and Elevation Analysis
  As a TAK operator
  I need to compute a viewshed from a point using elevation data
  So that line-of-sight and coverage can be judged on the map

  Background:
    Given the TAK application is running
    And DTED or equivalent elevation data is installed for the current viewport

  Scenario: Compute a viewshed from a marker
    Given a marker "OP ALPHA" exists at a known elevation
    When the operator chooses Viewshed for "OP ALPHA"
    And the operator sets radius 2000 meters and observer height 2 meters
    Then a viewshed overlay should render around "OP ALPHA"
    And visible cells should use a distinct fill from occluded cells

  Scenario: Recompute after moving the observer
    Given a viewshed exists for "OP ALPHA"
    When the operator moves "OP ALPHA" 100 meters north
    And the operator refreshes viewshed
    Then the overlay should recompute from the new position
    And the previous overlay should be replaced

  Scenario: Query elevation under a map tap
    Given elevation data covers the tap point
    When the operator taps the map for elevation
    Then the elevation at that point should display
    And CoordinateDisplay should include the height above ellipsoid or MSL as configured

  Scenario: Report missing elevation coverage
    Given no DTED is installed for the requested area
    When the operator chooses Viewshed
    Then viewshed should not render a false coverage mask
    And the operator should see "Elevation data not available"
