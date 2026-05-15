// rtmx:req REQ-XW-201
// rtmx:req REQ-XW-263
import { lazy, Suspense, useState, useCallback } from 'react';
import { Routes, Route, NavLink, Link } from 'react-router-dom';
import styles from './App.module.css';
import { GlobalSearch } from './components/GlobalSearch';
import { LoadingCenter } from './components/Spinner';
import { VersionSelector } from './components/VersionSelector';
import Home from './pages/Home';

const SHARE_TEXT = 'TAK Design System -- npm install @iotactical/tak-react';
const SHARE_URL = 'https://iotactical.github.io/tak-design-system/';
const GITHUB_URL = 'https://github.com/iotactical/tak-design-system';

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
const Sources = lazy(() => import('./pages/Sources'));

const navItems = [
  { to: '/colors', label: 'Colors' },
  { to: '/typography', label: 'Typography' },
  { to: '/spacing', label: 'Spacing' },
  { to: '/components', label: 'Components' },
  { to: '/icons', label: 'Icons' },
  { to: '/palettes', label: 'Palettes' },
  { to: '/platforms', label: 'Platforms' },
  { to: '/interfaces', label: 'Interfaces' },
  { to: '/multipoint', label: 'Tactical Graphics' },
  { to: '/explorer', label: '2525 Explorer' },
  { to: '/sources', label: 'Sources' },
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shared, setShared] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({ title: 'TAK Design System', text: SHARE_TEXT, url: SHARE_URL })
        .then(() => { setShared(true); setTimeout(() => setShared(false), 2000); })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(`${SHARE_TEXT}\n${SHARE_URL}`).then(() => {
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      });
    }
  }, []);

  return (
    <div className={styles.layout}>
      <a href="#main-content" className={styles.skipLink}>Skip to main content</a>
      <div
        className={`${styles.backdrop} ${sidebarOpen ? styles.backdropVisible : ''}`}
        onClick={closeSidebar}
      />
      <nav className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <Link to="/" className={styles.brand} onClick={closeSidebar}>
          <span className={styles.brandAccent}>TAK</span> Design System
        </Link>
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
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
        <div className={styles.sidebarFooter}>v0.2.0</div>
      </nav>
      <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={styles.githubLink} aria-label="GitHub repository">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
      </a>
      {/* Floating action buttons -- visible on mobile */}
      <button className={styles.shareFab} onClick={handleShare} aria-label="Share">
        {shared ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth="2" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" strokeWidth="2" />
          </svg>
        )}
      </button>
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
        <Suspense fallback={<div className={styles.page} style={{ padding: '48px 0' }}><LoadingCenter /></div>}>
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
            <Route path="/sources" element={<Sources />} />
            <Route path="/search" element={<SearchResults />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
