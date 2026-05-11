import { Routes, Route, NavLink } from 'react-router-dom';
import styles from './App.module.css';
import { GlobalSearch } from './components/GlobalSearch';
import { VersionSelector } from './components/VersionSelector';
import Home from './pages/Home';
import Colors from './pages/Colors';
import Typography from './pages/Typography';
import Spacing from './pages/Spacing';
import Components from './pages/Components';
import Icons from './pages/Icons';
import Platforms from './pages/Platforms';
import Palettes from './pages/Palettes';
import Interfaces from './pages/Interfaces';
import Explorer from './pages/Explorer';
import SearchResults from './pages/SearchResults';

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
  { to: '/explorer', label: '2525 Explorer' },
];

export default function App() {
  return (
    <div className={styles.layout}>
      <nav className={styles.sidebar}>
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
        <GlobalSearch />
      </div>
      <main className={styles.content}>
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
          <Route path="/explorer/:tab?" element={<Explorer />} />
          <Route path="/search" element={<SearchResults />} />
        </Routes>
      </main>
    </div>
  );
}
