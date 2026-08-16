Feature: Drawing Tools and Tactical Graphics
  As a TAK operator
  I need to draw points lines polygons and tactical graphics
  So that the COP can show shapes that are not standard markers

  Background:
    Given the TAK application is running
    And the map view is displayed
    And the drawing tools are available

  Scenario: Draw a freehand polyline
    Given the operator selects the freehand drawing tool
    When the operator draws a path of at least 3 vertices
    And the operator labels the shape "MSL TRACE"
    Then a polyline should appear on the map
    And the shape should be listed under drawing overlays
    And a CoT shape event should be created

  Scenario: Draw a filled polygon
    Given the operator selects the polygon tool
    When the operator taps 4 vertices and closes the shape
    And the operator sets fill color "Yellow" at 30 percent opacity
    Then a filled polygon should render on the map
    And the CoT detail should include fill color and opacity

  Scenario: Place a MIL-STD-2525 tactical graphic
    Given the operator opens Tactical Graphics
    When the operator selects a company-sized attack arrow
    And the operator places control points on the map
    Then the graphic should render using the MIL-STD-2525 geometry
    And the MarkerDetail panel should show the graphic identity and echelon

  Scenario: Reject a polygon with fewer than 3 vertices
    Given the operator selects the polygon tool
    When the operator taps only 2 vertices and attempts to finish
    Then the polygon should not be created
    And the operator should see that at least 3 vertices are required
    And the map should remain unchanged
