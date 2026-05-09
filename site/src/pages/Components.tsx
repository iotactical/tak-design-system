// rtmx:req REQ-XW-091
import { Link } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import styles from './Components.module.css';

// Live component imports from source
import { Button } from '@tak-react/components/Button';
import { ToolBar } from '@tak-react/components/ToolBar';
import { EditText } from '@tak-react/components/EditText';
import { Checkbox } from '@tak-react/components/Checkbox';
import { Toggle } from '@tak-react/components/Toggle';
import { ProgressBar } from '@tak-react/components/ProgressBar';
import { ConnectionStatus } from '@tak-react/components/ConnectionStatus';
import { GPSStatus } from '@tak-react/components/GPSStatus';
import { CoordinateDisplay } from '@tak-react/components/CoordinateDisplay';
import { RangeBearing } from '@tak-react/components/RangeBearing';
import { ScaleBar, CompassHeading } from '@tak-react/components/MapOverlay';

const previews: Record<string, ReactNode> = {
  Button: (
    <div style={{ display: 'flex', gap: 8 }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
  ToolBar: (
    <ToolBar leading={<span style={{opacity:0.6}}>&#9776;</span>} title="ATAK Toolbar" trailing={<span style={{opacity:0.6}}>&#8942;</span>} />
  ),
  EditText: (
    <div style={{ maxWidth: 260 }}>
      <EditText label="Callsign" placeholder="Enter callsign..." />
    </div>
  ),
  Checkbox: (
    <div style={{ display: 'flex', gap: 16 }}>
      <Checkbox label="GPS Lock" checked onChange={() => {}} />
      <Checkbox label="Disabled" disabled />
    </div>
  ),
  Toggle: (
    <div style={{ display: 'flex', gap: 16 }}>
      <Toggle label="GPS" checked onChange={() => {}} />
      <Toggle label="WiFi" onChange={() => {}} />
    </div>
  ),
  ProgressBar: (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      <ProgressBar value={72} />
      <ProgressBar value={45} variant="small" />
    </div>
  ),
  ConnectionStatus: (
    <div style={{ display: 'flex', gap: 16 }}>
      <ConnectionStatus status="online" label="Server" />
      <ConnectionStatus status="connecting" label="TAK" />
      <ConnectionStatus status="offline" label="Mesh" />
    </div>
  ),
  GPSStatus: (
    <div style={{ display: 'flex', gap: 16 }}>
      <GPSStatus fixType="3d" satellites={12} accuracy={3.2} />
      <GPSStatus fixType="none" />
    </div>
  ),
  CoordinateDisplay: (
    <CoordinateDisplay latitude={38.8977} longitude={-77.0365} format="DD" />
  ),
  RangeBearing: (
    <RangeBearing distance={4250} bearing={127.4} unit="meters" />
  ),
  ScaleBar: (
    <ScaleBar distance={500} unit="metric" />
  ),
  CompassHeading: (
    <CompassHeading heading={127} size={48} />
  ),
};

interface PropInfo {
  name: string;
  type: string;
  required: boolean;
}

interface ComponentInfo {
  name: string;
  description: string;
  props: PropInfo[];
}

interface CategoryGroup {
  category: string;
  components: ComponentInfo[];
}

const componentGallery: CategoryGroup[] = [
  {
    category: 'Layout',
    components: [
      {
        name: 'NavBar',
        description: 'Top navigation bar with menu button, title, search, and action slots.',
        props: [
          { name: 'title', type: 'string', required: false },
          { name: 'onMenuClick', type: '() => void', required: false },
          { name: 'actions', type: 'NavBarAction[]', required: false },
          { name: 'onSearch', type: '(query: string) => void', required: false },
        ],
      },
      {
        name: 'ToolBar',
        description: 'Horizontal toolbar with leading, title, and trailing content slots.',
        props: [
          { name: 'leading', type: 'ReactNode', required: false },
          { name: 'title', type: 'string', required: false },
          { name: 'trailing', type: 'ReactNode', required: false },
        ],
      },
      {
        name: 'DockPane',
        description: 'Collapsible side/bottom panel that docks to an edge of the viewport.',
        props: [
          { name: 'open', type: 'boolean', required: true },
          { name: 'onClose', type: '() => void', required: false },
          { name: 'title', type: 'string', required: false },
          { name: 'position', type: "'left' | 'right' | 'bottom'", required: false },
          { name: 'width', type: 'string | number', required: false },
          { name: 'minimized', type: 'boolean', required: false },
          { name: 'onMinimize', type: '() => void', required: false },
        ],
      },
    ],
  },
  {
    category: 'Inputs',
    components: [
      {
        name: 'Button',
        description: 'Standard action button with primary, secondary, and danger variants.',
        props: [
          { name: 'variant', type: "'primary' | 'secondary' | 'danger'", required: false },
        ],
      },
      {
        name: 'EditText',
        description: 'Text input field with optional label, error message, and icon slots.',
        props: [
          { name: 'label', type: 'string', required: false },
          { name: 'error', type: 'string', required: false },
          { name: 'leading', type: 'ReactNode', required: false },
          { name: 'trailing', type: 'ReactNode', required: false },
        ],
      },
      {
        name: 'Checkbox',
        description: 'Binary toggle checkbox with label support.',
        props: [
          { name: 'checked', type: 'boolean', required: false },
          { name: 'onChange', type: 'ChangeEvent handler', required: false },
          { name: 'label', type: 'string', required: false },
          { name: 'disabled', type: 'boolean', required: false },
        ],
      },
      {
        name: 'Toggle',
        description: 'Switch-style toggle control for on/off states.',
        props: [
          { name: 'checked', type: 'boolean', required: false },
          { name: 'onChange', type: 'ChangeEvent handler', required: false },
          { name: 'label', type: 'string', required: false },
          { name: 'disabled', type: 'boolean', required: false },
        ],
      },
      {
        name: 'Spinner',
        description: 'Dropdown selector for picking from a list of options.',
        props: [
          { name: 'options', type: 'Array<{ value, label }>', required: true },
          { name: 'value', type: 'string', required: false },
          { name: 'onChange', type: 'ChangeEvent handler', required: false },
          { name: 'disabled', type: 'boolean', required: false },
        ],
      },
      {
        name: 'RadioGroup',
        description: 'Group of mutually exclusive radio button options.',
        props: [
          { name: 'options', type: 'RadioOption[]', required: true },
          { name: 'value', type: 'string', required: false },
          { name: 'onChange', type: '(value: string) => void', required: false },
          { name: 'name', type: 'string', required: true },
          { name: 'disabled', type: 'boolean', required: false },
        ],
      },
    ],
  },
  {
    category: 'Data Display',
    components: [
      {
        name: 'ListView',
        description: 'Scrollable list of selectable items with single or multi-select support.',
        props: [
          { name: 'items', type: 'ListItem[]', required: true },
          { name: 'onItemClick', type: '(item: ListItem) => void', required: false },
          { name: 'selectedKeys', type: 'string[]', required: false },
          { name: 'onSelectionChange', type: '(keys: string[]) => void', required: false },
          { name: 'multiSelect', type: 'boolean', required: false },
        ],
      },
      {
        name: 'TabLayout',
        description: 'Tabbed interface for switching between content panels.',
        props: [
          { name: 'tabs', type: 'Tab[]', required: true },
          { name: 'defaultActiveKey', type: 'string', required: false },
          { name: 'activeKey', type: 'string', required: false },
          { name: 'onChange', type: '(key: string) => void', required: false },
        ],
      },
      {
        name: 'ProgressBar',
        description: 'Horizontal progress indicator with default and small variants.',
        props: [
          { name: 'value', type: 'number', required: true },
          { name: 'variant', type: "'default' | 'small'", required: false },
        ],
      },
      {
        name: 'CoordinateDisplay',
        description: 'Formatted display for geographic coordinates in MGRS, DD, DMS, or UTM.',
        props: [
          { name: 'latitude', type: 'number', required: true },
          { name: 'longitude', type: 'number', required: true },
          { name: 'altitude', type: 'number', required: false },
          { name: 'format', type: 'CoordinateFormat', required: false },
          { name: 'onFormatChange', type: '(format) => void', required: false },
        ],
      },
      {
        name: 'RangeBearing',
        description: 'Displays distance and bearing between two geographic points.',
        props: [
          { name: 'distance', type: 'number', required: true },
          { name: 'bearing', type: 'number', required: true },
          { name: 'unit', type: 'DistanceUnit', required: false },
          { name: 'from', type: '{ lat, lng }', required: false },
          { name: 'to', type: '{ lat, lng }', required: false },
        ],
      },
      {
        name: 'MarkerDetail',
        description: 'Detail card for a map marker showing callsign, affiliation, and coordinates.',
        props: [
          { name: 'callsign', type: 'string', required: true },
          { name: 'type', type: 'string', required: false },
          { name: 'affiliation', type: 'MarkerAffiliation', required: false },
          { name: 'coordinate', type: '{ lat, lng }', required: false },
          { name: 'lastUpdate', type: 'Date', required: false },
          { name: 'stale', type: 'boolean', required: false },
          { name: 'actions', type: 'MarkerAction[]', required: false },
          { name: 'icon', type: 'ReactNode', required: false },
        ],
      },
      {
        name: 'UserList',
        description: 'List of team members with online status and role information.',
        props: [
          { name: 'users', type: 'UserEntry[]', required: true },
          { name: 'onUserClick', type: '(user: UserEntry) => void', required: false },
          { name: 'selectedKeys', type: 'string[]', required: false },
          { name: 'onSelectionChange', type: '(keys: string[]) => void', required: false },
          { name: 'filter', type: "'all' | 'online' | 'stale'", required: false },
        ],
      },
    ],
  },
  {
    category: 'Overlay',
    components: [
      {
        name: 'Modal',
        description: 'Centered overlay dialog with backdrop for focused content.',
        props: [
          { name: 'open', type: 'boolean', required: true },
          { name: 'onClose', type: '() => void', required: false },
          { name: 'title', type: 'ReactNode', required: false },
        ],
      },
      {
        name: 'DialogPanel',
        description: 'Structured dialog with title, content area, and action buttons.',
        props: [
          { name: 'open', type: 'boolean', required: true },
          { name: 'onClose', type: '() => void', required: false },
          { name: 'title', type: 'string', required: false },
          { name: 'variant', type: "'standard' | 'alert' | 'fullscreen'", required: false },
          { name: 'actions', type: 'DialogAction[]', required: false },
          { name: 'destructive', type: 'boolean', required: false },
        ],
      },
      {
        name: 'RadialMenu',
        description: 'Circular context menu with configurable sector count and items.',
        props: [
          { name: 'open', type: 'boolean', required: true },
          { name: 'onClose', type: '() => void', required: false },
          { name: 'items', type: 'RadialMenuItem[]', required: true },
          { name: 'position', type: '{ x, y }', required: false },
          { name: 'sectors', type: '4 | 6 | 8', required: false },
        ],
      },
    ],
  },
  {
    category: 'Tactical',
    components: [
      {
        name: 'ChatPanel',
        description: 'Real-time messaging panel with channel switching and unread indicators.',
        props: [
          { name: 'messages', type: 'ChatMessage[]', required: true },
          { name: 'onSend', type: '(text: string) => void', required: false },
          { name: 'channel', type: 'string', required: false },
          { name: 'channels', type: 'string[]', required: false },
          { name: 'onChannelChange', type: '(channel: string) => void', required: false },
          { name: 'unreadCount', type: 'number', required: false },
        ],
      },
      {
        name: 'RoutePlanner',
        description: 'Waypoint-based route planning interface with distance and time estimates.',
        props: [
          { name: 'waypoints', type: 'Waypoint[]', required: true },
          { name: 'onWaypointAdd', type: '(waypoint: Waypoint) => void', required: false },
          { name: 'onWaypointRemove', type: '(index: number) => void', required: false },
          { name: 'onWaypointReorder', type: '(from, to) => void', required: false },
          { name: 'totalDistance', type: 'number', required: false },
          { name: 'estimatedTime', type: 'number', required: false },
        ],
      },
      {
        name: 'NineLineForm',
        description: 'Standardized 9-line CAS briefing form with template-driven fields.',
        props: [
          { name: 'template', type: 'NineLineTemplate', required: true },
          { name: 'values', type: 'Record<string, string>', required: false },
          { name: 'onChange', type: '(field, value) => void', required: false },
          { name: 'onSubmit', type: '(values) => void', required: false },
          { name: 'readOnly', type: 'boolean', required: false },
        ],
      },
      {
        name: 'ScaleBar',
        description: 'Map scale indicator showing distance in metric or imperial units.',
        props: [
          { name: 'distance', type: 'number', required: true },
          { name: 'unit', type: "'metric' | 'imperial'", required: false },
        ],
      },
      {
        name: 'CompassHeading',
        description: 'Compass rose widget displaying current heading in degrees.',
        props: [
          { name: 'heading', type: 'number', required: true },
          { name: 'size', type: 'number', required: false },
        ],
      },
      {
        name: 'ElevationProfile',
        description: 'Elevation chart showing terrain profile along a path.',
        props: [
          { name: 'points', type: 'ElevationPoint[]', required: true },
          { name: 'width', type: 'number', required: false },
          { name: 'height', type: 'number', required: false },
        ],
      },
    ],
  },
  {
    category: 'Status',
    components: [
      {
        name: 'ConnectionStatus',
        description: 'Network connection state indicator with colored status dot.',
        props: [
          { name: 'status', type: "'online' | 'offline' | 'connecting' | 'error'", required: true },
          { name: 'label', type: 'string', required: false },
        ],
      },
      {
        name: 'GPSStatus',
        description: 'GPS fix quality indicator showing fix type, satellites, and accuracy.',
        props: [
          { name: 'fixType', type: "'none' | '2d' | '3d'", required: true },
          { name: 'satellites', type: 'number', required: false },
          { name: 'accuracy', type: 'number', required: false },
        ],
      },
    ],
  },
];

const CATEGORY_TABS = componentGallery.map((g) => g.category);

function ComponentCard({ component }: { component: ComponentInfo }) {
  const preview = previews[component.name];
  return (
    <div className={styles.card}>
      {preview && (
        <div className={styles.previewArea}>
          {preview}
        </div>
      )}
      <h3 className={styles.componentName}>{component.name}</h3>
      <p className={styles.description}>{component.description}</p>
      <div className={styles.propsLabel}>Props</div>
      <ul className={styles.propsList}>
        {component.props.map((prop) => (
          <li
            key={prop.name}
            className={prop.required ? styles.propRequired : styles.prop}
            title={`${prop.name}: ${prop.type}${prop.required ? ' (required)' : ''}`}
          >
            {prop.name}
            {prop.required ? '*' : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Components() {
  useEffect(() => { document.title = 'Components - TAK Design System'; }, []);
  const [activeTab, setActiveTab] = useState(CATEGORY_TABS[0]);

  const totalCount = componentGallery.reduce(
    (sum, group) => sum + group.components.length,
    0
  );

  const activeGroup = componentGallery.find((g) => g.category === activeTab);

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.backLink}>
        &larr; Back to home
      </Link>
      <h1 className={styles.title}>Component Gallery</h1>
      <p className={styles.subtitle}>
        {totalCount} React components from @iotactical/tak-react, grouped by category.
      </p>

      <div className={styles.tabBar}>
        {CATEGORY_TABS.map((cat) => (
          <button
            key={cat}
            className={`${styles.tab} ${activeTab === cat ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {activeGroup && (
        <section className={styles.categorySection}>
          <h2 className={styles.categoryTitle}>{activeGroup.category}</h2>
          <div className={styles.grid}>
            {activeGroup.components.map((comp) => (
              <ComponentCard key={comp.name} component={comp} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
