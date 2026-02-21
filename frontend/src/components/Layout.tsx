import { Outlet } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/csi', label: 'CSI' },
  { to: '/breathing-rate', label: 'Breathing' },
  { to: '/occupancy-status', label: 'Occupancy' },
  { to: '/event-log', label: 'Event log' },
  { to: '/system', label: 'System' },
];

export default function Layout() {
  return (
    <div className="app">
      <header className="app-header app-header-nav">
        <div className="app-header-top">
          <NavLink to="/" className="app-title-link">
            <h1 className="app-title">Invisible Guardian</h1>
          </NavLink>
          <nav className="app-nav">
            {NAV.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `app-nav-link${isActive ? ' app-nav-link--active' : ''}`}
                end={to === '/'}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
