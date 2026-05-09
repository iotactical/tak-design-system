Feature: Team Member Management
  As a TAK team lead
  I need to organize operators into teams and manage their status
  So that I can coordinate tactical operations effectively

  Background:
    Given the TAK application is running
    And the operator is authenticated with callsign "LEAD-01"
    And a connection to a TAK Server is established

  Scenario: Set team color for an operator
    Given the operator "LEAD-01" is on team "Unassigned"
    When the operator opens the team settings panel
    And the operator selects team color "Cyan"
    Then the operator's team affiliation should update to "Cyan"
    And the operator's map icon should display with a cyan indicator
    And a CoT SA message should be broadcast with team color "Cyan"

  Scenario: Discover team members on the network
    Given the TAK Server has 5 connected operators
    And 3 operators are on team "Cyan" and 2 are on team "Yellow"
    When the operator opens the contacts list
    Then the contacts list should display 5 team members
    And each contact should show their callsign and team color
    And each contact should show their last known position age

  Scenario: View the team roster
    Given the following operators are connected:
      | callsign  | team   | status |
      | ALPHA-01  | Cyan   | active |
      | BRAVO-02  | Cyan   | active |
      | CHARLIE-03| Yellow | stale  |
    When the operator opens the roster view
    Then the roster should list 3 operators
    And operators should be grouped by team color
    And each entry should display callsign, team, and status

  Scenario: Filter roster by online and stale status
    Given the roster contains 5 active and 3 stale team members
    When the operator applies the filter "Active Only"
    Then the roster should display 5 entries
    And no stale operators should appear in the filtered list
    When the operator applies the filter "Stale Only"
    Then the roster should display 3 entries
    And all displayed operators should have status "stale"

  Scenario: Team member goes stale
    Given operator "BRAVO-02" last reported position 120 seconds ago
    And the stale threshold is configured to 120 seconds
    When the stale check timer fires
    Then operator "BRAVO-02" status should change to "stale"
    And the roster entry for "BRAVO-02" should show a stale badge
    And the map icon for "BRAVO-02" should show reduced opacity

  Scenario: Assign a role to a team member
    Given operator "ALPHA-01" is on team "Cyan"
    When the team lead selects operator "ALPHA-01" from the roster
    And the team lead assigns role "Team Lead" to "ALPHA-01"
    Then the roster entry for "ALPHA-01" should display role "Team Lead"
    And the CoT SA message for "ALPHA-01" should include role "Team Lead"
    And the map icon for "ALPHA-01" should display the team lead indicator
