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

  Scenario: Create an ellipse with three taps
    # SUM: "To add an Ellipse, select the Ellipse icon, select a location to place the first corner, select another location for the second corner which sets the edge, and finally select a third location to establish depth."
    Given the operator selects the Ellipse icon
    When the operator taps first corner, edge, and depth
    Then a CoT type "u-d-c-e" ellipse should appear
    And intent "com.atakmap.android.maps.DRAWING_DETAILS" should open from Details on RadialMenu
    And MarkerDetail should allow width, length, heading, and height edits

  Scenario: Telestrate on the map then end the session
    # SUM: "Select the Telestrate icon to access the Telestrate toolbar. Selecting the Telestrate icon enables and disables map scrolling by turning telestration on or off. When Telestrate is toggled on, the user is able to free form draw manually or with a stylus."
    Given Drawing Tools is open
    When the operator toggles Telestrate on, draws, and selects End
    Then the session should save as a single multi-polyline
    And intent "com.atakmap.android.maps.DRAWING_EDIT" should allow later line edits
    And MapOverlay should show the telestration at CoT type "u-d-f"

  Scenario: Place a briefing graphic instead of a free-form
    # SUM: "Depending on the specific symbol type selected, the procedure for placing a symbol or graphic shape will be the same as for an ordinary Drawing Tools shape (e.g., free form shape, rectangle, or circle etc.). The shape will draw on the map according to the selected type instead of as an ordinary free form shape."
    Given the operator selected a MIL-STD briefing graphic
    When the operator places it as a free-form
    Then MapOverlay should render the tactical symbol type
    And MarkerDetail should list the graphic type where it can be changed or cleared
    And a CoT type "u-d-f" event should carry that symbol overlay

  Scenario: Minimum Safe Distance around a shape
    # SUM: "Select the Minimum Safe Distance (MSD) radial option to create a zone around a shape that has been previously placed on the map. Use the Range field to specify the distance from the shape’s border that the zone will be created from."
    Given a CoT type "u-d-c-c" circle is on the map
    When the operator sets MSD range and checks Enabled
    Then RadialMenu MSD should draw the zone at that range
    And preference "atakControlShowLabels" should still govern the shape name
    And intent "com.atakmap.android.maps.DRAWING_DETAILS" should keep the parent shape details

  Scenario: Extrude a circle with height into a 3D solid
    # SUM: "Extrude Mode (circle only) can change a circle with a height to a Cone (Down), Cone (Up), Cylinder, Dome, or Sphere. To enable this feature, place the circle and then define a height for the circle in the details."
    Given a CoT type "u-d-c-c" circle has a height set
    When the operator selects Cylinder in Extrude Mode and enables 3D
    Then MapOverlay should render the extrusion
    And intent "com.atakmap.android.maps.TOGGLE_3D" should show the solid
    And MarkerDetail should keep Extrude Mode active
