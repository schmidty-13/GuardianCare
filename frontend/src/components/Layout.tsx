import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function useSidebarStatus() {
  const [uptime, setUptime] = useState('0h 00m');
  useEffect(() => {
    const start = Date.now();
    const t = setInterval(() => {
      const d = Date.now() - start;
      const h = Math.floor(d / 3600000);
      const m = Math.floor((d % 3600000) / 60000);
      setUptime(`${h}h ${String(m).padStart(2, '0')}m`);
    }, 60000);
    return () => clearInterval(t);
  }, []);
  return { uptime, online: true };
}

export default function Layout() {
  const { uptime, online } = useSidebarStatus();

  return (
    <div className="app-with-sidebar">
      <Sidebar
        modelVersion="v0.3.1"
        uptime={uptime}
        online={online}
      />
      <main className="app-main-wrap">
        <Outlet />
      </main>
    </div>
  );
}
