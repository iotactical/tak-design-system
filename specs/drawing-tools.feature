Feature: Drawing Tools
  Source: ATAK Civilian Software User Manual · Drawing Tools · Create a Shape

  As a TAK operator
  I need Circle, Free Form, Rectangle, Tactical Overlay, and Telestrate as the Software User Manual describes
  So that shapes can be edited, fenced, and sent

  Background:
    Given the TAK application is running
    And the operator opens Drawing Tools on ToolBar

  Scenario: Create a circle with center and radius taps
    # SUM: "To add a Circle, select the [Circle] icon, select a location to place the center point and tap another location for the radius."
    Given the operator selects the [Circle] icon
    When the operator taps a center then a radius point
    Then a CoT type "u-d-c-c" shape should appear
    And intent "com.atakmap.android.maps.DRAWING_DETAILS" should open from [Details] on RadialMenu
    And MarkerDetail should show radius, rings, color, and opacity

  Scenario: Create a free-form shape and close or end it
    # SUM: "To add a Free Form shape, select the [Free Form] icon and then select a location to place the first vertex for the shape; continue to tap to add vertices. Select the initial vertex to close the shape or select [End Shape] to form an open shape."
    Given the operator selects the [Free Form] icon
    When the operator taps 4 vertices and End Shape
    Then a CoT type "u-d-f" polyline should appear
    And intent "com.atakmap.android.maps.DRAWING_EDIT" should enable vertex drag
    And preference "atakControlShowLabels" should govern whether the name label is shown

  Scenario: Rectangle with Tactical Overlay color coding
    # SUM: "Selecting the Tactical Overlay option will allow the user to add tactical color coding to a structure being outlined... The white side of the rectangle represents the front, while black represents the back of a structure."
    Given the operator places a rectangle with three taps
    When the operator checks Tactical Overlay in Details
    Then a CoT type "u-d-r" rectangle should show white/green/red/black sides
    And intent "com.atakmap.android.maps.LABEL_TOGGLE" should toggle dimension labels
    And MapOverlay should render the color coding

  Scenario: Reject a free-form with fewer than two vertices
    # SUM: "Select the [Undo] button to remove the links in sequence."
    Given the operator has placed only one vertex
    When the operator selects [End Shape]
    Then no CoT type "u-d-f" event should be created
    And intent "com.atakmap.android.maps.SHAPE_DELETE" should not run
    And DialogPanel should require additional vertices
