// rtmx:req REQ-XW-140
// Test: URL-based routing for all tabs and leaf items
import { readFileSync } from 'fs';
import { strict as assert } from 'assert';

const APP_PATH = 'site/src/App.tsx';
const PALETTES_PATH = 'site/src/pages/Palettes.tsx';
const COMPONENTS_PATH = 'site/src/pages/Components.tsx';
const INTERFACES_PATH = 'site/src/pages/Interfaces.tsx';
const EXPLORER_PATH = 'site/src/pages/Explorer.tsx';

const appSrc = readFileSync(APP_PATH, 'utf-8');
const palettesSrc = readFileSync(PALETTES_PATH, 'utf-8');
const componentsSrc = readFileSync(COMPONENTS_PATH, 'utf-8');
const interfacesSrc = readFileSync(INTERFACES_PATH, 'utf-8');
const explorerSrc = readFileSync(EXPLORER_PATH, 'utf-8');

// --- App.tsx uses :tab? param routes ---

assert.ok(
  appSrc.includes('/palettes/:tab?'),
  'App.tsx should have /palettes/:tab? route',
);
assert.ok(
  appSrc.includes('/components/:tab?'),
  'App.tsx should have /components/:tab? route',
);
assert.ok(
  appSrc.includes('/interfaces/:tab?'),
  'App.tsx should have /interfaces/:tab? route',
);
assert.ok(
  appSrc.includes('/explorer/:tab?'),
  'App.tsx should have /explorer/:tab? route',
);

// --- Each page uses useParams for tab state ---

assert.ok(
  palettesSrc.includes('useParams'),
  'Palettes.tsx should import useParams',
);
assert.ok(
  palettesSrc.includes("const { tab } = useParams()"),
  'Palettes.tsx should destructure tab from useParams',
);
assert.ok(
  palettesSrc.includes('useNavigate'),
  'Palettes.tsx should import useNavigate',
);
assert.ok(
  palettesSrc.includes("navigate(`/palettes/"),
  'Palettes.tsx should navigate to /palettes/<tab>',
);

assert.ok(
  componentsSrc.includes('useParams'),
  'Components.tsx should import useParams',
);
assert.ok(
  componentsSrc.includes("const { tab } = useParams()"),
  'Components.tsx should destructure tab from useParams',
);
assert.ok(
  componentsSrc.includes('useNavigate'),
  'Components.tsx should import useNavigate',
);
assert.ok(
  componentsSrc.includes("navigate(`/components/"),
  'Components.tsx should navigate to /components/<tab>',
);

assert.ok(
  interfacesSrc.includes('useParams'),
  'Interfaces.tsx should import useParams',
);
assert.ok(
  interfacesSrc.includes("const { tab } = useParams()"),
  'Interfaces.tsx should destructure tab from useParams',
);
assert.ok(
  interfacesSrc.includes('useNavigate'),
  'Interfaces.tsx should import useNavigate',
);
assert.ok(
  interfacesSrc.includes("navigate(`/interfaces/"),
  'Interfaces.tsx should navigate to /interfaces/<tab>',
);

assert.ok(
  explorerSrc.includes('useParams'),
  'Explorer.tsx should import useParams',
);
assert.ok(
  explorerSrc.includes("const { tab } = useParams()"),
  'Explorer.tsx should destructure tab from useParams',
);
assert.ok(
  explorerSrc.includes('useNavigate'),
  'Explorer.tsx should import useNavigate',
);
assert.ok(
  explorerSrc.includes("navigate(`/explorer/"),
  'Explorer.tsx should navigate to /explorer/<tab>',
);

// --- Pages should NOT use useState for tab management ---

// Palettes should not have useState for activeTab
assert.ok(
  !palettesSrc.includes("useState('skittles')"),
  'Palettes.tsx should not use useState for tab state',
);

// Components should not use useSearchParams
assert.ok(
  !componentsSrc.includes('useSearchParams'),
  'Components.tsx should not use useSearchParams (replaced by useParams)',
);

// Interfaces should not use useSearchParams
assert.ok(
  !interfacesSrc.includes('useSearchParams'),
  'Interfaces.tsx should not use useSearchParams (replaced by useParams)',
);

// Explorer should not use useSearchParams
assert.ok(
  !explorerSrc.includes('useSearchParams'),
  'Explorer.tsx should not use useSearchParams (replaced by useParams)',
);

assert.ok(
  appSrc.includes('path="/sandbox"'),
  'App.tsx should have /sandbox route',
);
assert.ok(
  appSrc.includes('/explorer/build'),
  'App.tsx should redirect /explorer/build',
);
assert.ok(
  appSrc.includes('Navigate'),
  'App.tsx should use Navigate for the Build relocating redirect',
);
assert.ok(
  appSrc.includes("to: '/sandbox'"),
  'App.tsx navItems should include Sandbox',
);

console.log('PASS: URL-based routing (REQ-XW-140) - all pages use useParams/:tab? routing');
