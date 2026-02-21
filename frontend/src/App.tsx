import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import CsiPage from './pages/CsiPage';
import BreathingRatePage from './pages/BreathingRatePage';
import OccupancyStatusPage from './pages/OccupancyStatusPage';
import EventLogPage from './pages/EventLogPage';
import SystemPage from './pages/SystemPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="csi" element={<CsiPage />} />
          <Route path="breathing-rate" element={<BreathingRatePage />} />
          <Route path="occupancy-status" element={<OccupancyStatusPage />} />
          <Route path="event-log" element={<EventLogPage />} />
          <Route path="system" element={<SystemPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
