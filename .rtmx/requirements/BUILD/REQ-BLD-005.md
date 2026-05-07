# REQ-BLD-005: VS Code Dark Theme Generation

## Description
Build must produce a valid VS Code theme JSON file.

## Acceptance Criteria
- [ ] platforms/vscode/generated/tak-dark-theme.json exists after build
- [ ] Theme name is "TAK Dark" with type "dark"
- [ ] Editor colors defined (background, foreground, line numbers)
- [ ] UI colors defined (activity bar, status bar, sidebar, panel)
- [ ] Token colors for syntax highlighting defined

## Validation
- **Test**: tests/build/test_vscode.mjs::test_vscode_theme_output
- **Method**: Integration Test
