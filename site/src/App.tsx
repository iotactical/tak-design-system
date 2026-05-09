import { Routes, Route, NavLink } from 'react-router-dom';
import styles from './App.module.css';
import { GlobalSearch } from './components/GlobalSearch';
import Home from './pages/Home';
import Colors from './pages/Colors';
import Typography from './pages/Typography';
import Spacing from './pages/Spacing';
import Components from './pages/Components';
import Icons from './pages/Icons';
import Platforms from './pages/Platforms';
import Palettes from './pages/Palettes';
import Interfaces from './pages/Interfaces';

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
];

export default function App() {
  return (
    <div className={styles.layout}>
      <nav className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandAccent}>TAK</span> Design System
        </div>
        <GlobalSearch />
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
        <div className={styles.sidebarFooter}>v0.1.0</div>
      </nav>
      <main className={styles.content}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/colors" element={<Colors />} />
          <Route path="/typography" element={<Typography />} />
          <Route path="/spacing" element={<Spacing />} />
          <Route path="/components" element={<Components />} />
          <Route path="/icons" element={<Icons />} />
          <Route path="/palettes" element={<Palettes />} />
          <Route path="/platforms" element={<Platforms />} />
          <Route path="/interfaces" element={<Interfaces />} />
        </Routes>
      </main>
    </div>
  );
}
