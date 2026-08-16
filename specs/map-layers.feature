Feature: Map Layer Management
  As a TAK operator
  I need to select scan and toggle map layers
  So that imagery GRGs and overlays can be shown without hiding the COP

  Background:
    Given the TAK application is running
    And at least one offline imagery layer and one GRG are installed

  Scenario: Select an imagery layer
    Given the operator opens the layer manager
    When the operator selects layer "Natural Earth"
    Then the map basemap should switch to "Natural Earth"
    And previously selected imagery should be deselected

  Scenario: Toggle GRG visibility
    Given GRG "airfield-east" is loaded and visible
    When the operator toggles visibility off for "airfield-east"
    Then the GRG should not render on the map
    And the overlay hierarchy entry should show hidden
    When the operator toggles visibility on
    Then the GRG should render at its native georeference

  Scenario: Zoom to a layer extent
    Given layer "sector-north" has a bounding box
    When the operator chooses Zoom To Layer for "sector-north"
    Then the map viewport should fit that bounding box
    And the layer should remain selected

  Scenario: Report scan failure when a layer file is unreadable
    Given the layer scan finds a file that is not a supported tile format
    When the scan finishes
    Then that file should not appear as a selectable layer
    And an error should be recorded for layer loading
    And already-loaded layers should stay available
