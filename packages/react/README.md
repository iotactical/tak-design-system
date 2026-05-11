# @iotactical/tak-react

React component library for the TAK Design System, providing UI components styled for ATAK, WinTAK, iTAK, and WebTAK applications.

## Install

```bash
npm install @iotactical/tak-react
```

## Usage

```jsx
import { Button, NavBar, SkittleMarker } from '@iotactical/tak-react';
import '@iotactical/tak-react/styles';
```

### Theme Setup

Wrap your application with TakThemeProvider to apply TAK design tokens:

```jsx
import { TakThemeProvider } from '@iotactical/tak-react';

function App() {
  return (
    <TakThemeProvider>
      <YourApp />
    </TakThemeProvider>
  );
}
```

## Components

| Component | Description |
|-----------|-------------|
| Button | Standard action button with TAK variants |
| ChatPanel | Messaging interface for team comms |
| Checkbox | Toggle selection control |
| CompassHeading | Directional heading indicator |
| ConnectionStatus | Network/server connection indicator |
| CoordinateDisplay | Lat/lon coordinate formatter |
| DialogPanel | Modal dialog with action buttons |
| DockPane | Dockable side panel |
| EditText | Text input field |
| ElevationProfile | Terrain elevation graph |
| GPSStatus | GPS fix quality indicator |
| ListView | Scrollable item list |
| MapOverlay | Map HUD overlay container |
| MarkerDetail | Point detail/info panel |
| Modal | Overlay modal dialog |
| NavBar | Top navigation bar |
| NineLineForm | 9-line CAS/MEDEVAC form |
| ProgressBar | Determinate progress indicator |
| RadialMenu | Circular context menu |
| RadioGroup | Mutually exclusive option set |
| RangeBearing | Distance and bearing display |
| RoutePlanner | Multi-waypoint route editor |
| ScaleBar | Map scale indicator |
| SkittleMarker | Colored map marker |
| Spinner | Loading indicator |
| TabLayout | Tabbed content panels |
| Toggle | On/off switch |
| ToolBar | Action toolbar |

## License

MIT
