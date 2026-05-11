# TAK Dark Theme

A dark theme for Visual Studio Code inspired by the TAK (Tactical Assault Kit) design system. Military-grade colors optimized for focused, low-distraction development.

## Features

- Dark background with high-contrast text for readability in any environment
- Color palette derived from the TAK design system tokens
- Syntax highlighting tuned for clarity across multiple languages
- Terminal colors matched to the editor theme
- Activity bar, sidebar, and panel colors unified for a cohesive experience

## Screenshots

<!-- TODO: Add screenshots -->

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "TAK Dark Theme"
4. Click Install
5. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
6. Select "Preferences: Color Theme"
7. Choose "TAK Dark"

### From VSIX

1. Download the `.vsix` file from the [Releases](https://github.com/iotactical/tak-design-system/releases) page
2. In VS Code, open Extensions view
3. Click the "..." menu and select "Install from VSIX..."
4. Select the downloaded file

### Manual

1. Copy the `vscode-extension` folder to your VS Code extensions directory:
   - Linux/macOS: `~/.vscode/extensions/tak-dark-theme`
   - Windows: `%USERPROFILE%\.vscode\extensions\tak-dark-theme`
2. Restart VS Code
3. Select the theme via Command Palette

## Color Palette

| Element | Color |
|---------|-------|
| Editor Background | #1A1A1A |
| Sidebar Background | #242424 |
| Status Bar | #1565C0 |
| Focus Border | #2196F3 |
| Error | #F44336 |
| Strings | #81C784 |
| Keywords | #42A5F5 |
| Functions | #FFF176 |
| Numbers | #FFB74D |

## Development

This theme is generated from the TAK Design System W3C design tokens. To regenerate:

```bash
npm run build:vscode
npm run build:vscode-ext
```

## License

MIT
