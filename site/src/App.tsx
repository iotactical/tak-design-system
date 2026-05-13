// rtmx:req REQ-XW-201
// rtmx:req REQ-XW-263
import { lazy, Suspense, useState, useCallback } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import styles from './App.module.css';
import { GlobalSearch } from './components/GlobalSearch';
import { VersionSelector } from './components/VersionSelector';
import Home from './pages/Home';

const Colors = lazy(() => import('./pages/Colors'));
const Typography = lazy(() => import('./pages/Typography'));
const Spacing = lazy(() => import('./pages/Spacing'));
const Components = lazy(() => import('./pages/Components'));
const Icons = lazy(() => import('./pages/Icons'));
const Platforms = lazy(() => import('./pages/Platforms'));
const Palettes = lazy(() => import('./pages/Palettes'));
const Interfaces = lazy(() => import('./pages/Interfaces'));
const Explorer = lazy(() => import('./pages/Explorer'));
const MultipointGallery = lazy(() => import('./pages/MultipointGallery'));
const SearchResults = lazy(() => import('./pages/SearchResults'));

const navItems = [
  { to: '/', label: 'Overview' },
  { to: '/colors', label: 'Colors' },
  { to: '/typography', label: 'Typography' },
  { to: '/spacing', label: 'Spacing' },
  { to: '/components', label: 'Components' },
  { to: '/icons', label: 'Icons' },
  { to: '/palettes', label: 'Palettes' },
  { to: '/platforms', label: 'Platforms' },
  { to: '/interfaces', label: 'Interfaces' },
  { to: '/multipoint', label: 'Multi-Point' },
  { to: '/explorer', label: '2525 Explorer' },
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className={styles.layout}>
      <a href="#main-content" className={styles.skipLink}>Skip to main content</a>
      <div
        className={`${styles.backdrop} ${sidebarOpen ? styles.backdropVisible : ''}`}
        onClick={closeSidebar}
      />
      <nav className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <span className={styles.brandAccent}>TAK</span> Design System
        </div>
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                }
                onClick={closeSidebar}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <VersionSelector />
        <div className={styles.sidebarFooter}>v0.1.0</div>
      </nav>
      <div className={styles.topBar}>
        <button
          className={styles.hamburger}
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          &#9776;
        </button>
        <GlobalSearch />
      </div>
      <main id="main-content" className={styles.content}>
        <Suspense fallback={<div className={styles.page} style={{ padding: '48px 0', color: '#878787' }}>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/colors" element={<Colors />} />
            <Route path="/typography" element={<Typography />} />
            <Route path="/spacing" element={<Spacing />} />
            <Route path="/components/:tab?" element={<Components />} />
            <Route path="/icons" element={<Icons />} />
            <Route path="/palettes/:tab?" element={<Palettes />} />
            <Route path="/platforms" element={<Platforms />} />
            <Route path="/interfaces/:tab?" element={<Interfaces />} />
            <Route path="/multipoint" element={<MultipointGallery />} />
            <Route path="/explorer/:tab?" element={<Explorer />} />
            <Route path="/search" element={<SearchResults />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
