# @iotactical/tak-react

React component library implementing the TAK (Team Awareness Kit) Design System for ATAK and WinTAK user interfaces.

## Install

```bash
npm install @iotactical/tak-react
```

Peer dependencies: `react >= 18.0.0` and `react-dom >= 18.0.0` (React 19 also supported).

## Quick Start

```tsx
import { TakThemeProvider, Button, NavBar, ConnectionStatus } from '@iotactical/tak-react';
import '@iotactical/tak-react/styles';

function App() {
  return (
    <TakThemeProvider defaultMode="dark" density="mobile">
      <NavBar title="Operations" onMenuClick={() => {}} />
      <ConnectionStatus status="online" label="TAK Server" />
      <Button variant="primary" onClick={() => alert('Sent')}>Send</Button>
    </TakThemeProvider>
  );
}
```

## Components

### Layout

#### NavBar

Bottom navigation bar with menu toggle, search input, and configurable action buttons.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onMenuClick` | `() => void` | -- | Callback when the hamburger menu button is clicked |
| `title` | `string` | -- | Title text displayed in the bar |
| `actions` | `NavBarAction[]` | -- | Array of icon action buttons |
| `onSearch` | `(query: string) => void` | -- | Enables search input; called on Enter |
| `children` | `ReactNode` | -- | Additional content rendered in the bar |

**NavBarAction**

| Field | Type | Description |
|-------|------|-------------|
| `key` | `string` | Unique identifier |
| `icon` | `ReactNode` | Icon element |
| `onClick` | `() => void` | Click handler |
| `label` | `string` | Accessible label |

```tsx
<NavBar
  title="Operations"
  onMenuClick={toggleDrawer}
  onSearch={handleSearch}
  actions={[{ key: 'gps', icon: <GpsIcon />, onClick: centerMap, label: 'GPS' }]}
/>
```

#### ToolBar

Horizontal toolbar container with optional leading/trailing slots and a title.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `leading` | `ReactNode` | -- | Left slot content |
| `title` | `string` | -- | Toolbar title text |
| `trailing` | `ReactNode` | -- | Right slot content |

```tsx
<ToolBar title="Markers" trailing={<Button>Add</Button>} />
```

---

### Input

#### Button

ATAK-styled button with support for primary, secondary, and danger variants.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'danger'` | `'primary'` | Visual style variant |

Extends all native `<button>` HTML attributes.

```tsx
<Button variant="danger" onClick={handleDelete}>Delete Marker</Button>
```

#### EditText

Text input field with optional label, error message, and leading/trailing adornments.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | -- | Label text above the input |
| `error` | `string` | -- | Error message shown below the input |
| `leading` | `ReactNode` | -- | Adornment before the input |
| `trailing` | `ReactNode` | -- | Adornment after the input |

Extends all native `<input>` HTML attributes.

```tsx
<EditText label="Callsign" placeholder="Enter callsign" error={errors.callsign} />
```

#### Checkbox

ATAK-styled checkbox input with an optional text label.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | -- | Controlled checked state |
| `onChange` | `(e: ChangeEvent) => void` | -- | Change handler |
| `label` | `string` | -- | Text label beside the checkbox |
| `disabled` | `boolean` | -- | Disabled state |

```tsx
<Checkbox label="Show friendly markers" checked={show} onChange={handleToggle} />
```

#### Toggle

Toggle switch for binary on/off settings, rendered with ATAK dark styling.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | -- | Controlled checked state |
| `onChange` | `(e: ChangeEvent) => void` | -- | Change handler |
| `label` | `string` | -- | Text label beside the toggle |
| `disabled` | `boolean` | -- | Disabled state |

```tsx
<Toggle label="Night mode" checked={nightMode} onChange={handleChange} />
```

#### RadioGroup

Radio button group for single-selection among mutually exclusive options.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `RadioOption[]` | -- | Array of `{ value, label }` options |
| `value` | `string` | -- | Currently selected value |
| `onChange` | `(value: string) => void` | -- | Selection change callback |
| `name` | `string` | -- | HTML radio group name (required) |
| `disabled` | `boolean` | -- | Disabled state |

```tsx
<RadioGroup
  name="affiliation"
  options={[{ value: 'friendly', label: 'Friendly' }, { value: 'hostile', label: 'Hostile' }]}
  value={affiliation}
  onChange={setAffiliation}
/>
```

#### Spinner

Dropdown select spinner for choosing from a list of predefined options.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `Array<{ value: string; label: string }>` | -- | Selectable options |
| `value` | `string` | -- | Controlled selected value |
| `onChange` | `(e: ChangeEvent) => void` | -- | Change handler |
| `disabled` | `boolean` | -- | Disabled state |

```tsx
<Spinner
  options={[{ value: 'mgrs', label: 'MGRS' }, { value: 'dd', label: 'Decimal Degrees' }]}
  value={coordFormat}
  onChange={handleFormatChange}
/>
```

---

### Display

#### ProgressBar

Determinate progress indicator bar that displays a 0-100 percentage fill.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | -- | Progress percentage (0-100) |
| `variant` | `'default' \| 'small'` | `'default'` | Size variant |

```tsx
<ProgressBar value={65} variant="default" />
```

#### ConnectionStatus

Network connection status indicator with a color-coded dot.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `'online' \| 'offline' \| 'connecting' \| 'error'` | -- | Connection state |
| `label` | `string` | -- | Descriptive label text |

```tsx
<ConnectionStatus status="online" label="TAK Server" />
```

#### GPSStatus

GPS fix status indicator showing fix type, satellite count, and positional accuracy.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fixType` | `'none' \| '2d' \| '3d'` | -- | GPS fix quality |
| `satellites` | `number` | -- | Number of visible satellites |
| `accuracy` | `number` | -- | Positional accuracy in meters |

```tsx
<GPSStatus fixType="3d" satellites={12} accuracy={3.5} />
```

#### CoordinateDisplay

Coordinate readout displaying lat/lon/alt in MGRS, DD, DMS, or UTM format. Tap to cycle formats.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `latitude` | `number` | -- | Latitude in decimal degrees |
| `longitude` | `number` | -- | Longitude in decimal degrees |
| `altitude` | `number` | -- | Altitude in meters |
| `format` | `'MGRS' \| 'DD' \| 'DMS' \| 'UTM'` | `'MGRS'` | Controlled display format |
| `onFormatChange` | `(format: CoordinateFormat) => void` | -- | Called when user cycles format |

```tsx
<CoordinateDisplay latitude={34.0522} longitude={-118.2437} altitude={120} format="MGRS" />
```

#### RangeBearing

Range and bearing display showing distance and azimuth between two points.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `distance` | `number` | -- | Distance in meters |
| `bearing` | `number` | -- | Azimuth in degrees (0-360) |
| `unit` | `'meters' \| 'kilometers' \| 'miles' \| 'nautical-miles'` | `'meters'` | Display unit |
| `from` | `{ lat: number; lon: number }` | -- | Origin coordinate |
| `to` | `{ lat: number; lon: number }` | -- | Destination coordinate |

```tsx
<RangeBearing distance={4500} bearing={45.2} unit="meters" />
```

---

### Military

#### SkittleMarker

Color-coded map marker dot (skittle) representing a team member on the COP. Supports arrow and dot variants with heading rotation, team color, and role badge.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `teamColor` | `TeamColor` | `'cyan'` | One of 15 ATAK team colors |
| `heading` | `number` | `0` | Heading in degrees for arrow rotation |
| `state` | `'connected' \| 'stale' \| 'expired'` | `'connected'` | Connectivity state (affects opacity) |
| `role` | `SkittleRole` | -- | Role badge (TM, TL, HQ, SR, MD, FO, RT, K9) |
| `variant` | `'arrow' \| 'dot'` | `'arrow'` | Arrow (directional) or dot (simplified) |
| `affiliation` | `'friendly' \| 'hostile' \| 'neutral' \| 'unknown'` | `'friendly'` | Color for dot variant |
| `size` | `number` | `32` | Pixel size of the marker |

**TeamColor values:** `white`, `yellow`, `orange`, `magenta`, `red`, `maroon`, `purple`, `dark-blue`, `blue`, `cyan`, `teal`, `green`, `dark-green`, `brown`, `pink`

```tsx
<SkittleMarker teamColor="cyan" heading={135} state="connected" role="team-lead" />
```

#### MarkerDetail

Map marker detail view displaying callsign, affiliation, coordinates, staleness, and action buttons.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `callsign` | `string` | -- | Marker callsign (required) |
| `type` | `string` | -- | CoT type string |
| `affiliation` | `MarkerAffiliation` | -- | Affiliation for color coding |
| `coordinate` | `{ lat: number; lon: number; alt?: number }` | -- | Position |
| `lastUpdate` | `Date` | -- | Last received timestamp |
| `stale` | `boolean` | `false` | Whether the track is stale |
| `actions` | `MarkerAction[]` | -- | Action buttons in the footer |
| `icon` | `ReactNode` | -- | Custom icon element |

**MarkerAffiliation values:** `friendly`, `hostile`, `neutral`, `unknown`, `suspect`, `pending`

```tsx
<MarkerDetail
  callsign="BRAVO-6"
  affiliation="friendly"
  coordinate={{ lat: 34.0522, lon: -118.2437 }}
  actions={[{ key: 'pan', label: 'Pan To', onClick: handlePan }]}
/>
```

#### NineLineForm

Structured 9-line CAS request form driven by a template definition.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `template` | `NineLineTemplate` | -- | Form template with line definitions (required) |
| `values` | `Record<string, string>` | -- | Controlled field values |
| `onChange` | `(field: string, value: string) => void` | -- | Field change callback |
| `onSubmit` | `(values: Record<string, string>) => void` | -- | Submit callback |
| `readOnly` | `boolean` | `false` | Read-only mode |

**NineLineTemplate**

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Form title |
| `lines` | `NineLineLine[]` | Line definitions |

**NineLineLine**

| Field | Type | Description |
|-------|------|-------------|
| `number` | `number` | Line number |
| `label` | `string` | Field label |
| `field` | `string` | Field key |
| `type` | `'text' \| 'coordinate' \| 'select'` | Input type |
| `options` | `string[]` | Options for select type |

```tsx
<NineLineForm
  template={{ name: '9-Line CAS', lines: [{ number: 1, label: 'IP/BP', field: 'ip', type: 'text' }] }}
  onSubmit={(values) => sendCasRequest(values)}
/>
```

#### RadialMenu

Radial/pie context menu that displays action items in a circular layout around a center point.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | -- | Visibility state (required) |
| `onClose` | `() => void` | -- | Close callback |
| `items` | `RadialMenuItem[]` | -- | Menu items (required) |
| `position` | `{ x: number; y: number }` | -- | Pixel position for the menu center |
| `sectors` | `4 \| 6 \| 8` | `6` | Number of menu slots |

**RadialMenuItem**

| Field | Type | Description |
|-------|------|-------------|
| `key` | `string` | Unique identifier |
| `icon` | `ReactNode` | Icon element |
| `label` | `string` | Button label |
| `onClick` | `() => void` | Click handler |
| `disabled` | `boolean` | Disabled state |

```tsx
<RadialMenu
  open={menuOpen}
  onClose={() => setMenuOpen(false)}
  position={{ x: 200, y: 300 }}
  items={[{ key: 'delete', label: 'Delete', onClick: handleDelete }]}
/>
```

---

### Map

#### ScaleBar

Map scale bar overlay that renders a proportional distance indicator.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `distance` | `number` | -- | Distance in meters (required) |
| `unit` | `'metric' \| 'imperial'` | `'metric'` | Display unit system |

```tsx
<ScaleBar distance={500} unit="metric" />
```

#### CompassHeading

Compass heading widget displaying the current bearing in degrees and cardinal direction.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `heading` | `number` | -- | Heading in degrees 0-360 (required) |
| `size` | `number` | `54` | Widget size in pixels |

```tsx
<CompassHeading heading={270} size={54} />
```

#### ElevationProfile

SVG elevation profile chart plotting altitude over cumulative distance along a route.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `points` | `ElevationPoint[]` | -- | Array of `{ distance, elevation }` data points (required) |
| `width` | `number` | `200` | SVG width in pixels |
| `height` | `number` | `80` | SVG height in pixels |

```tsx
<ElevationProfile
  points={[{ distance: 0, elevation: 100 }, { distance: 500, elevation: 150 }]}
  width={300}
  height={100}
/>
```

---

### Containers

#### Modal

Modal dialog overlay that renders above the map surface. Closes on Escape key or backdrop click.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | -- | Visibility state (required) |
| `onClose` | `() => void` | -- | Close callback |
| `title` | `ReactNode` | -- | Header title content |

```tsx
<Modal open={isOpen} onClose={() => setOpen(false)} title="Confirm Action">
  <p>Proceed with mission update?</p>
</Modal>
```

#### DialogPanel

Dialog content panel with title bar, focus trap, and configurable action buttons. Supports standard, alert, and fullscreen variants.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | -- | Visibility state (required) |
| `onClose` | `() => void` | -- | Close callback |
| `title` | `string` | -- | Header title |
| `variant` | `'standard' \| 'alert' \| 'fullscreen'` | `'standard'` | Dialog layout variant |
| `actions` | `DialogAction[]` | -- | Footer action buttons |
| `destructive` | `boolean` | `false` | Applies destructive styling |

**DialogAction**

| Field | Type | Description |
|-------|------|-------------|
| `label` | `string` | Button text |
| `onClick` | `() => void` | Click handler |
| `variant` | `'primary' \| 'secondary' \| 'destructive'` | Button style |

```tsx
<DialogPanel
  open={showConfirm}
  onClose={() => setShowConfirm(false)}
  title="Delete Marker"
  actions={[{ label: 'Delete', onClick: handleDelete, variant: 'destructive' }]}
/>
```

#### DockPane

Dockable side panel that slides in from the left, right, or bottom. Supports minimize and close.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | -- | Visibility state (required) |
| `onClose` | `() => void` | -- | Close callback |
| `title` | `string` | -- | Header title |
| `position` | `'left' \| 'right' \| 'bottom'` | `'right'` | Dock position |
| `width` | `string \| number` | `'280px'` | Panel width (or height for bottom) |
| `minimized` | `boolean` | -- | Minimized state |
| `onMinimize` | `() => void` | -- | Minimize toggle callback |

```tsx
<DockPane open={isPaneOpen} onClose={() => setPaneOpen(false)} title="Layer Manager" position="right">
  <ListView items={layers} />
</DockPane>
```

#### TabLayout

Tab navigation layout that switches between content panels. Supports controlled and uncontrolled state.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `Tab[]` | -- | Tab definitions (required) |
| `defaultActiveKey` | `string` | first tab | Initial active tab (uncontrolled) |
| `activeKey` | `string` | -- | Controlled active tab key |
| `onChange` | `(key: string) => void` | -- | Tab change callback |

**Tab**

| Field | Type | Description |
|-------|------|-------------|
| `key` | `string` | Unique identifier |
| `label` | `ReactNode` | Tab header content |
| `content` | `ReactNode` | Tab panel content |

```tsx
<TabLayout tabs={[
  { key: 'details', label: 'Details', content: <MarkerDetail callsign="ALPHA-1" /> },
  { key: 'chat', label: 'Chat', content: <ChatPanel messages={msgs} /> },
]} />
```

#### ListView

Scrollable list with single or multi-select support, icon slots, and three-tier item layout.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `ListItem[]` | -- | List items (required) |
| `onItemClick` | `(item: ListItem) => void` | -- | Item click callback |
| `selectedKeys` | `string[]` | `[]` | Selected item keys |
| `onSelectionChange` | `(keys: string[]) => void` | -- | Selection change callback |
| `multiSelect` | `boolean` | -- | Enable multi-selection |

**ListItem**

| Field | Type | Description |
|-------|------|-------------|
| `key` | `string` | Unique identifier |
| `title` | `string` | Primary text |
| `subtitle` | `string` | Secondary text |
| `tertiary` | `string` | Third line text |
| `icon` | `ReactNode` | Leading icon |
| `action` | `ReactNode` | Trailing action element |

```tsx
<ListView
  items={[{ key: '1', title: 'ALPHA-1', subtitle: 'Friendly' }]}
  selectedKeys={['1']}
  onItemClick={(item) => openDetail(item.key)}
/>
```

#### ChatPanel

Chat message panel with channel selection, auto-scrolling message list, and text input bar.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `messages` | `ChatMessage[]` | -- | Message array (required) |
| `onSend` | `(text: string) => void` | -- | Send callback |
| `channel` | `string` | -- | Active channel name |
| `channels` | `string[]` | -- | Available channels (shows selector) |
| `onChannelChange` | `(channel: string) => void` | -- | Channel switch callback |
| `unreadCount` | `number` | -- | Unread badge count |

**ChatMessage**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique message ID |
| `sender` | `string` | Sender callsign |
| `text` | `string` | Message body |
| `timestamp` | `Date` | Message time |
| `isSelf` | `boolean` | Whether sent by current user |
| `coordinate` | `{ lat: number; lon: number }` | Optional attached location |

```tsx
<ChatPanel
  messages={messages}
  onSend={handleSend}
  channel="Team Alpha"
  channels={['Team Alpha', 'All Chat']}
/>
```

#### RoutePlanner

Route planning panel with ordered waypoint list, leg distances, reorder controls, and distance/ETA summary.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `waypoints` | `Waypoint[]` | -- | Ordered waypoint list (required) |
| `onWaypointAdd` | `(waypoint: Waypoint) => void` | -- | Add callback |
| `onWaypointRemove` | `(index: number) => void` | -- | Remove callback |
| `onWaypointReorder` | `(from: number, to: number) => void` | -- | Reorder callback |
| `totalDistance` | `number` | -- | Total route distance in meters |
| `estimatedTime` | `number` | -- | Estimated time in seconds |

**Waypoint**

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Waypoint name |
| `coordinate` | `{ lat: number; lon: number; alt?: number }` | Position |
| `type` | `'waypoint' \| 'checkpoint' \| 'target'` | Point type |

```tsx
<RoutePlanner
  waypoints={[
    { name: 'SP', coordinate: { lat: 34.05, lon: -118.24 }, type: 'checkpoint' },
    { name: 'OBJ Alpha', coordinate: { lat: 34.08, lon: -118.20 }, type: 'target' },
  ]}
  totalDistance={4500}
  estimatedTime={1800}
  onWaypointRemove={(i) => removeWaypoint(i)}
/>
```

#### UserList

User/team member list with online status indicators, team color dots, and selection support.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `users` | `UserEntry[]` | -- | User entries (required) |
| `onUserClick` | `(user: UserEntry) => void` | -- | User click callback |
| `selectedKeys` | `string[]` | `[]` | Selected user UIDs |
| `onSelectionChange` | `(keys: string[]) => void` | -- | Selection change callback |
| `filter` | `'all' \| 'online' \| 'stale'` | `'all'` | Status filter |

**UserEntry**

| Field | Type | Description |
|-------|------|-------------|
| `uid` | `string` | Unique user ID |
| `callsign` | `string` | Display callsign |
| `team` | `string` | Team name (maps to team color) |
| `role` | `string` | Role label |
| `status` | `'online' \| 'stale' \| 'offline'` | Connection status |
| `lastUpdate` | `Date` | Last seen timestamp |

```tsx
<UserList
  users={[{ uid: '1', callsign: 'ALPHA-1', team: 'cyan', status: 'online' }]}
  onUserClick={(user) => panToUser(user.uid)}
  filter="online"
/>
```

---

## Theme

### TakThemeProvider

Root provider that enables TAK theme tokens and density context for all child components.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | -- | Application content |
| `defaultMode` | `'dark' \| 'light'` | `'dark'` | Initial color mode |
| `density` | `'mobile' \| 'desktop'` | `'mobile'` | UI density (ATAK vs WinTAK) |

```tsx
<TakThemeProvider defaultMode="dark" density="mobile">
  <App />
</TakThemeProvider>
```

**useTakTheme() hook**

Returns `{ mode, setMode, toggle }` for reading and controlling the current theme mode.

```tsx
const { mode, toggle } = useTakTheme();
```

### DensityProvider

Standalone density context provider (automatically included in TakThemeProvider).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | -- | Child content |
| `density` | `'mobile' \| 'desktop'` | `'mobile'` | Target density mode |

**useDensity() hook**

Returns the current `DensityMode` string (`'mobile'` or `'desktop'`).

```tsx
const density = useDensity();
```

---

## Tokens

### takTokens

Typed object of CSS custom property references for use in inline styles or CSS-in-JS.

**Categories:**

| Category | Keys |
|----------|------|
| `button` | `primary`, `secondary`, `danger` (each with `background`, `text`, `borderRadius`, etc.) |
| `toolbar` | `height`, `backgroundDark`, `backgroundLight`, `iconSize`, `iconPadding` |
| `surface` | `backgroundDark`, `backgroundLight`, `primaryDark`, `primaryLight`, `elevatedDark`, `elevatedLight`, `cardDark`, `cardLight` |
| `text` | `primaryDark`, `primaryLight`, `secondaryDark`, `secondaryLight`, `disabledDark`, `disabledLight`, `onAccent`, `coordinate` |
| `accent` | `primary`, `secondary` |
| `affiliation` | `friendly`, `hostile`, `neutral`, `unknown`, `suspect`, `pending` |
| `team` | All 15 ATAK team colors |
| `brand` | `primary`, `secondary`, `text` |
| `status` | `success`, `warning`, `error`, `info` |

```tsx
import { takTokens } from '@iotactical/tak-react';

<div style={{ backgroundColor: takTokens.surface.backgroundDark }}>
  <span style={{ color: takTokens.affiliation.friendly }}>Friendly</span>
</div>
```

### Density Tokens

Pre-defined sizing values for mobile (ATAK touch) and desktop (WinTAK pointer) modes.

```tsx
import { mobileDensity, desktopDensity } from '@iotactical/tak-react';
```

| Token | Mobile | Desktop |
|-------|--------|---------|
| `buttonHeight` | 40 | 32 |
| `listItemHeight` | 44 | 36 |
| `navButtonSize` | 48 | 36 |
| `fontSize` | 14 | 13 |
| `iconSize` | 24 | 20 |

---

## Data (Subpath Exports)

This package bundles structured JSON data files accessible via subpath exports. These are useful for building icon pickers, radial menus, and doctrine-aware components without a separate data dependency.

### Icon Registry

Complete registry of 5,472 TAK icons with stable semantic IDs, SIDC mappings, and SVG paths. Each entry includes a unique `id`, human-readable `name`, `category`, `sidc` (Symbol Identification Code), and vector path data.

```tsx
import icons from '@iotactical/tak-react/data/icons';

// icons is a JSON array of icon entries
// Example entry: { id: "air-fixed-wing", name: "Fixed Wing", category: "air", sidc: "SFAP-----------" }
```

### Icon Index

Flat index for fast icon lookup by ID. Maps icon IDs to their position in the registry array.

```tsx
import iconIndex from '@iotactical/tak-react/data/icons/index';

// iconIndex: { "air-fixed-wing": 0, "air-rotary-wing": 1, ... }
```

### Doctrine Definitions

MIL-STD-2525 control measure definitions including tactical graphics, boundaries, and phase lines. Sourced from SS25 (Silverstar 2525) doctrine specification.

```tsx
import doctrine from '@iotactical/tak-react/data/doctrine';

// Array of control measure definitions with SIDC codes and rendering metadata
```

### Radial Actions

Radial menu action icon definitions used by TAK context menus. Each entry defines an action with its icon path, label, and category for building context-sensitive pie menus.

```tsx
import radial from '@iotactical/tak-react/data/radial';

// Array of radial action definitions
```

### Radial Index

Flat index for radial action lookup by key.

```tsx
import radialIndex from '@iotactical/tak-react/data/radial/index';
```

### JSON Schemas

Validation schemas (JSON Schema draft-07) for all data files. Use these to validate custom or extended data files against the expected structure.

```tsx
import iconSchema from '@iotactical/tak-react/schemas/icons';
import radialSchema from '@iotactical/tak-react/schemas/radial';
import doctrineSchema from '@iotactical/tak-react/schemas/doctrine';
```

---

## TypeScript

All components export their prop interfaces for use in wrapper components and type-safe composition:

```tsx
import type {
  ButtonProps,
  NavBarProps,
  SkittleMarkerProps,
  TakThemeProviderProps,
  DensityMode,
} from '@iotactical/tak-react';
```

Helper types are also exported for supporting data structures:

```tsx
import type {
  NavBarAction,
  ChatMessage,
  ListItem,
  RadialMenuItem,
  Waypoint,
  UserEntry,
  MarkerAction,
  DialogAction,
  Tab,
  RadioOption,
  NineLineTemplate,
  NineLineLine,
  ElevationPoint,
  DensityTokens,
} from '@iotactical/tak-react';
```

---

## License

MIT
