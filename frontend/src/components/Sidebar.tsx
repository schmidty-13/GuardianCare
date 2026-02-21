import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  IconDashboard,
  IconLive,
  IconEventLog,
  IconSystem,
  IconSettings,
  IconMenu,
} from './SidebarIcons';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: IconDashboard, end: true },
  { to: '/dashboard', label: 'Live Monitoring', icon: IconLive, end: false },
  { to: '/event-log', label: 'Event Log', icon: IconEventLog, end: false },
  { to: '/system', label: 'System Health', icon: IconSystem, end: false },
  { to: '/settings', label: 'Settings', icon: IconSettings, end: false },
];

interface SidebarProps {
  modelVersion?: string;
  uptime?: string;
  online?: boolean;
}

export default function Sidebar({
  modelVersion = 'v0.3.1',
  uptime = '0h 00m',
  online = true,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setCollapsed((c) => !c);
    }
  };

  useEffect(() => {
    const w = collapsed ? 72 : 240;
    document.documentElement.style.setProperty('--sidebar-width', `${w}px`);
  }, [collapsed]);

  return (
    <aside
      className={`sidebar sidebar--clinical ${collapsed ? 'sidebar--collapsed' : ''}`}
      aria-label="Main navigation"
    >
      <div className="sidebar__top">
        <button
          type="button"
          className="sidebar__toggle"
          onClick={() => setCollapsed((c) => !c)}
          onKeyDown={handleKeyDown}
          aria-expanded={!collapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="sidebar__toggle-icon" aria-hidden>
            <IconMenu />
          </span>
        </button>
        <div className="sidebar__brand">
          <NavLink to="/" className="sidebar__logo">
            Invisible Guardian
          </NavLink>
          <p className="sidebar__meta">Model {modelVersion}</p>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Primary">
        <span className="sidebar__section-label" aria-hidden>
          Navigation
        </span>
        <ul className="sidebar__list">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                }
                title={label}
              >
                <span className="sidebar__link-icon" aria-hidden>
                  <Icon />
                </span>
                <span className="sidebar__link-text">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <span className="sidebar__section-label" aria-hidden>
          Status
        </span>
        <div className="sidebar__footer-row">
          <span className="sidebar__footer-label">Uptime</span>
          <span className="sidebar__footer-value">{uptime}</span>
        </div>
        <div className="sidebar__footer-row">
          <span className="sidebar__footer-label">Connection</span>
          <span className="sidebar__footer-value sidebar__status">
            <span
              className={`sidebar__status-dot ${online ? 'sidebar__status-dot--online' : 'sidebar__status-dot--offline'}`}
              aria-hidden
            />
            <span className="sidebar__status-text">{online ? 'Online' : 'Offline'}</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
